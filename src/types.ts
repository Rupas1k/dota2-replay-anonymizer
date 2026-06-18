export type ReplayPlayer = {
  player_id: number | null;
  steam_id: bigint;
  team_slot: number;
  team_num: number;
  hero_id: number;
  name: string;
};

export type ReplayInspection = {
  players: ReplayPlayer[];
  input_bytes: number;
  playback_ticks: number;
};

export type PlayerProfileLookup = {
  accountId: number;
  proName?: string;
  teamTag?: string;
  teamName?: string;
  steamName?: string;
  isPro: boolean;
};

export type HeroLookup = {
  id: number;
  name: string;
  slug: string;
};

export type PlayerOption = {
  player_id: number | null;
  steam_id: string;
  anonymize: boolean;
};

export type JsonPlayerSelectionMode = "include_all" | "exclude_all";

export type AnonymizeOptions = {
  players: PlayerOption[];
  player_selection_mode: JsonPlayerSelectionMode;
  include_steam_ids: string[];
  exclude_steam_ids: string[];
  remove_combat_log: boolean;
  remove_match_id: boolean;
  remove_lobby_name: boolean;
  remove_league_info: boolean;
  remove_chat_messages: boolean;
  remove_chat_wheel: boolean;
  remove_map_pings: boolean;
  remove_minimap_drawings: boolean;
  remove_dota_plus_badges: boolean;
  remove_team_name: boolean;
  remove_team_tag: boolean;
  remove_tournament_team_id: boolean;
  remove_team_logo: boolean;
  remove_player_names: boolean;
  remove_player_steam_ids: boolean;
  remove_hero_cosmetics: boolean;
  remove_courier_cosmetics: boolean;
  remove_ward_cosmetics: boolean;
  remove_poogie_cosmetics: boolean;
  remove_statue_cosmetics: boolean;
  remove_plus_subscriber: boolean;
  remove_guild_data: boolean;
  remove_player_camera_movements: boolean;
  remove_player_mouse_movements: boolean;
  remove_player_clicks: boolean;
  remove_broadcaster_info: boolean;
};

export type WorkerRequestPayloads = {
  inspect: {
    buffer: ArrayBuffer;
    mode?: "quick" | "full";
  };
  anonymize: {
    options: AnonymizeOptions;
    buffer?: ArrayBuffer;
  };
};

export type WorkerResponsePayloads = {
  inspect: {
    inspection: ReplayInspection;
  };
  anonymize: {
    blob: Blob;
  };
};

export type WorkerRequestType = keyof WorkerRequestPayloads;

export type WorkerRequest<T extends WorkerRequestType = WorkerRequestType> = {
  [Type in WorkerRequestType]: {
    id: number;
    type: Type;
    payload: WorkerRequestPayloads[Type];
  };
}[T];

export type WorkerSuccess<T extends WorkerRequestType = WorkerRequestType> = {
  id: number;
  type: T;
  ok: true;
  payload: WorkerResponsePayloads[T];
};

export type WorkerFailure = {
  id: number;
  ok: false;
  error: string;
};

export type WorkerReady = {
  type: "ready";
};

export type WorkerResponse = WorkerReady | WorkerFailure | WorkerSuccess;

export type PlayerState = {
  anonymize: boolean;
  locked: boolean;
};

export type PlayerStateMap = Record<string, PlayerState>;

export type PlayerSelectionMode = "includeAll" | "excludeAll";
export type ProAnonymizeMode = "ignore" | "includePro" | "excludePro";
export type SpectatorAnonymizeMode = "ignore" | "includeSpectators" | "excludeSpectators";

export type UiOptions = {
  removeCombatLog: boolean;
  removeMatchId: boolean;
  removeLobbyName: boolean;
  removeLeagueInfo: boolean;
  removeChatMessages: boolean;
  removeChatWheel: boolean;
  removeMapPings: boolean;
  removeMinimapDrawings: boolean;
  removeDotaPlusBadges: boolean;
  removeTeamName: boolean;
  removeTeamTag: boolean;
  removeTournamentTeamId: boolean;
  removeTeamLogo: boolean;
  removePlayerNames: boolean;
  removePlayerSteamIds: boolean;
  removeHeroCosmetics: boolean;
  removeGuildData: boolean;
  removeCourierCosmetics: boolean;
  removeWardCosmetics: boolean;
  removePoogieCosmetics: boolean;
  removeStatueCosmetics: boolean;
  removeCameraMovements: boolean;
  removeMouseMovements: boolean;
  removeClicks: boolean;
  removeBroadcasterInfo: boolean;
  playerSelectionMode: PlayerSelectionMode;
  proAnonymizeMode: ProAnonymizeMode;
  spectatorAnonymizeMode: SpectatorAnonymizeMode;
  includeSteamIds: string[];
  excludeSteamIds: string[];
};

export type UiOptionKey = {
  [Key in keyof UiOptions]: UiOptions[Key] extends boolean ? Key : never;
}[keyof UiOptions];

export type ReviewTab = "options" | "review";
