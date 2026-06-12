import type { PlayerState, ReplayInspection } from "./types";
import { isLockedPlayer, playerKey } from "./utils";

export const buildPlayerState = (inspection: ReplayInspection): Record<string, PlayerState> => {
  return Object.fromEntries(
    inspection.players.map((player) => [
      playerKey(player),
      {
        anonymize: isLockedPlayer(player) ? false : (player.anonymize ?? true),
      },
    ]),
  );
};
