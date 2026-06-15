import type { KeyboardEvent, MouseEvent } from "react";
import {
  heroImageUrl,
  normalizePlayerName,
  proPlayerLabel,
  steamProfileUrl,
  type HeroDisplay,
  type PlayerTeamKind,
} from "../../anonymizer/playerDisplay";
import type { PlayerProfileLookup, PlayerState, PlayerStateMap, ReplayPlayer } from "../../types";
import { defaultPlayerName, playerKey, steamIdText } from "../../utils";

type PlayerCardProps = {
  hero: HeroDisplay;
  player: ReplayPlayer;
  profile?: PlayerProfileLookup;
  playerState: PlayerState;
  team: PlayerTeamKind;
  onUpdate: (key: string, patch: Partial<PlayerState>) => void;
};

export function playerStateFor(player: ReplayPlayer, playerState: PlayerStateMap) {
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

export function PlayerCard({
  hero,
  player,
  profile,
  playerState,
  team,
  onUpdate,
}: PlayerCardProps) {
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
          {heroImageUrl(hero) ? <img src={heroImageUrl(hero) ?? undefined} alt="" loading="lazy" /> : null}
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
