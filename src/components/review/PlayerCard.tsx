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
  profile: PlayerProfileLookup | undefined;
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
    return (
      <span className="inline-flex min-w-0 max-w-full justify-self-start rounded-sm border border-border bg-input px-[7px] py-1 text-xs text-muted">
        Steam {steamId}
      </span>
    );
  }

  return (
    <a
      className="inline-flex min-w-0 max-w-full items-center justify-self-start gap-1.5 rounded-sm border border-border bg-input px-[7px] py-1 text-xs text-muted no-underline transition-colors hover:border-border-strong hover:bg-control hover:text-app-text [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.7] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round] [&>span]:overflow-hidden [&>span]:text-ellipsis [&>span]:whitespace-nowrap"
      href={url}
      target="_blank"
      rel="noreferrer"
    >
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
    "grid min-h-[66px] items-center gap-2 rounded-sm border px-[9px] py-[7px] focus-visible:outline-2 focus-visible:outline-accent/70 focus-visible:outline-offset-2 max-[720px]:grid-cols-1",
    team === "neutral" ? "grid-cols-[20px_minmax(0,1fr)]" : "grid-cols-[20px_104px_minmax(0,1fr)]",
    playerState.anonymize ? "border-success/50 bg-success/10" : "border-border bg-surface",
    playerState.locked ? "cursor-default" : "cursor-pointer hover:border-border-strong",
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
      <label
        className="grid h-full items-center justify-items-center max-[720px]:justify-items-start"
        aria-label={`Anonymize ${playerName}`}
      >
        <input
          className="size-4 cursor-pointer accent-success disabled:cursor-not-allowed disabled:opacity-55"
          type="checkbox"
          checked={playerState.anonymize}
          disabled={playerState.locked}
          onChange={(event) => onUpdate(playerKey(player), { anonymize: event.target.checked })}
        />
      </label>

      {team !== "neutral" ? (
        <div
          className="grid aspect-video w-24 place-items-end overflow-hidden rounded-sm border border-border bg-surface max-[720px]:min-h-[92px] max-[720px]:w-full [&_img]:size-full [&_img]:object-cover"
          aria-hidden="true"
        >
          {heroImageUrl(hero) ? (
            <img src={heroImageUrl(hero) ?? undefined} alt="" loading="lazy" />
          ) : null}
        </div>
      ) : null}

      <div
        className={`min-w-0 gap-[5px] ${team === "neutral" ? "flex items-center justify-between pr-5" : "grid grid-cols-[minmax(240px,1fr)_minmax(132px,0.42fr)] items-center max-[720px]:grid-cols-1"}`}
      >
        <div className="min-w-0">
          <div className="grid min-w-0 gap-0.5 [&>span:last-child]:overflow-hidden [&>span:last-child]:text-[0.78rem] [&>span:last-child]:text-ellipsis [&>span:last-child]:whitespace-nowrap [&>span:last-child]:text-muted">
            {proLabel ? (
              <span className="overflow-hidden text-[0.9rem] font-medium text-ellipsis whitespace-nowrap text-warning [&_em]:font-normal [&_em]:not-italic [&_em]:text-muted">
                {proLabel}
                {!proNameMatchesReplayName ? <em> aka {playerName}</em> : null}
              </span>
            ) : (
              <span className="overflow-hidden text-[0.9rem] font-medium text-ellipsis whitespace-nowrap text-app-text">
                {playerName}
              </span>
            )}
            <span>{hero.name}</span>
          </div>
        </div>

        <SteamLink player={player} />
      </div>
    </article>
  );
}
