import type {
  AnonymizeOptions,
  PlayerOption,
  PlayerStateMap,
  ReplayInspection,
  ReplayPlayer,
  UiOptions,
} from "../types";
import { playerKey, steamIdText } from "../utils";

const buildPlayerOption = (player: ReplayPlayer, playerState: PlayerStateMap): PlayerOption => {
  return {
    player_id: player.player_id,
    steam_id: steamIdText(player.steam_id),
    anonymize: playerState[playerKey(player)]?.anonymize ?? true,
  };
};

const steamIds = (values: string[]) => values.map((value) => value.trim()).filter(Boolean);

const playerSelectionMode = (options: UiOptions) =>
  options.playerSelectionMode === "excludeAll" ? "exclude_all" : "include_all";

const buildOptionSettings = (options: UiOptions): Omit<AnonymizeOptions, "players"> => {
  return {
    player_selection_mode: playerSelectionMode(options),
    include_steam_ids: steamIds(options.includeSteamIds),
    exclude_steam_ids: steamIds(options.excludeSteamIds),
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
    remove_player_steam_ids: options.removePlayerSteamIds,
    remove_hero_cosmetics: options.removeHeroCosmetics,
    remove_courier_cosmetics: options.removeCourierCosmetics,
    remove_ward_cosmetics: options.removeWardCosmetics,
    remove_poogie_cosmetics: options.removePoogieCosmetics,
    remove_statue_cosmetics: options.removeStatueCosmetics,
    remove_plus_subscriber: options.removeDotaPlusBadges,
    remove_guild_data: options.removeGuildData,
    remove_player_camera_movements: options.removeCameraMovements,
    remove_player_mouse_movements: options.removeMouseMovements,
    remove_player_clicks: options.removeClickMovements,
    remove_broadcaster_info: options.removeBroadcasterInfo,
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
    ...buildOptionSettings(options),
  };
};

export const buildExportedAnonymizeOptions = (options: UiOptions): AnonymizeOptions => {
  return {
    players: [],
    ...buildOptionSettings(options),
  };
};
