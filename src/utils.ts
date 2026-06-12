import type { ReplayPlayer } from "./types";

const sourceTvIdThreshold = 90000000000000000n;
const steamId64Base = 76561197960265728n;

export const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatTicks = (ticks: number) => ticks.toLocaleString();

export const playerIdValue = (player: ReplayPlayer) => player.player_id ?? 0;
export const playerSlotValue = (player: ReplayPlayer) => player.slot ?? playerIdValue(player);
export const playerUserIdValue = (player: ReplayPlayer) => player.user_id ?? playerIdValue(player);

export const defaultPlayerName = (player: ReplayPlayer) =>
  player.name || `Player ${playerUserIdValue(player)}`;

const isSourceTvName = (name: string) => name.replace(/[\s_-]+/g, "").toLowerCase().includes("sourcetv");

export const playerKey = (player: ReplayPlayer) =>
  player.player_id == null
    ? `userinfo:${playerSlotValue(player)}:${playerUserIdValue(player)}:${player.steam_id}`
    : `player:${player.player_id}`;

export const isSourceTvPlayer = (player: ReplayPlayer) => {
  if (player.team_num === 1 && playerSlotValue(player) === 0) {
    return true;
  }

  if (isSourceTvName(player.name)) {
    return true;
  }

  try {
    const steamId = BigInt(player.steam_id);
    return steamId > sourceTvIdThreshold;
  } catch {
    return false;
  }
};

export const isLockedPlayer = (player: ReplayPlayer) => {
  return isSourceTvPlayer(player) || player.steam_id === "0";
};

export const steamIdToAccountId = (steamId: string) => {
  if (!steamId || steamId === "0") {
    return null;
  }

  try {
    const id = BigInt(steamId);
    if (id <= 0n) {
      return null;
    }

    const accountId = id > steamId64Base ? id - steamId64Base : id;
    if (accountId > BigInt(Number.MAX_SAFE_INTEGER)) {
      return null;
    }

    return Number(accountId);
  } catch {
    return null;
  }
};

export const openDotaAccountIdForPlayer = (player: ReplayPlayer) => {
  return steamIdToAccountId(player.steam_id);
};
