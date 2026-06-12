import type {
  AnonymizeOptions,
  PlayerOption,
  PlayerStateMap,
  ReplayPlayer,
  ReplayInspection,
  UiOptionKey,
  UiOptions,
} from "./types";
import { isLockedPlayer, playerKey } from "./utils";

const uiOptionsStorageKey = "d2-replay-anonymizer:ui-options:v1";

export const defaultUiOptions: UiOptions = {
  removeCombatLog: false,
  removeMatchId: true,
  removeLobbyName: true,
  removeChatMessages: true,
  removeChatWheel: true,
  removeMapPings: false,
  removeMinimapDrawings: false,
  removeDotaPlusBadges: true,
  removeTeamName: true,
  removeTeamTag: true,
  removeTournamentTeamId: true,
  removeTeamLogo: true,
  removePlayerNames: true,
  removeGuildData: true,
  removeCourierCosmetics: true,
  removeWardCosmetics: true,
  removePoogieCosmetics: true,
  removeStatueCosmetics: true,
  removeCameraMovements: false,
  removeMouseMovements: false,
  removeClickMovements: false,
  playerSelectionMode: "includeAll",
  proAnonymizeMode: "ignore",
  spectatorAnonymizeMode: "ignore",
  includeSteamIds: [],
  excludeSteamIds: [],
};

export const createDefaultUiOptions = (): UiOptions => ({
  ...defaultUiOptions,
  includeSteamIds: [],
  excludeSteamIds: [],
});

const booleanOptionKeys = Object.entries(defaultUiOptions)
  .filter(([, value]) => typeof value === "boolean")
  .map(([key]) => key) as UiOptionKey[];

const stringArrayValue = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string" && entry.trim() !== "");
};

const savedPlayerSelectionMode = (value: unknown) => {
  return value === "excludeAll" || value === "includeAll" ? value : defaultUiOptions.playerSelectionMode;
};

const savedProAnonymizeMode = (value: unknown) => {
  return value === "includePro" || value === "excludePro" || value === "ignore"
    ? value
    : defaultUiOptions.proAnonymizeMode;
};

const savedSpectatorAnonymizeMode = (value: unknown) => {
  return value === "includeSpectators" || value === "excludeSpectators" || value === "ignore"
    ? value
    : defaultUiOptions.spectatorAnonymizeMode;
};

export const loadUiOptions = (): UiOptions => {
  try {
    const saved = localStorage.getItem(uiOptionsStorageKey);
    if (!saved) {
      return createDefaultUiOptions();
    }

    const parsed = JSON.parse(saved) as Partial<Record<keyof UiOptions, unknown>>;
    const booleanOptions = booleanOptionKeys.reduce<UiOptions>(
      (options, key) => ({
        ...options,
        [key]: typeof parsed[key] === "boolean" ? parsed[key] : defaultUiOptions[key],
      }),
      createDefaultUiOptions(),
    );

    return {
      ...booleanOptions,
      playerSelectionMode: savedPlayerSelectionMode(parsed.playerSelectionMode),
      proAnonymizeMode: savedProAnonymizeMode(parsed.proAnonymizeMode),
      spectatorAnonymizeMode: savedSpectatorAnonymizeMode(parsed.spectatorAnonymizeMode),
      includeSteamIds: stringArrayValue(parsed.includeSteamIds),
      excludeSteamIds: stringArrayValue(parsed.excludeSteamIds),
    };
  } catch {
    return createDefaultUiOptions();
  }
};

export const saveUiOptions = (options: UiOptions) => {
  try {
    localStorage.setItem(uiOptionsStorageKey, JSON.stringify(options));
  } catch {
    // Ignore storage failures; the current session can still use in-memory options.
  }
};

const buildPlayerOption = (player: ReplayPlayer, playerState: PlayerStateMap): PlayerOption => {
  const locked = isLockedPlayer(player);

  return {
    player_id: player.player_id,
    steam_id: player.steam_id,
    anonymize: locked ? false : (playerState[playerKey(player)]?.anonymize ?? true),
    replacement_name: locked ? player.name : "Anonymous",
  };
};

export const buildAnonymizeOptions = ({
  inspection,
  playerState,
  options,
}: {
  inspection: ReplayInspection;
  playerState: PlayerStateMap;
  options: UiOptions;
}): AnonymizeOptions => {
  return {
    players: inspection.players.map((player) => buildPlayerOption(player, playerState)),
    chat_messages: [],
    remove_combat_log: options.removeCombatLog,
    remove_match_id: options.removeMatchId,
    remove_lobby_name: options.removeLobbyName,
    remove_chat_messages: options.removeChatMessages,
    remove_chat_wheel: options.removeChatWheel,
    remove_map_pings: options.removeMapPings,
    remove_minimap_drawings: options.removeMinimapDrawings,
    remove_dota_plus_badges: options.removeDotaPlusBadges,
    remove_team_name: options.removeTeamName,
    remove_team_tag: options.removeTeamTag,
    remove_tournament_team_id: options.removeTournamentTeamId,
    remove_team_logo: options.removeTeamLogo,
    remove_player_names: options.removePlayerNames,
    remove_player_steam_ids: true,
    remove_hero_cosmetics: true,
    remove_courier_cosmetics: options.removeCourierCosmetics,
    remove_ward_cosmetics: options.removeWardCosmetics,
    remove_poogie_cosmetics: options.removePoogieCosmetics,
    remove_statue_cosmetics: options.removeStatueCosmetics,
    remove_rank_tier: true,
    remove_plus_subscriber: options.removeDotaPlusBadges,
    remove_guild_data: options.removeGuildData,
    remove_selected_hero_badge: options.removeDotaPlusBadges,
    remove_player_camera_movements: options.removeCameraMovements,
    remove_player_mouse_movements: options.removeMouseMovements,
    remove_player_click_movements: options.removeClickMovements,
  };
};
