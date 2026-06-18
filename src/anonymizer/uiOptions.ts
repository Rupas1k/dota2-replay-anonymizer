import type { UiOptionKey, UiOptions } from "../types";

const uiOptionsStorageKey = "d2-replay-anonymizer:ui-options:v1";

export const defaultUiOptions: UiOptions = {
  removeCombatLog: false,
  removeMatchId: true,
  removeLobbyName: true,
  removeLeagueInfo: true,
  removeChatMessages: true,
  removeChatWheel: true,
  removeMapPings: true,
  removeMinimapDrawings: true,
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
  removeClicks: false,
  removeBroadcasterInfo: true,
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
    .map((entry) =>
      typeof entry === "number" || typeof entry === "string" ? String(entry).trim() : "",
    )
    .filter(Boolean);
};

const trySetStorageItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const savedPlayerSelectionMode = (value: unknown) => {
  return value === "excludeAll" || value === "includeAll"
    ? value
    : defaultUiOptions.playerSelectionMode;
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
  trySetStorageItem(uiOptionsStorageKey, JSON.stringify(options));
};
