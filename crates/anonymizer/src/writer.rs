use crate::options::{AnonymizeOptions, AnonymizeRules};
use crate::player::is_source_tv;
use source2_demo::prelude::*;
use source2_demo::proto::*;
use source2_demo::writer::*;
use std::io::Cursor;

const ANONYMOUS_NAME: &str = "Anonymous";

const PARTICLES_TO_DROP: u32 = 20;
const EMPTY_HANDLE: u32 = 16777215;

const WARD_MODEL: u64 = 6823511350490192210;
const COURIER_RADIANT_MODEL: u64 = 9433937411225346325;
const COURIER_RADIANT_FLYING_MODEL: u64 = 10757483865954873345;
const COURIER_DIRE_MODEL: u64 = 12228188779730408636;
const COURIER_DIRE_FLYING_MODEL: u64 = 4696866178566912019;
const POOGIE_BASE_MODEL: u64 = 9842468807190508980;

const ENTITY_REWRITE_CLASSES: &[&str] = &[
    "CDOTA_PlayerResource",
    "CDOTAGamerulesProxy",
    "CDOTAPlayerController",
    "CDOTAPlayerPawn",
    "CDOTA_DataRadiant",
    "CDOTA_DataDire",
    "CDOTA_Unit_Courier",
    "CDOTA_NPC_Observer_Ward",
    "CDOTA_NPC_Observer_Ward_TrueSight",
    "CDOTA_Unit_Poogie",
    "CDOTA_BaseNPC_Effigy_Statue",
    "CDOTATeam",
    "CDOTAPlayerPawn",
];

const ENTITY_TRACK_CLASSES: &[&str] = &[
    "CDOTAGamerulesProxy",
    "CDOTAPlayerController",
    "CDOTA_Unit_Courier",
    "CDOTA_Unit_Poogie",
    "CDOTA_DataRadiant",
    "CDOTA_DataDire",
    "CDOTAPlayerPawn",
];

struct ReplayAnonymizer {
    rules: Box<dyn AnonymizeRules>,
    particles_seen: u32,
    messages_added: u32,
}

impl ReplayAnonymizer {
    fn new<R>(rules: R) -> Self
    where
        R: AnonymizeRules + 'static,
    {
        Self {
            rules: Box::new(rules),
            particles_seen: 0,
            messages_added: 0,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum DotaTeam {
    Radiant,
    Dire,
}

impl DotaTeam {
    fn from_entity(entity: &Entity) -> Option<Self> {
        let team_num = entity.get_property("m_iTeamNum").ok()?.u8();

        match team_num {
            2 => Some(Self::Radiant),
            3 => Some(Self::Dire),
            _ => None,
        }
    }

    fn courier_model(self, is_flying: bool) -> u64 {
        match (self, is_flying) {
            (Self::Radiant, false) => COURIER_RADIANT_MODEL,
            (Self::Radiant, true) => COURIER_RADIANT_FLYING_MODEL,
            (Self::Dire, false) => COURIER_DIRE_MODEL,
            (Self::Dire, true) => COURIER_DIRE_FLYING_MODEL,
        }
    }
}

impl ReplayAnonymizer {
    fn replace_if_changed<T>(&mut self, value: T, replacement: T) -> Option<T>
    where
        T: PartialEq,
    {
        if value == replacement {
            None
        } else {
            Some(replacement)
        }
    }

    fn zero<T>(&mut self, value: T) -> Option<T>
    where
        T: Default + PartialEq,
    {
        self.replace_if_changed(value, T::default())
    }

    fn vector_index_from_field_name(&self, field_name: &str) -> u32 {
        field_name
            .split('.')
            .find(|part| part.len() == 4 && part.chars().all(|ch| ch.is_ascii_digit()))
            .unwrap()
            .parse()
            .unwrap()
    }

    fn player_id_from_player_resource_field(&self, field_name: &str) -> u32 {
        self.vector_index_from_field_name(field_name) << 1
    }

    fn should_anonymize_player_resource_field(&self, field_name: &str) -> bool {
        let player_id = self.player_id_from_player_resource_field(field_name);
        self.rules.should_anonymize_player_id(player_id)
    }

    fn should_anonymize_controller(&self, controller: &Entity) -> bool {
        let player_id = controller.get_property("m_nPlayerID").unwrap().u32();

        if player_id == 1 {
            let steam_id = controller.get_property("m_steamID").unwrap().u64();
            return !is_source_tv(steam_id) && self.rules.should_anonymize_steam_id(steam_id);
        }

        self.rules.should_anonymize_player_id(player_id)
    }
}

fn is_flying_courier(courier: &Entity) -> bool {
    courier
        .get_property("m_bFlyingCourier")
        .map(|value| value.bool())
        .unwrap_or(false)
}

fn is_player_team(team: &Entity) -> bool {
    DotaTeam::from_entity(team).is_some()
}

fn is_particle_to_remove(msg: &CUserMsgParticleManager) -> bool {
    msg.create_particle
        .as_ref()
        .is_some_and(|particle| particle.attach_type() == 1)
}

#[rewriter]
impl ReplayAnonymizer {
    #[should_rewrite_entity]
    fn should_rewrite_entity(&mut self, entity: &Entity) -> bool {
        ENTITY_REWRITE_CLASSES.contains(&entity.class().name())
    }

    #[should_track_entity]
    fn should_track_entity(&mut self, entity: &Entity) -> bool {
        ENTITY_TRACK_CLASSES.contains(&entity.class().name())
    }

    #[rewrite_string_table_entry]
    fn rewrite_userinfo_entry(
        &mut self,
        table_name: &str,
        entry: &mut StringTableEntryUpdate,
    ) -> Result<(), ParserError> {
        if table_name == "userinfo" {
            let entry_index = entry.index();
            if let Some(value) = entry.value_mut() {
                let mut player = CMsgPlayerInfo::decode(value.as_slice())?;
                let steam_id = player.steamid();

                if entry_index == 0 || is_source_tv(steam_id) {
                    return Ok(());
                }

                let player_id = (player.userid() as u32) << 1;
                if !self.rules.should_anonymize_player_id(player_id) {
                    return Ok(());
                }

                if self.rules.remove_player_names() {
                    player.name = ANONYMOUS_NAME.to_string().into();
                }

                if self.rules.remove_player_steam_ids() {
                    player.xuid = 0.into();
                    player.steamid = 0.into();
                }

                *value = player.encode_to_vec();
            }
        }

        Ok(())
    }

    #[rewrite_string_table_entry]
    fn rewrite_econ_entry(
        &mut self,
        table_name: &str,
        entry: &mut StringTableEntryUpdate,
    ) -> Result<(), ParserError> {
        if table_name == "EconItems" && self.rules.remove_hero_cosmetics() {
            entry.clear_key();
            entry.clear_value();
        }

        Ok(())
    }

    #[rewrite_field(
        class = "CDOTAGamerulesProxy",
        field = ends_with("m_unMatchID64"),
    )]
    fn match_id(&mut self, value: u32) -> Option<u32> {
        if !self.rules.remove_match_id() {
            return None;
        }

        self.zero(value)
    }

    #[rewrite_field(
        class = "CDOTAGamerulesProxy",
        field = ends_with("m_lobbyGameName"),
    )]
    fn lobby_name(&mut self, value: String) -> Option<String> {
        if !self.rules.remove_lobby_name() {
            return None;
        }

        self.zero(value)
    }

    #[rewrite_field(class = "CDOTATeam", field = "m_szTeamname")]
    fn team_name(&mut self, team: &Entity, value: String) -> Option<String> {
        if !is_player_team(team) || !self.rules.remove_team_name() {
            return None;
        }

        self.zero(value)
    }

    #[rewrite_field(class = "CDOTATeam", field = "m_szTag")]
    fn team_tag(&mut self, team: &Entity, value: String) -> Option<String> {
        if !is_player_team(team) || !self.rules.remove_team_tag() {
            return None;
        }

        self.zero(value)
    }

    #[rewrite_field(class = "CDOTATeam", field = "m_unTournamentTeamID")]
    fn team_id(&mut self, team: &Entity, value: u32) -> Option<u32> {
        if !is_player_team(team) || !self.rules.remove_tournament_team_id() {
            return None;
        }

        self.zero(value)
    }

    #[rewrite_field(
        class = "CDOTATeam",
        field = any(
            "m_ulTeamLogo",
            "m_ulTeamBaseLogo",
            "m_ulTeamBannerLogo",
        ),
    )]
    fn team_logo(&mut self, team: &Entity, value: u64) -> Option<u64> {
        if !is_player_team(team) || !self.rules.remove_team_logo() {
            return None;
        }

        self.zero(value)
    }

    #[rewrite_field(
        class = "CDOTA_PlayerResource",
        field = ends_with("m_iszPlayerName"),
    )]
    fn player_resource_name(&mut self, field_name: &str, value: String) -> Option<String> {
        if !self.rules.remove_player_names() {
            return None;
        }

        if !self.should_anonymize_player_resource_field(field_name) {
            return None;
        }

        self.replace_if_changed(value, ANONYMOUS_NAME.to_string())
    }

    #[rewrite_field(
        class = "CDOTAPlayerController",
        field = ends_with("m_iszPlayerName"),
    )]
    fn player_controller_name(&mut self, controller: &Entity, value: String) -> Option<String> {
        if !self.rules.remove_player_names() {
            return None;
        }

        if !self.should_anonymize_controller(controller) {
            return None;
        }

        self.replace_if_changed(value, ANONYMOUS_NAME.to_string())
    }

    #[rewrite_field(class = "CDOTAPlayerController", field = "m_steamID")]
    fn player_controller_steam_id(&mut self, controller: &Entity, value: u64) -> Option<u64> {
        if !self.rules.remove_player_steam_ids() {
            return None;
        }

        if !self.should_anonymize_controller(controller) {
            return None;
        }

        self.zero(value)
    }

    #[rewrite_field(
        class = "CDOTA_PlayerResource",
        field = ends_with("m_iPlayerSteamID"),
    )]
    fn player_resource_steam_id(&mut self, field_name: &str, value: u64) -> Option<u64> {
        if !self.rules.remove_player_steam_ids() {
            return None;
        }

        if !self.should_anonymize_player_resource_field(field_name) {
            return None;
        }

        self.zero(value)
    }

    #[rewrite_field(
        class = "CDOTA_PlayerResource",
        field = ends_with("m_unSelectedHeroBadgeXP"),
    )]
    fn player_resource_zero_badge(&mut self, field_name: &str, value: u32) -> Option<u32> {
        if !self.rules.remove_selected_hero_badge() {
            return None;
        }

        if !self.should_anonymize_player_resource_field(field_name) {
            return None;
        }

        self.zero(value)
    }

    #[rewrite_field(
        class = "CDOTA_PlayerResource",
        field = ends_with("m_unGuildID"),
    )]
    fn player_resource_zero_guild(&mut self, field_name: &str, value: u32) -> Option<u32> {
        if !self.rules.remove_guild_data() {
            return None;
        }

        if !self.should_anonymize_player_resource_field(field_name) {
            return None;
        }

        self.zero(value)
    }

    #[rewrite_field(
        class = "CDOTA_PlayerResource",
        field = ends_with("m_unGuildLogo"),
    )]
    fn player_resource_zero_guild_logo(&mut self, field_name: &str, value: u64) -> Option<u64> {
        if !self.rules.remove_guild_data() {
            return None;
        }

        if !self.should_anonymize_player_resource_field(field_name) {
            return None;
        }

        self.zero(value)
    }

    #[rewrite_field(
        class = "CDOTA_PlayerResource",
        field = any(
            ends_with("m_unGuildPrimaryColor"),
            ends_with("m_unGuildSecondaryColor"),
        ),
    )]
    fn player_resource_zero_guild_colors(&mut self, field_name: &str, value: u8) -> Option<u8> {
        if !self.rules.remove_guild_data() {
            return None;
        }

        if !self.should_anonymize_player_resource_field(field_name) {
            return None;
        }

        self.zero(value)
    }

    #[rewrite_field(
        class = "CDOTA_PlayerResource",
        field = ends_with("m_unGuildTier"),
    )]
    fn player_resource_zero_guild_tier(&mut self, field_name: &str, value: u8) -> Option<u8> {
        if !self.rules.remove_guild_data() {
            return None;
        }

        if !self.should_anonymize_player_resource_field(field_name) {
            return None;
        }

        self.zero(value)
    }

    #[rewrite_field(
        class = "CDOTA_PlayerResource",
        field = ends_with("m_iRankTier"),
    )]
    fn player_resource_rank_tier(&mut self, field_name: &str, value: i32) -> Option<i32> {
        if !self.rules.remove_rank_tier() {
            return None;
        }

        if !self.should_anonymize_player_resource_field(field_name) {
            return None;
        }

        self.zero(value)
    }

    #[rewrite_field(
        class = "CDOTA_PlayerResource",
        field = ends_with("m_bIsPlusSubscriber"),
    )]
    fn player_resource_plus_subscriber(&mut self, field_name: &str, value: bool) -> Option<bool> {
        if !self.rules.remove_plus_subscriber() {
            return None;
        }

        if !self.should_anonymize_player_resource_field(field_name) {
            return None;
        }

        self.replace_if_changed(value, false)
    }

    #[rewrite_field(
        class = any(
            "CDOTA_DataRadiant",
            "CDOTA_DataDire",
        ),
        field = ends_with("m_iPlayerSteamID"),
    )]
    fn team_player_steam_id(
        &mut self,
        team_data: &Entity,
        field_name: &str,
        value: u64,
    ) -> Option<u64> {
        if !self.rules.remove_player_steam_ids() {
            return None;
        }

        let team_data_index = self.vector_index_from_field_name(field_name);
        let player_id = team_data
            .get_property(&format!("m_vecDataTeam.{team_data_index:04}.m_nPlayerID"))
            .ok()?
            .u32();

        if !self.rules.should_anonymize_player_id(player_id) {
            return None;
        }

        self.zero(value)
    }

    #[rewrite_field(
        class = "CDOTAPlayerController",
        field = starts_with("m_iCursor"),
    )]
    fn remove_cursor_movements(&mut self, controller: &Entity, value: i32) -> Option<i32> {
        if !self.rules.remove_player_mouse_movements() {
            return None;
        }

        if !self.should_anonymize_controller(controller) {
            return None;
        }

        self.zero(value)
    }

    #[rewrite_field(
        class = "CDOTAPlayerPawn",
        field = any(
            ends_with("m_cellX"),
            ends_with("m_cellY"),
            ends_with("m_cellY"),
        ),
    )]
    fn remove_camera_movements(&mut self, pawn: &Entity, value: u16) -> Option<u16> {
        if !self.rules.remove_player_camera_movements() {
            return None;
        }

        let player_id = pawn.get_property("m_nPlayerID").ok()?.u32();

        if !self.rules.should_anonymize_player_id(player_id) {
            return None;
        }

        self.replace_if_changed(value, 128)
    }

    #[rewrite_field(
        class = "CDOTAPlayerPawn",
        field = any(
            ends_with("m_vecX"),
            ends_with("m_vecY"),
            ends_with("m_vecZ"),
        ),
    )]
    fn remove_camera_movements_vec(&mut self, pawn: &Entity, value: f32) -> Option<f32> {
        if !self.rules.remove_player_camera_movements() {
            return None;
        }

        let player_id = pawn.get_property("m_nPlayerID").ok()?.u32();

        if !self.rules.should_anonymize_player_id(player_id) {
            return None;
        }

        self.zero(value)
    }

    #[rewrite_packet_message]
    fn remove_clicks(
        &mut self,
        ctx: &Context,
        msg: CDotaUserMsgSpectatorPlayerUnitOrders,
    ) -> Result<MessageRewrite, ParserError> {
        if !self.rules.remove_player_clicks() {
            return Ok(MessageRewrite::Keep);
        }

        let controller = ctx.entities().get_by_index(msg.entindex() as usize)?;
        let player_id = controller.get_property("m_nPlayerID")?.u32();

        if !self.rules.should_anonymize_player_id(player_id) {
            return Ok(MessageRewrite::Keep);
        }

        Ok(MessageRewrite::Drop)
    }

    #[rewrite_field(
        class = any(
            "CDOTA_NPC_Observer_Ward",
            "CDOTA_NPC_Observer_Ward_TrueSight",
        ),
        field = ends_with("m_hModel"),
    )]
    fn ward_model(&mut self, ward: &Entity, value: u64) -> Option<u64> {
        if !self.rules.remove_ward_cosmetics() {
            return None;
        }

        let player_id = ward.get_property("m_nPlayerOwnerID").ok()?.u32();

        if !self.rules.should_anonymize_player_id(player_id) {
            return None;
        }

        self.replace_if_changed(value, WARD_MODEL)
    }

    #[rewrite_field(
        class = any(
            "CDOTA_NPC_Observer_Ward",
            "CDOTA_NPC_Observer_Ward_TrueSight",
        ),
        field = ends_with("m_flScale"),
    )]
    fn ward_model_scale(&mut self, ward: &Entity, value: f32) -> Option<f32> {
        if !self.rules.remove_ward_cosmetics() {
            return None;
        }

        let player_id = ward.get_property("m_nPlayerOwnerID").ok()?.u32();

        if !self.rules.should_anonymize_player_id(player_id) {
            return None;
        }

        self.replace_if_changed(value, 1.0)
    }

    #[rewrite_field(
        class = "CDOTA_Unit_Courier",
        field = ends_with("m_hModel"),
    )]
    fn courier_model(&mut self, courier: &Entity, value: u64) -> Option<u64> {
        if !self.rules.remove_courier_cosmetics() {
            return None;
        }

        let player_id = courier.get_property("m_nPlayerOwnerID").ok()?.u32();

        if !self.rules.should_anonymize_player_id(player_id) {
            return None;
        }

        let model = DotaTeam::from_entity(courier)?.courier_model(is_flying_courier(courier));
        self.replace_if_changed(value, model)
    }

    #[rewrite_field(
        class = "CDOTA_Unit_Courier",
        field = ends_with("m_flScale"),
    )]
    fn courier_model_scale(&mut self, courier: &Entity, value: f32) -> Option<f32> {
        if !self.rules.remove_courier_cosmetics() {
            return None;
        }

        let player_id = courier.get_property("m_nPlayerOwnerID").ok()?.u32();

        if !self.rules.should_anonymize_player_id(player_id) {
            return None;
        }

        self.replace_if_changed(value, 1.0)
    }

    #[rewrite_field(
        class = "CDOTA_Unit_Poogie",
        field = ends_with("m_hModel"),
    )]
    fn poogie_model(&mut self, poogie: &Entity, value: u64) -> Option<u64> {
        if !self.rules.remove_poogie_cosmetics() {
            return None;
        }

        let player_id = poogie.get_property("m_nPlayerOwnerID").ok()?.u32();

        if !self.rules.should_anonymize_player_id(player_id) {
            return None;
        }

        self.replace_if_changed(value, POOGIE_BASE_MODEL)
    }

    #[rewrite_field(
        class = "CDOTA_BaseNPC_Effigy_Statue",
        field = contains("m_hMyWearables."),
    )]
    fn effigy_wearable_handle(&mut self, effigy: &Entity, value: u32) -> Option<u32> {
        if !self.rules.remove_statue_cosmetics() {
            return None;
        }

        let player_id = effigy
            .get_property("m_iHeroStatueOwnerPlayerID")
            .ok()?
            .u32();

        if !self.rules.should_anonymize_player_id(player_id) {
            return None;
        }

        self.replace_if_changed(value, EMPTY_HANDLE)
    }

    #[rewrite_packet_message]
    fn remove_chat_message(
        &mut self,
        msg: CDotaUserMsgChatMessage,
    ) -> Result<MessageRewrite, ParserError> {
        if !self.rules.remove_chat_messages() {
            return Ok(MessageRewrite::Keep);
        }

        let player_id = (msg.source_player_id() as u32) << 1;

        if !self.rules.should_anonymize_player_id(player_id) {
            return Ok(MessageRewrite::Keep);
        }

        Ok(MessageRewrite::Drop)
    }

    #[rewrite_packet_message]
    fn remove_chat_wheel(
        &mut self,
        msg: CDotaUserMsgChatWheel,
    ) -> Result<MessageRewrite, ParserError> {
        if !self.rules.remove_chat_wheel() {
            return Ok(MessageRewrite::Keep);
        }

        let player_id = (msg.player_id() as u32) << 1;

        if !self.rules.should_anonymize_player_id(player_id) {
            return Ok(MessageRewrite::Keep);
        }

        Ok(MessageRewrite::Drop)
    }

    #[rewrite_packet_message]
    fn remove_map_pings(
        &mut self,
        msg: CDotaUserMsgLocationPing,
    ) -> Result<MessageRewrite, ParserError> {
        if !self.rules.remove_map_pings() {
            return Ok(MessageRewrite::Keep);
        }

        let player_id = (msg.player_id() as u32) << 1;

        if !self.rules.should_anonymize_player_id(player_id) {
            return Ok(MessageRewrite::Keep);
        }

        Ok(MessageRewrite::Drop)
    }

    #[rewrite_packet_message]
    fn remove_map_drawings(
        &mut self,
        msg: CDotaUserMsgMapLine,
    ) -> Result<MessageRewrite, ParserError> {
        if !self.rules.remove_minimap_drawings() {
            return Ok(MessageRewrite::Keep);
        }

        let player_id = (msg.player_id() as u32) << 1;

        if !self.rules.should_anonymize_player_id(player_id) {
            return Ok(MessageRewrite::Keep);
        }

        Ok(MessageRewrite::Drop)
    }

    #[rewrite_packet_message]
    fn remove_combat_log(
        &mut self,
        _msg: CMsgDotaCombatLogEntry,
    ) -> Result<MessageRewrite, ParserError> {
        if !self.rules.remove_combat_log() {
            return Ok(MessageRewrite::Keep);
        }

        Ok(MessageRewrite::Drop)
    }

    #[rewrite_packet_message]
    fn remove_dota_plus_badges(
        &mut self,
        msg: CUserMsgParticleManager,
    ) -> Result<MessageRewrite, ParserError> {
        if !self.particles_seen < PARTICLES_TO_DROP || !is_particle_to_remove(&msg) {
            return Ok(MessageRewrite::Keep);
        }

        self.particles_seen += 1;

        Ok(MessageRewrite::Drop)
    }

    #[rewrite_packet_messages]
    fn promo(
        &mut self,
        ctx: &Context,
        messages: &mut Vec<PacketMessage>,
    ) -> Result<(), ParserError> {
        if self.messages_added > 0 {
            return Ok(());
        }

        let Ok(grp) = ctx.entities().get_by_class_name("CDOTAGamerulesProxy") else {
            return Ok(());
        };

        let game_state = grp.get_property("m_pGameRules.m_nGameState")?.i32();
        if game_state != DotaGameState::DotaGamerulesStatePreGame as i32 {
            return Ok(());
        }

        let mut msg = CDotaUserMsgChatMessage::default();
        msg.message_text = "https://github.com/Rupas1k".to_string().into();
        msg.channel_type = 11.into();

        messages.push(PacketMessage::new(
            EDotaUserMessages::DotaUmChatMessage as i32,
            msg.encode_to_vec(),
        ));

        self.messages_added += 1;

        Ok(())
    }
}

pub(crate) fn anonymize_replay_bytes_with_options(
    input: &[u8],
    options: AnonymizeOptions,
) -> Result<Vec<u8>, ParserError> {
    let output = Cursor::new(Vec::new());
    let mut writer = DemoWriter::from_slice(input, output)?;
    writer.add_rewriter(ReplayAnonymizer::new(options));

    writer.run()?;
    let (_, output) = writer.into_parts();
    Ok(output.into_inner())
}
