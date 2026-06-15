import type {
  HeroLookup,
  PlayerProfileLookup,
  PlayerState,
  PlayerStateMap,
  ReplayPlayer,
} from "../../types";
import { groupPlayers } from "../../anonymizer/playerDisplay";
import { PlayerTeamSection } from "./PlayerTeamSection";

export function PlayersReview({
  players,
  heroesById,
  playerProfiles,
  playerState,
  onUpdate,
}: {
  players: ReplayPlayer[];
  heroesById: Record<number, HeroLookup>;
  playerProfiles: Record<string, PlayerProfileLookup>;
  playerState: PlayerStateMap;
  onUpdate: (key: string, patch: Partial<PlayerState>) => void;
}) {
  if (!players.length) {
    return <div className="empty-inline">No players were found in this replay.</div>;
  }

  const groups = groupPlayers(players);

  return (
    <section className="review-section players-review">
      <div className="team-board">
        <PlayerTeamSection
          players={groups.radiant}
          heroesById={heroesById}
          playerProfiles={playerProfiles}
          playerState={playerState}
          team="radiant"
          title="Radiant"
          onUpdate={onUpdate}
        />
        <PlayerTeamSection
          players={groups.dire}
          heroesById={heroesById}
          playerProfiles={playerProfiles}
          playerState={playerState}
          team="dire"
          title="Dire"
          onUpdate={onUpdate}
        />
        <PlayerTeamSection
          players={groups.spectators}
          heroesById={heroesById}
          playerProfiles={playerProfiles}
          playerState={playerState}
          team="neutral"
          title="Spectators"
          onUpdate={onUpdate}
        />
      </div>
    </section>
  );
}
