import type { KeyboardEvent, MouseEvent } from "react";
import type {
  HeroLookup,
  PlayerProfileLookup,
  PlayerState,
  PlayerStateMap,
  ReplayPlayer,
} from "../../types";
import {
  groupPlayers,
  heroForPlayer,
  heroImageUrl,
  normalizePlayerName,
  proPlayerLabel,
  steamProfileUrl,
  type HeroDisplay,
  type PlayerTeamKind,
} from "../../anonymizer/playerDisplay";
import { defaultPlayerName, playerKey, steamIdText } from "../../utils";

function playerStateFor(player: ReplayPlayer, playerState: PlayerStateMap) {
  return (
    playerState[playerKey(player)] ?? {
      anonymize: true,
      locked: false,
    }
  );
}

function SteamLink({ player }: { player: ReplayPlayer }) {
  const url = steamProfileUrl(player);
  const steamId = steamIdText(player.steam_id);

  if (!url) {
    return <span className="steam-link is-disabled">Steam {steamId}</span>;
  }

  return (
    <a className="steam-link" href={url} target="_blank" rel="noreferrer">
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <circle cx="15.8" cy="8.3" r="2.6" />
        <circle cx="8.2" cy="15.6" r="2.2" />
        <path d="m10 14.4 3.6-2.5" />
      </svg>
      <span>{steamId}</span>
    </a>
  );
}

function PlayerCard({
  hero,
  player,
  profile,
  playerState,
  team,
  onUpdate,
}: {
  hero: HeroDisplay;
  player: ReplayPlayer;
  profile?: PlayerProfileLookup;
  playerState: PlayerState;
  team: PlayerTeamKind;
  onUpdate: (key: string, patch: Partial<PlayerState>) => void;
}) {
  const playerName = defaultPlayerName(player);
  const proLabel = proPlayerLabel(profile);
  const cardClassName = [
    "player-card",
    `is-${team}`,
    proLabel ? "is-pro" : "",
    playerState.locked ? "is-locked" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const proNameMatchesReplayName =
    profile?.proName && normalizePlayerName(profile.proName) === normalizePlayerName(playerName);
  const togglePlayer = () => {
    if (playerState.locked) {
      return;
    }

    onUpdate(playerKey(player), { anonymize: !playerState.anonymize });
  };
  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;

    if (target.closest("a, input, button")) {
      return;
    }

    togglePlayer();
  };
  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    togglePlayer();
  };

  return (
    <article
      className={cardClassName}
      tabIndex={0}
      role="checkbox"
      aria-checked={playerState.anonymize}
      aria-disabled={playerState.locked}
      aria-label={`Anonymize ${playerName}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <label className="player-check" aria-label={`Anonymize ${playerName}`}>
        <input
          type="checkbox"
          checked={playerState.anonymize}
          disabled={playerState.locked}
          onChange={(event) => onUpdate(playerKey(player), { anonymize: event.target.checked })}
        />
      </label>

      {team !== "neutral" ? (
        <div className="hero-portrait" aria-hidden="true">
          {heroImageUrl(hero) ? (
            <img src={heroImageUrl(hero) ?? undefined} alt="" loading="lazy" />
          ) : null}
        </div>
      ) : null}

      <div className="player-card-main">
        <div className="player-card-title">
          <div className="player-name-cell">
            {proLabel ? (
              <span className="pro-player-name">
                {proLabel}
                {!proNameMatchesReplayName ? <em> aka {playerName}</em> : null}
              </span>
            ) : (
              <span className="original-player-name">{playerName}</span>
            )}
            <span>{hero.name}</span>
          </div>
        </div>

        <SteamLink player={player} />
      </div>
    </article>
  );
}

function TeamSection({
  players,
  heroesById,
  playerProfiles,
  playerState,
  team,
  title,
  onUpdate,
}: {
  players: ReplayPlayer[];
  heroesById: Record<number, HeroLookup>;
  playerProfiles: Record<string, PlayerProfileLookup>;
  playerState: PlayerStateMap;
  team: PlayerTeamKind;
  title: string;
  onUpdate: (key: string, patch: Partial<PlayerState>) => void;
}) {
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
        <TeamSection
          players={groups.radiant}
          heroesById={heroesById}
          playerProfiles={playerProfiles}
          playerState={playerState}
          team="radiant"
          title="Radiant"
          onUpdate={onUpdate}
        />
        <TeamSection
          players={groups.dire}
          heroesById={heroesById}
          playerProfiles={playerProfiles}
          playerState={playerState}
          team="dire"
          title="Dire"
          onUpdate={onUpdate}
        />
        <TeamSection
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
