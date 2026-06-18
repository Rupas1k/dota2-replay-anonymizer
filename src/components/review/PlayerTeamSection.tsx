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
    <section className={`team-panel is-${team}`}>
      <header className="team-panel-head">
        <h3>{title}</h3>
      </header>

      <div className="team-player-grid">
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
