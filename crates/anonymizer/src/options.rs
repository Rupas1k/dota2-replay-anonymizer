use serde::{Deserialize, Deserializer};

#[derive(Debug, Clone, Deserialize, PartialEq, Eq)]
#[serde(default)]
pub struct AnonymizeOptions {
    pub players: Vec<PlayerOption>,
    pub player_selection_mode: PlayerSelectionMode,
    #[serde(default, deserialize_with = "deserialize_steam_ids")]
    pub include_steam_ids: Vec<u64>,
    #[serde(default, deserialize_with = "deserialize_steam_ids")]
    pub exclude_steam_ids: Vec<u64>,
    pub remove_combat_log: bool,
    pub remove_match_id: bool,
    pub remove_lobby_name: bool,
    pub remove_chat_messages: bool,
    pub remove_chat_wheel: bool,
    pub remove_map_pings: bool,
    pub remove_minimap_drawings: bool,
    pub remove_dota_plus_badges: bool,
    pub remove_team_name: bool,
    pub remove_team_tag: bool,
    pub remove_tournament_team_id: bool,
    pub remove_team_logo: bool,
    pub remove_player_names: bool,
    pub remove_player_steam_ids: bool,
    pub remove_hero_cosmetics: bool,
    pub remove_courier_cosmetics: bool,
    pub remove_ward_cosmetics: bool,
    pub remove_poogie_cosmetics: bool,
    pub remove_statue_cosmetics: bool,
    pub remove_rank_tier: bool,
    pub remove_plus_subscriber: bool,
    pub remove_guild_data: bool,
    pub remove_player_camera_movements: bool,
    pub remove_player_mouse_movements: bool,
    pub remove_player_clicks: bool,
    pub remove_broadcaster_info: bool,
}

#[derive(Debug, Clone, Copy, Default, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum PlayerSelectionMode {
    #[default]
    IncludeAll,
    ExcludeAll,
}

pub trait AnonymizeRules {
    fn should_anonymize_player_id(&self, player_id: u32) -> bool;
    fn should_anonymize_steam_id(&self, steam_id: u64) -> bool;
    fn remove_combat_log(&self) -> bool;
    fn remove_match_id(&self) -> bool;
    fn remove_lobby_name(&self) -> bool;
    fn remove_chat_messages(&self) -> bool;
    fn remove_chat_wheel(&self) -> bool;
    fn remove_map_pings(&self) -> bool;
    fn remove_minimap_drawings(&self) -> bool;
    fn remove_dota_plus_badges(&self) -> bool;
    fn remove_team_name(&self) -> bool;
    fn remove_team_tag(&self) -> bool;
    fn remove_tournament_team_id(&self) -> bool;
    fn remove_team_logo(&self) -> bool;
    fn remove_player_names(&self) -> bool;
    fn remove_player_steam_ids(&self) -> bool;
    fn remove_hero_cosmetics(&self) -> bool;
    fn remove_courier_cosmetics(&self) -> bool;
    fn remove_ward_cosmetics(&self) -> bool;
    fn remove_poogie_cosmetics(&self) -> bool;
    fn remove_statue_cosmetics(&self) -> bool;
    fn remove_rank_tier(&self) -> bool;
    fn remove_plus_subscriber(&self) -> bool;
    fn remove_guild_data(&self) -> bool;
    fn remove_player_camera_movements(&self) -> bool;
    fn remove_player_mouse_movements(&self) -> bool;
    fn remove_player_clicks(&self) -> bool;
    fn remove_broadcaster_info(&self) -> bool;
}

impl Default for AnonymizeOptions {
    fn default() -> Self {
        Self {
            players: Vec::new(),
            player_selection_mode: PlayerSelectionMode::IncludeAll,
            include_steam_ids: Vec::new(),
            exclude_steam_ids: Vec::new(),
            remove_combat_log: false,
            remove_match_id: true,
            remove_lobby_name: true,
            remove_chat_messages: true,
            remove_chat_wheel: true,
            remove_map_pings: false,
            remove_minimap_drawings: false,
            remove_dota_plus_badges: true,
            remove_team_name: true,
            remove_team_tag: true,
            remove_tournament_team_id: true,
            remove_team_logo: true,
            remove_player_names: true,
            remove_player_steam_ids: true,
            remove_hero_cosmetics: true,
            remove_courier_cosmetics: true,
            remove_ward_cosmetics: true,
            remove_poogie_cosmetics: true,
            remove_statue_cosmetics: true,
            remove_rank_tier: true,
            remove_plus_subscriber: true,
            remove_guild_data: true,
            remove_player_camera_movements: false,
            remove_player_mouse_movements: false,
            remove_player_clicks: false,
            remove_broadcaster_info: true,
        }
    }
}

impl AnonymizeOptions {
    fn has_player_selection(&self) -> bool {
        !self.players.is_empty()
    }

    fn player_by_player_id(&self, player_id: u32) -> Option<&PlayerOption> {
        self.players
            .iter()
            .find(|player| player.player_id == player_id)
    }

    fn player_by_steam_id(&self, steam_id: u64) -> Option<&PlayerOption> {
        self.players
            .iter()
            .find(|player| player.steam_id == steam_id)
    }
}

impl AnonymizeRules for AnonymizeOptions {
    fn should_anonymize_player_id(&self, player_id: u32) -> bool {
        self.player_by_player_id(player_id)
            .map(PlayerOption::should_anonymize)
            .unwrap_or_else(|| !self.has_player_selection())
    }

    fn should_anonymize_steam_id(&self, steam_id: u64) -> bool {
        self.player_by_steam_id(steam_id)
            .map(PlayerOption::should_anonymize)
            .unwrap_or_else(|| !self.has_player_selection())
    }

    fn remove_combat_log(&self) -> bool {
        self.remove_combat_log
    }

    fn remove_match_id(&self) -> bool {
        self.remove_match_id
    }

    fn remove_lobby_name(&self) -> bool {
        self.remove_lobby_name
    }

    fn remove_chat_messages(&self) -> bool {
        self.remove_chat_messages
    }

    fn remove_chat_wheel(&self) -> bool {
        self.remove_chat_wheel
    }

    fn remove_map_pings(&self) -> bool {
        self.remove_map_pings
    }

    fn remove_minimap_drawings(&self) -> bool {
        self.remove_minimap_drawings
    }

    fn remove_dota_plus_badges(&self) -> bool {
        self.remove_dota_plus_badges
    }

    fn remove_team_name(&self) -> bool {
        self.remove_team_name
    }

    fn remove_team_tag(&self) -> bool {
        self.remove_team_tag
    }

    fn remove_tournament_team_id(&self) -> bool {
        self.remove_tournament_team_id
    }

    fn remove_team_logo(&self) -> bool {
        self.remove_team_logo
    }

    fn remove_player_names(&self) -> bool {
        self.remove_player_names
    }

    fn remove_player_steam_ids(&self) -> bool {
        self.remove_player_steam_ids
    }

    fn remove_hero_cosmetics(&self) -> bool {
        self.remove_hero_cosmetics
    }

    fn remove_courier_cosmetics(&self) -> bool {
        self.remove_courier_cosmetics
    }

    fn remove_ward_cosmetics(&self) -> bool {
        self.remove_ward_cosmetics
    }

    fn remove_poogie_cosmetics(&self) -> bool {
        self.remove_poogie_cosmetics
    }

    fn remove_statue_cosmetics(&self) -> bool {
        self.remove_statue_cosmetics
    }

    fn remove_rank_tier(&self) -> bool {
        self.remove_rank_tier
    }

    fn remove_plus_subscriber(&self) -> bool {
        self.remove_plus_subscriber
    }

    fn remove_guild_data(&self) -> bool {
        self.remove_guild_data
    }

    fn remove_player_camera_movements(&self) -> bool {
        self.remove_player_camera_movements
    }

    fn remove_player_mouse_movements(&self) -> bool {
        self.remove_player_mouse_movements
    }

    fn remove_player_clicks(&self) -> bool {
        self.remove_player_clicks
    }

    fn remove_broadcaster_info(&self) -> bool {
        self.remove_broadcaster_info
    }
}

#[derive(Debug, Clone, Default, Deserialize, PartialEq, Eq)]
pub struct PlayerOption {
    pub player_id: u32,
    #[serde(default, deserialize_with = "deserialize_steam_id")]
    pub steam_id: u64,
    pub anonymize: bool,
}

impl PlayerOption {
    fn should_anonymize(&self) -> bool {
        self.anonymize
    }
}

fn deserialize_steam_id<'de, D>(deserializer: D) -> Result<u64, D::Error>
where
    D: Deserializer<'de>,
{
    #[derive(Deserialize)]
    #[serde(untagged)]
    enum Value {
        String(String),
        Number(u64),
    }

    match Value::deserialize(deserializer)? {
        Value::String(value) => value.parse().map_err(serde::de::Error::custom),
        Value::Number(value) => Ok(value),
    }
}

fn deserialize_steam_ids<'de, D>(deserializer: D) -> Result<Vec<u64>, D::Error>
where
    D: Deserializer<'de>,
{
    Vec::<SteamId>::deserialize(deserializer)
        .map(|values| values.into_iter().map(|value| value.0).collect())
}

struct SteamId(u64);

impl<'de> Deserialize<'de> for SteamId {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        deserialize_steam_id(deserializer).map(Self)
    }
}
