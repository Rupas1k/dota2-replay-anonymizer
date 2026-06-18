import type { ReplayPlayer } from "./types";

const steamId64Base = 76561197960265728n;

export const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const replayBaseName = (fileName: string) => fileName.replace(/\.dem$/i, "");

export const anonymizedReplayName = (fileName: string) => `${replayBaseName(fileName)}_anon.dem`;

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

export const defaultPlayerName = (player: ReplayPlayer) =>
  player.name || `Player ${playerIdValue(player)}`;

export const steamIdText = (steamId: bigint) => steamId.toString();

export const playerKey = (player: ReplayPlayer) =>
  player.player_id == null ? `steam:${steamIdText(player.steam_id)}` : `player:${player.player_id}`;

export const steamIdToAccountId = (steamId: bigint) => {
  if (steamId <= 0n) {
    return null;
  }

  const accountId = steamId > steamId64Base ? steamId - steamId64Base : steamId;
  if (accountId > BigInt(Number.MAX_SAFE_INTEGER)) {
    return null;
  }

  return Number(accountId);
};

export const openDotaAccountIdForPlayer = (player: ReplayPlayer) => {
  return steamIdToAccountId(player.steam_id);
};
