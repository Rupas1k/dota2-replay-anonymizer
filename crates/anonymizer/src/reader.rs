use crate::player::{PlayerEntry, ReplayPlayer};
use serde::{Deserialize, Serialize};
use source2_demo::prelude::*;
use std::collections::HashSet;

const EMPTY_HANDLE: u32 = 16777215;

#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq, Eq)]
pub struct ReplayRead {
    pub input_bytes: usize,
    pub playback_ticks: i32,
    pub players: Vec<ReplayPlayer>,
}

#[derive(Default)]
struct ReplayReader {
    players: Vec<ReplayPlayer>,
    pub handles: HashSet<u32>,
    hero_handles_loaded: bool,
}

#[observer]
#[uses_entities]
impl ReplayReader {
    #[on_entity("CDOTAPlayerController")]
    fn on_player_controller(&mut self, entity: &Entity) -> ObserverResult {
        if self.handles.contains(&entity.handle()) {
            return Ok(());
        }

        let player_id: u32 = property!(entity, "m_nPlayerID");

        if player_id == 1 {
            return Ok(());
        }

        if self.players.iter().any(|player| player.player_id == player_id) {
            self.handles.insert(entity.handle());
            return Ok(());
        
        }

        let steam_id: u64 = property!(entity, "m_steamID");
        let name: String = property!(entity, "m_iszPlayerName");

        self.players.push(ReplayPlayer {
            player_id,
            steam_id,
            name,
            team_slot: 0,
            team_num: 1,
            hero_id: 0,
        });

        self.handles.insert(entity.handle());
        Ok(())
    }

    #[on_tick_start]
    fn on_tick_start(&mut self, ctx: &Context) -> ObserverResult {
        if self.hero_handles_loaded {
            return Ok(());
        }

        let Ok(pr) = ctx.entities().get_by_class_name("CDOTA_PlayerResource") else {
            return Ok(());
        };

        let mut players: Vec<PlayerEntry> = vec![];

        for i in 0..10 {
            let hero_handle: u32 = property!(pr, "m_vecPlayerTeamData.{i:04}.m_hSelectedHero");

            if hero_handle == EMPTY_HANDLE {
                return Ok(());
            }

            let hero_id: u32 = property!(pr, "m_vecPlayerTeamData.{i:04}.m_nSelectedHeroID");
            let team_slot: u32 = property!(pr, "m_vecPlayerTeamData.{i:04}.m_iTeamSlot");

            players.push(PlayerEntry {
                hero_handle,
                hero_id,
                team_slot,
            });
        }

        let players_len: usize = property!(pr, "m_vecPlayerData");

        for i in 0..players_len {
            let team_num: u32 = property!(pr, "m_vecPlayerData.{i:04}.m_iPlayerTeam");
            let _steam_id: u64 = property!(pr, "m_vecPlayerData.{i:04}.m_iPlayerSteamID");

            let Some((hero_id, team_slot)) = players.iter().find_map(|player| {
                let controller = player.controller(ctx).ok()?;

                if controller.get_property("m_nPlayerID").ok()?.u32() == (i as u32) << 1  {
                    Some((player.hero_id, player.team_slot))
                } else {
                    None
                }
            }) else {
                continue;
            };

            self.players.iter_mut().find(|x| x.player_id == (i as u32) << 1).map(|x| {
                x.team_num = team_num;
                x.team_slot = team_slot;
                x.hero_id = hero_id;
            });
        }

        self.hero_handles_loaded = true;

        Ok(())
    }
}

pub fn read_replay(input: &[u8]) -> Result<ReplayRead, ParserError> {
    let mut parser = Parser::from_slice(input)?;
    let playback_ticks = parser.replay_info().playback_ticks();
    let reader = parser.register_observer::<ReplayReader>();

    parser.run_to_end()?;

    let mut players = reader.borrow().players.clone();

    players.sort_by_key(|player| player.player_id);

    Ok(ReplayRead {
        input_bytes: input.len(),
        playback_ticks,
        players,
    })
}
