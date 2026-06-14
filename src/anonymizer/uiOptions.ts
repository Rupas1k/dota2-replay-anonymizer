import type { AnonymizeOptions, UiOptionKey, UiOptions } from "../types";

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
  removePlayerSteamIds: true,
  removeHeroCosmetics: true,
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

  return value
    .map((entry) => (typeof entry === "number" || typeof entry === "string" ? String(entry).trim() : ""))
    .filter(Boolean);
};

const importedStringArrayValue = (value: unknown, fallback: string[]) =>
  Array.isArray(value) ? stringArrayValue(value) : fallback;

const booleanValue = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;

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

type ImportableOptions = Partial<AnonymizeOptions> & Partial<UiOptions>;

export const uiOptionsFromJson = (value: unknown, current = createDefaultUiOptions()): UiOptions => {
  if (!value || typeof value !== "object") {
    throw new Error("Options JSON must be an object.");
  }

  const options = value as ImportableOptions;

  return {
    ...current,
    removeCombatLog: booleanValue(options.remove_combat_log, current.removeCombatLog),
    removeMatchId: booleanValue(options.remove_match_id, current.removeMatchId),
    removeLobbyName: booleanValue(options.remove_lobby_name, current.removeLobbyName),
    removeChatMessages: booleanValue(options.remove_chat_messages, current.removeChatMessages),
    removeChatWheel: booleanValue(options.remove_chat_wheel, current.removeChatWheel),
    removeMapPings: booleanValue(options.remove_map_pings, current.removeMapPings),
    removeMinimapDrawings: booleanValue(
      options.remove_minimap_drawings,
      current.removeMinimapDrawings,
    ),
    removeDotaPlusBadges: booleanValue(options.remove_dota_plus_badges, current.removeDotaPlusBadges),
    removeTeamName: booleanValue(options.remove_team_name, current.removeTeamName),
    removeTeamTag: booleanValue(options.remove_team_tag, current.removeTeamTag),
    removeTournamentTeamId: booleanValue(
      options.remove_tournament_team_id,
      current.removeTournamentTeamId,
    ),
    removeTeamLogo: booleanValue(options.remove_team_logo, current.removeTeamLogo),
    removePlayerNames: booleanValue(options.remove_player_names, current.removePlayerNames),
    removePlayerSteamIds: booleanValue(options.remove_player_steam_ids, current.removePlayerSteamIds),
    removeHeroCosmetics: booleanValue(options.remove_hero_cosmetics, current.removeHeroCosmetics),
    removeGuildData: booleanValue(options.remove_guild_data, current.removeGuildData),
    removeCourierCosmetics: booleanValue(options.remove_courier_cosmetics, current.removeCourierCosmetics),
    removeWardCosmetics: booleanValue(options.remove_ward_cosmetics, current.removeWardCosmetics),
    removePoogieCosmetics: booleanValue(options.remove_poogie_cosmetics, current.removePoogieCosmetics),
    removeStatueCosmetics: booleanValue(options.remove_statue_cosmetics, current.removeStatueCosmetics),
    removeCameraMovements: booleanValue(
      options.remove_player_camera_movements,
      current.removeCameraMovements,
    ),
    removeMouseMovements: booleanValue(
      options.remove_player_mouse_movements,
      current.removeMouseMovements,
    ),
    removeClickMovements: booleanValue(options.remove_player_clicks, current.removeClickMovements),
    playerSelectionMode:
      options.player_selection_mode === "exclude_all"
        ? "excludeAll"
        : options.player_selection_mode === "include_all"
          ? "includeAll"
          : current.playerSelectionMode,
    proAnonymizeMode: savedProAnonymizeMode(options.proAnonymizeMode ?? current.proAnonymizeMode),
    spectatorAnonymizeMode: savedSpectatorAnonymizeMode(
      options.spectatorAnonymizeMode ?? current.spectatorAnonymizeMode,
    ),
    includeSteamIds: importedStringArrayValue(options.include_steam_ids, current.includeSteamIds),
    excludeSteamIds: importedStringArrayValue(options.exclude_steam_ids, current.excludeSteamIds),
  };
};
