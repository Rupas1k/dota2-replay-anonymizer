import type {
  PlayerProfileLookup,
  PlayerState,
  PlayerStateMap,
  ReplayInspection,
  ReplayPlayer,
  UiOptions,
} from "../types";
import { playerKey, steamIdText } from "../utils";

const normalizeSteamId = (steamId: string) => steamId.trim().toLowerCase();

const steamIdSet = (values: string[]) => new Set(values.map(normalizeSteamId).filter(Boolean));

type PlayerRuleContext = {
  options: UiOptions;
  player: ReplayPlayer;
  profile?: PlayerProfileLookup;
  includeSteamIds?: Set<string>;
  excludeSteamIds?: Set<string>;
};

function steamIdSelection(
  player: ReplayPlayer,
  includeSteamIds: Set<string>,
  excludeSteamIds: Set<string>,
) {
  const steamId = normalizeSteamId(steamIdText(player.steam_id));

  if (excludeSteamIds.has(steamId)) {
    return false;
  }

  if (includeSteamIds.has(steamId)) {
    return true;
  }

  return null;
}

function defaultPlayerSelection({
  options,
  player,
  profile,
}: Pick<PlayerRuleContext, "options" | "player" | "profile">) {
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

function playerStateFromRules({
  options,
  player,
  profile,
  includeSteamIds = steamIdSet(options.includeSteamIds),
  excludeSteamIds = steamIdSet(options.excludeSteamIds),
}: PlayerRuleContext): PlayerState {
  const selection = steamIdSelection(player, includeSteamIds, excludeSteamIds);

  if (selection !== null) {
    return {
      anonymize: selection,
      locked: true,
    };
  }

  return {
    anonymize: defaultPlayerSelection({ options, player, profile }),
    locked: false,
  };
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
      const state = playerStateFromRules({
        options,
        player,
        profile: profiles[steamIdText(player.steam_id)],
        includeSteamIds,
        excludeSteamIds,
      });

      return [key, { ...previous[key], ...state }];
    }),
  );
}
