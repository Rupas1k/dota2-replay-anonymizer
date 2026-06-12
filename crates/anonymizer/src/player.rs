use serde::{Deserialize, Serialize};
use source2_demo::prelude::*;

pub const SOURCE_TV_STEAM_ID_THRESHOLD: u64 = 90000000000000000;

pub fn is_source_tv_steam_id(steam_id: u64) -> bool {
    steam_id > SOURCE_TV_STEAM_ID_THRESHOLD
}

#[derive(Debug, Clone, Copy, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum PlayerTeam {
    Radiant,
    Dire,
    #[default]
    Spectator,
}

pub trait PlayerIdentity {
    fn player_id(&self) -> Option<i32>;
    fn steam_id(&self) -> u64;

    fn has_player_id(&self) -> bool {
        self.player_id().is_some()
    }

    fn is_source_tv(&self) -> bool {
        is_source_tv_steam_id(self.steam_id())
    }

    fn has_steam_id(&self) -> bool {
        self.steam_id() != 0
    }

    fn is_anonymizable(&self) -> bool {
        !self.is_source_tv() && self.has_steam_id()
    }

    fn matches_player_id(&self, player_id: i32) -> bool {
        self.player_id() == Some(player_id)
    }

    fn matches_steam_id(&self, steam_id: u64) -> bool {
        self.steam_id() == steam_id
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ReplayPlayer {
    pub player_id: u32,
    pub team_slot: u32,
    pub team_num: u32,
    pub hero_id: u32,
    pub name: String,
    #[serde(with = "serde_u64_string")]
    pub steam_id: u64,
}

impl PlayerIdentity for ReplayPlayer {
    fn player_id(&self) -> Option<i32> {
        Some(self.player_id as i32)
    }

    fn steam_id(&self) -> u64 {
        self.steam_id
    }

    fn is_source_tv(&self) -> bool {
        is_source_tv_steam_id(self.steam_id)
    }
}

mod serde_u64_string {
    use serde::{Deserialize, Deserializer, Serializer};

    pub fn serialize<S>(value: &u64, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&value.to_string())
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<u64, D::Error>
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
}

pub struct Hero<'a> {
    pub(crate) entity: &'a Entity,
}

impl<'a> From<&'a Entity> for Hero<'a> {
    fn from(value: &'a Entity) -> Self {
        Hero { entity: value }
    }
}

#[derive(Default)]
pub struct PlayerEntry {
    pub(crate) hero_handle: u32,
    pub(crate) hero_id: u32,
    pub(crate) team_slot: u32,
}

impl PlayerEntry {
    pub fn hero<'a>(&self, ctx: &'a Context) -> anyhow::Result<Hero<'a>> {
        let Ok(hero) = ctx.entities().get_by_handle(self.hero_handle as usize) else {
            anyhow::bail!("Hero with handle {} not found", self.hero_handle);
        };

        Ok(Hero::from(hero))
    }

    pub fn controller<'a>(&self, ctx: &'a Context) -> anyhow::Result<&'a Entity> {
        let hero = self.hero(ctx)?;
        let owner = ctx
            .entities()
            .get_by_handle(property!(hero.entity, "m_hOwnerEntity"))?;

        Ok(owner)
    }
}
