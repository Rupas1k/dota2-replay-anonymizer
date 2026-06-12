import type { HeroLookup, PlayerProfileLookup, ReplayPlayer } from "./types";
import { playerSlotValue } from "./utils";

export type PlayerTeamKind = "radiant" | "dire" | "neutral";

export type HeroDisplay = {
  name: string;
  slug?: string;
};

export type PlayerGroups = {
  radiant: ReplayPlayer[];
  dire: ReplayPlayer[];
  spectators: ReplayPlayer[];
};

const spectatorHero: HeroDisplay = { name: "Spectator" };

export const normalizePlayerName = (name: string) => name.trim().replace(/\s+/g, " ").toLowerCase();

export function playerTeam(player: ReplayPlayer) {
  if (player.team_num === 2) {
    return "radiant";
  }

  if (player.team_num === 3) {
    return "dire";
  }

  return "spectator";
}

export function groupPlayers(players: ReplayPlayer[]): PlayerGroups {
  const bySlot = (a: ReplayPlayer, b: ReplayPlayer) => playerSlotValue(a) - playerSlotValue(b);
  const byTeamSlot = (a: ReplayPlayer, b: ReplayPlayer) => a.team_slot - b.team_slot;

  return {
    radiant: players.filter((player) => playerTeam(player) === "radiant").sort(byTeamSlot),
    dire: players.filter((player) => playerTeam(player) === "dire").sort(byTeamSlot),
    spectators: players.filter((player) => playerTeam(player) === "spectator").sort(bySlot),
  };
}

export function heroForPlayer(
  player: ReplayPlayer,
  heroesById: Record<number, HeroLookup>,
): HeroDisplay {
  const hero = heroesById[player.hero_id];
  if (hero) {
    return {
      name: hero.name,
      slug: hero.slug,
    };
  }

  return playerTeam(player) === "spectator" ? spectatorHero : { name: "Unknown hero" };
}

export function heroImageUrl(hero: HeroDisplay) {
  if (!hero.slug) {
    return null;
  }

  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${hero.slug}.png`;
}

export function steamProfileUrl(player: ReplayPlayer) {
  if (!player.steam_id || player.steam_id === "0") {
    return null;
  }

  return `https://steamcommunity.com/profiles/${player.steam_id}`;
}

export function proPlayerLabel(profile?: PlayerProfileLookup) {
  if (!profile?.isPro || !profile.proName) {
    return null;
  }

  return `${profile.teamTag ? `${profile.teamTag}.` : ""}${profile.proName}`;
}
