import type {
  AnonymizeOptions,
  PlayerOption,
  PlayerStateMap,
  ReplayInspection,
  ReplayPlayer,
  UiOptions,
} from "../types";
import { playerKey } from "../utils";

const buildPlayerOption = (player: ReplayPlayer, playerState: PlayerStateMap): PlayerOption => {
  return {
    player_id: player.player_id,
    steam_id: player.steam_id,
    anonymize: playerState[playerKey(player)]?.anonymize ?? true,
    replacement_name: "Anonymous",
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
