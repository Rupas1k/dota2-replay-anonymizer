import type {
  AnonymizeOptions,
  PlayerStateMap,
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

    const savedHasSelectionMode = parsed.playerSelectionMode === "includeAll" || parsed.playerSelectionMode === "excludeAll";

    return {
      ...booleanOptions,
      playerSelectionMode:
        parsed.playerSelectionMode === "excludeAll"
          ? "excludeAll"
          : defaultUiOptions.playerSelectionMode,
      proAnonymizeMode:
        savedHasSelectionMode &&
        (parsed.proAnonymizeMode === "includePro" || parsed.proAnonymizeMode === "excludePro")
          ? parsed.proAnonymizeMode
          : defaultUiOptions.proAnonymizeMode,
      spectatorAnonymizeMode:
        parsed.spectatorAnonymizeMode === "includeSpectators" ||
        parsed.spectatorAnonymizeMode === "excludeSpectators"
          ? parsed.spectatorAnonymizeMode
          : defaultUiOptions.spectatorAnonymizeMode,
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

export const buildAnonymizeOptions = ({
  inspection,
  playerState,
  options,
}: {
  inspection: ReplayInspection;
  playerState: PlayerStateMap;
  options: UiOptions;
}): AnonymizeOptions => {
  const anonymizeOptions: AnonymizeOptions = {
    players: inspection.players.map((player) => ({
      player_id: player.player_id,
      steam_id: player.steam_id,
      anonymize: isLockedPlayer(player) ? false : (playerState[playerKey(player)]?.anonymize ?? true),
      replacement_name: isLockedPlayer(player) ? player.name : "Anonymous",
    })),
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

  console.log("Anonymize options:", anonymizeOptions);

  return anonymizeOptions;
};
