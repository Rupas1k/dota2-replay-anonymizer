export type PlayerTeam = "radiant" | "dire" | "spectator";

export type ReplayPlayer = {
  player_id: number | null;
  steam_id: string;
  team_slot: number;
  team_num: number;
  hero_id: number;
  hero_name?: string;
  hero_slug?: string;
  slot?: number;
  name: string;
  replacement_name?: string;
  anonymize?: boolean;
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

export type ChatAction = "keep" | "delete";

export type PlayerOption = {
  player_id: number | null;
  steam_id: string;
  anonymize: boolean;
  replacement_name: string;
};

export type ChatMessageOption = {
  index: number;
  action: ChatAction;
  replacement_text: string;
};

export type AnonymizeOptions = {
  players: PlayerOption[];
  chat_messages: ChatMessageOption[];
  remove_combat_log: boolean;
  remove_match_id: boolean;
  remove_lobby_name: boolean;
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
  remove_rank_tier: boolean;
  remove_plus_subscriber: boolean;
  remove_guild_data: boolean;
  remove_selected_hero_badge: boolean;
  remove_player_camera_movements: boolean;
  remove_player_mouse_movements: boolean;
  remove_player_click_movements: boolean;
};

export type WorkerSuccess<T> = {
  id: number;
  ok: true;
  payload: T;
};

export type WorkerFailure = {
  id: number;
  ok: false;
  error: string;
};

export type WorkerReady = {
  type: "ready";
};

export type PlayerState = {
  anonymize: boolean;
};

export type PlayerStateMap = Record<string, PlayerState>;

export type ToggleSetter = (checked: boolean) => void;

export type PlayerSelectionMode = "includeAll" | "excludeAll";
export type ProAnonymizeMode = "ignore" | "includePro" | "excludePro";
export type SpectatorAnonymizeMode = "ignore" | "includeSpectators" | "excludeSpectators";

export type UiOptions = {
  removeCombatLog: boolean;
  removeMatchId: boolean;
  removeLobbyName: boolean;
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
  removeGuildData: boolean;
  removeCourierCosmetics: boolean;
  removeWardCosmetics: boolean;
  removePoogieCosmetics: boolean;
  removeStatueCosmetics: boolean;
  removeCameraMovements: boolean;
  removeMouseMovements: boolean;
  removeClickMovements: boolean;
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
