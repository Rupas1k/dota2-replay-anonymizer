import type { KeyboardEvent, MouseEvent } from "react";
import type {
  HeroLookup,
  PlayerProfileLookup,
  PlayerState,
  PlayerStateMap,
  ReplayPlayer,
} from "../../types";
import { defaultPlayerName, isLockedPlayer, isSourceTvPlayer, playerKey, playerSlotValue } from "../../utils";

type TeamKind = "radiant" | "dire" | "neutral";

type HeroDisplay = {
  name: string;
  slug?: string;
};

const sourceTvHero: HeroDisplay = { name: "SourceTV" };
const spectatorHero: HeroDisplay = { name: "Spectator" };

const heroImageUrl = (hero: HeroDisplay) => {
  if (!hero.slug) {
    return null;
  }

  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${hero.slug}.png`;
};

const normalizePlayerName = (name: string) => name.trim().replace(/\s+/g, " ").toLowerCase();

function playerStateFor(player: ReplayPlayer, playerState: PlayerStateMap) {
  return (
    playerState[playerKey(player)] ?? {
      anonymize: true,
    }
  );
}

function playerRowKey(player: ReplayPlayer) {
  return playerKey(player);
}

function playerTeam(player: ReplayPlayer) {
  if (player.team_num === 2) {
    return "radiant";
  }

  if (player.team_num === 3) {
    return "dire";
  }

  return "spectator";
}

function getPlayerGroups(players: ReplayPlayer[]) {
  const bySlot = (a: ReplayPlayer, b: ReplayPlayer) => playerSlotValue(a) - playerSlotValue(b);
  const byTeamSlot = (a: ReplayPlayer, b: ReplayPlayer) => a.team_slot - b.team_slot;
  const radiant = players.filter((player) => playerTeam(player) === "radiant").sort(byTeamSlot);
  const dire = players.filter((player) => playerTeam(player) === "dire").sort(byTeamSlot);
  const support = players
    .filter((player) => playerTeam(player) === "spectator")
    .sort(bySlot);

  return {
    radiant,
    dire,
    support,
  };
}

function heroForPlayer(player: ReplayPlayer, heroesById: Record<number, HeroLookup>) {
  if (isSourceTvPlayer(player)) {
    return sourceTvHero;
  }

  const hero = heroesById[player.hero_id];
  if (!hero) {
    return playerTeam(player) === "radiant" || playerTeam(player) === "dire"
      ? { name: "Unknown hero" }
      : spectatorHero;
  }

  return {
    name: hero.name,
    slug: hero.slug,
  };
}

function steamProfileUrl(player: ReplayPlayer) {
  if (isSourceTvPlayer(player) || !player.steam_id || player.steam_id === "0") {
    return null;
  }

  return `https://steamcommunity.com/profiles/${player.steam_id}`;
}

function SteamLink({ player }: { player: ReplayPlayer }) {
  const url = steamProfileUrl(player);
  const steamId = player.steam_id || "unknown";

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
  team: TeamKind;
  onUpdate: (key: string, patch: Partial<PlayerState>) => void;
}) {
  const playerName = defaultPlayerName(player);
  const sourceTv = isSourceTvPlayer(player);
  const locked = isLockedPlayer(player);
  const proLabel =
    profile?.isPro && profile.proName
      ? `${profile.teamTag ? `${profile.teamTag}.` : ""}${profile.proName}`
      : null;
  const proNameMatchesReplayName =
    profile?.proName && normalizePlayerName(profile.proName) === normalizePlayerName(playerName);
  const togglePlayer = () => {
    if (!locked) {
      onUpdate(playerKey(player), { anonymize: !playerState.anonymize });
    }
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
      className={`player-card is-${team}${locked ? " is-locked-player" : ""}${
        sourceTv ? " is-source-tv" : ""
      }${
        proLabel ? " is-pro" : ""
      }`}
      tabIndex={locked ? undefined : 0}
      role="checkbox"
      aria-checked={playerState.anonymize}
      aria-disabled={locked || undefined}
      aria-label={`Anonymize ${playerName}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <label className="player-check" aria-label={`Anonymize ${playerName}`}>
        <input
          type="checkbox"
          checked={playerState.anonymize}
          disabled={locked}
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
  team: TeamKind;
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
            key={playerRowKey(player)}
            hero={heroForPlayer(player, heroesById)}
            player={player}
            profile={playerProfiles[player.steam_id]}
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

  const groups = getPlayerGroups(players);

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
          players={groups.support}
          heroesById={heroesById}
          playerProfiles={playerProfiles}
          playerState={playerState}
          team="neutral"
          title="Spectators and SourceTV"
          onUpdate={onUpdate}
        />
      </div>
    </section>
  );
}
