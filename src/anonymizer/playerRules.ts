import type {
  PlayerProfileLookup,
  PlayerState,
  PlayerStateMap,
  ReplayInspection,
  ReplayPlayer,
  UiOptions,
} from "../types";
import { isLockedPlayer, playerKey } from "../utils";

const normalizeSteamId = (steamId: string) => steamId.trim().toLowerCase();

const steamIdSet = (values: string[]) => new Set(values.map(normalizeSteamId));

type PlayerRuleContext = {
  options: UiOptions;
  player: ReplayPlayer;
  profile?: PlayerProfileLookup;
  includeSteamIds?: Set<string>;
  excludeSteamIds?: Set<string>;
};

export function shouldAnonymizePlayer({
  options,
  player,
  profile,
  includeSteamIds = steamIdSet(options.includeSteamIds),
  excludeSteamIds = steamIdSet(options.excludeSteamIds),
}: PlayerRuleContext) {
  if (isLockedPlayer(player)) {
    return false;
  }

  const steamId = normalizeSteamId(player.steam_id);
  if (excludeSteamIds.has(steamId)) {
    return false;
  }

  if (includeSteamIds.has(steamId)) {
    return true;
  }

  if (player.team_num === 1) {
    if (options.spectatorAnonymizeMode === "includeSpectators") {
      return true;
    }

    if (options.spectatorAnonymizeMode === "excludeSpectators") {
      return false;
    }
  }

  if (profile?.isPro) {
    if (options.proAnonymizeMode === "includePro") {
      return true;
    }

    if (options.proAnonymizeMode === "excludePro") {
      return false;
    }
  }

  return options.playerSelectionMode === "includeAll";
}

export function buildPlayerState({
  inspection,
  options,
  profiles = {},
  previous = {},
}: {
  inspection: ReplayInspection;
  options: UiOptions;
  profiles?: Record<string, PlayerProfileLookup>;
  previous?: PlayerStateMap;
}): PlayerStateMap {
  const includeSteamIds = steamIdSet(options.includeSteamIds);
  const excludeSteamIds = steamIdSet(options.excludeSteamIds);

  return Object.fromEntries(
    inspection.players.map((player) => {
      const key = playerKey(player);
      const anonymize = shouldAnonymizePlayer({
        options,
        player,
        profile: profiles[player.steam_id],
        includeSteamIds,
        excludeSteamIds,
      });
      const state: PlayerState = {
        ...previous[key],
        anonymize,
      };

      return [key, state];
    }),
  );
}
