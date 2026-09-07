import { heroForPlayer, type PlayerTeamKind } from "../../anonymizer/playerDisplay";
import type {
  HeroLookup,
  PlayerProfileLookup,
  PlayerState,
  PlayerStateMap,
  ReplayPlayer,
} from "../../types";
import { playerKey, steamIdText } from "../../utils";
import { PlayerCard, playerStateFor } from "./PlayerCard";

type PlayerTeamSectionProps = {
  players: ReplayPlayer[];
  heroesById: Record<number, HeroLookup>;
  playerProfiles: Record<string, PlayerProfileLookup>;
  playerState: PlayerStateMap;
  team: PlayerTeamKind;
  title: string;
  onUpdate: (key: string, patch: Partial<PlayerState>) => void;
};

export function PlayerTeamSection({
  players,
  heroesById,
  playerProfiles,
  playerState,
  team,
  title,
  onUpdate,
}: PlayerTeamSectionProps) {
  if (!players.length) {
    return null;
  }

  return (
    <section className="grid gap-[7px]">
      <header className="flex items-center gap-2.5 after:h-px after:flex-1 after:bg-border">
        <h3 className="m-0 text-[0.92rem] tracking-normal text-muted-strong">{title}</h3>
      </header>

      <div
        className={`grid gap-[7px] ${team === "neutral" ? "grid-cols-[repeat(auto-fit,minmax(330px,1fr))] max-[980px]:grid-cols-1" : "grid-cols-1"}`}
      >
        {players.map((player) => (
          <PlayerCard
            key={playerKey(player)}
            hero={heroForPlayer(player, heroesById)}
            player={player}
            profile={playerProfiles[steamIdText(player.steam_id)]}
            playerState={playerStateFor(player, playerState)}
            team={team}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </section>
  );
}
