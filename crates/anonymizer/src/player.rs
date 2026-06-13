use serde::{Deserialize, Serialize};
use source2_demo::prelude::*;

pub const SOURCE_TV_STEAM_ID_THRESHOLD: u64 = 90000000000000000;

pub fn is_source_tv(steam_id: u64) -> bool {
    steam_id > SOURCE_TV_STEAM_ID_THRESHOLD
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ReplayPlayer {
    pub player_id: u32,
    pub team_slot: u32,
    pub team_num: u32,
    pub hero_id: u32,
    pub name: String,
    pub steam_id: u64,
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
