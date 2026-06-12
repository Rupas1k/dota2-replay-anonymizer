import type { ReplayPlayer } from "./types";

const sourceTvIdThreshold = 90000000000000000n;
const steamId64Base = 76561197960265728n;

export const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const replayBaseName = (fileName: string) => fileName.replace(/\.dem$/i, "");

export const anonymizedReplayName = (fileName: string) => `${replayBaseName(fileName)}.anon.dem`;

export const optionsJsonName = (fileName?: string) =>
  `${fileName ? replayBaseName(fileName) : "d2-anonymizer-options"}.options.json`;

export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

export const playerIdValue = (player: ReplayPlayer) => player.player_id ?? 0;
export const playerSlotValue = (player: ReplayPlayer) => player.slot ?? playerIdValue(player);

export const defaultPlayerName = (player: ReplayPlayer) =>
  player.name || `Player ${playerIdValue(player)}`;

const isSourceTvName = (name: string) => name.replace(/[\s_-]+/g, "").toLowerCase().includes("sourcetv");

export const playerKey = (player: ReplayPlayer) =>
  player.player_id == null
    ? `userinfo:${playerSlotValue(player)}:${player.steam_id}`
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
