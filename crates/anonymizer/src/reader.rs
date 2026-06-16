use crate::player::{PlayerEntry, ReplayPlayer};
use serde::{Deserialize, Serialize};
use source2_demo::prelude::*;
use std::collections::HashSet;
use std::io::{Read, Seek};

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

        if self
            .players
            .iter()
            .any(|player| player.player_id == player_id)
        {
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

            let Some((hero_id, team_slot)) = players.iter().find_map(|player| {
                let controller = player.controller(ctx).ok()?;

                if controller.get_property("m_nPlayerID").ok()?.u32() == (i as u32) << 1 {
                    Some((player.hero_id, player.team_slot))
                } else {
                    None
                }
            }) else {
                continue;
            };

            if let Some(player) = self
                .players
                .iter_mut()
                .find(|x| x.player_id == (i as u32) << 1)
            {
                player.team_num = team_num;
                player.team_slot = team_slot;
                player.hero_id = hero_id;
            }
        }

        self.hero_handles_loaded = true;

        Ok(())
    }
}

fn replay_read(input_bytes: usize, playback_ticks: i32, players: Vec<ReplayPlayer>) -> ReplayRead {
    let mut players = players;

    players.sort_by_key(|player| player.player_id);

    ReplayRead {
        input_bytes,
        playback_ticks,
        players,
    }
}

pub fn read_replay(input: &[u8]) -> Result<ReplayRead, ParserError> {
    let mut parser = Parser::from_slice(input)?;
    let playback_ticks = parser.replay_info().playback_ticks();
    let reader = parser.register_observer::<ReplayReader>();

    parser.run_to_end()?;

    let players = reader.borrow().players.clone();

    Ok(replay_read(input.len(), playback_ticks, players))
}

#[derive(Default)]
struct EnableEntities {}

#[observer]
#[uses_entities]
impl EnableEntities {}

pub fn quick_scan_replay(input: &[u8]) -> Result<ReplayRead, ParserError> {
    let mut parser = Parser::from_slice(input)?;
    let playback_ticks = parser.replay_info().playback_ticks();

    parser.register_observer::<EnableEntities>();
    parser.jump_to_tick((playback_ticks.max(0) as u32) / 2)?;

    quick_scan_context(parser.context(), input.len(), playback_ticks)
}

pub fn quick_scan_replay_reader<R>(input: R) -> Result<ReplayRead, ParserError>
where
    R: Read + Seek,
{
    let mut parser = Parser::from_reader(input)?;
    let playback_ticks = parser.replay_info().playback_ticks();

    parser.register_observer::<EnableEntities>();
    parser.jump_to_tick(playback_ticks.max(0) as u32)?;

    quick_scan_context(parser.context(), 0, playback_ticks)
}

fn quick_scan_context(
    ctx: &Context,
    input_bytes: usize,
    playback_ticks: i32,
) -> Result<ReplayRead, ParserError> {
    let mut players = vec![];

    for entity in ctx
        .entities()
        .iter()
        .filter(|entity| entity.class().name() == "CDOTAPlayerController")
    {
        let player_id: u32 = property!(entity, "m_nPlayerID");

        if player_id == 1 {
            continue;
        }

        players.push(ReplayPlayer {
            player_id,
            steam_id: property!(entity, "m_steamID"),
            name: property!(entity, "m_iszPlayerName"),
            team_slot: 0,
            team_num: 1,
            hero_id: 0,
        });
    }

    if let Ok(pr) = ctx.entities().get_by_class_name("CDOTA_PlayerResource") {
        let mut entries: Vec<PlayerEntry> = vec![];

        for i in 0..10 {
            let hero_handle: u32 = property!(pr, "m_vecPlayerTeamData.{i:04}.m_hSelectedHero");

            if hero_handle == EMPTY_HANDLE {
                return Ok(replay_read(input_bytes, playback_ticks, players));
            }

            entries.push(PlayerEntry {
                hero_handle,
                hero_id: property!(pr, "m_vecPlayerTeamData.{i:04}.m_nSelectedHeroID"),
                team_slot: property!(pr, "m_vecPlayerTeamData.{i:04}.m_iTeamSlot"),
            });
        }

        let players_len: usize = property!(pr, "m_vecPlayerData");

        for i in 0..players_len {
            let Some((hero_id, team_slot)) = entries.iter().find_map(|entry| {
                let controller = entry.controller(ctx).ok()?;

                if controller.get_property("m_nPlayerID").ok()?.u32() == (i as u32) << 1 {
                    Some((entry.hero_id, entry.team_slot))
                } else {
                    None
                }
            }) else {
                continue;
            };

            if let Some(player) = players
                .iter_mut()
                .find(|player| player.player_id == (i as u32) << 1)
            {
                player.team_num = property!(pr, "m_vecPlayerData.{i:04}.m_iPlayerTeam");
                player.team_slot = team_slot;
                player.hero_id = hero_id;
            }
        }
    }

    Ok(replay_read(input_bytes, playback_ticks, players))
}
