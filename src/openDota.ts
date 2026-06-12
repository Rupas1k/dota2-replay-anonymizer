import type { HeroLookup, PlayerProfileLookup, ReplayPlayer } from "./types";
import { isSourceTvPlayer, openDotaAccountIdForPlayer } from "./utils";

type OpenDotaProPlayerResponse = {
  account_id?: unknown;
  name?: unknown;
  team_tag?: unknown;
  team_name?: unknown;
  is_pro?: unknown;
};

type OpenDotaHeroResponse = {
  id?: unknown;
  name?: unknown;
  localized_name?: unknown;
};

type StoredProPlayers = {
  cachedAt: number;
  players: PlayerProfileLookup[];
};

type StoredHeroes = {
  cachedAt: number;
  heroes: HeroLookup[];
};

const proPlayerStorageKey = "d2-replay-anonymizer:opendota-pro-players:v1";
const heroStorageKey = "d2-replay-anonymizer:opendota-heroes:v1";
const proPlayerStorageMaxAgeMs = 7 * 24 * 60 * 60 * 1000;
const heroStorageMaxAgeMs = 7 * 24 * 60 * 60 * 1000;

let proPlayerCache: Promise<Map<number, PlayerProfileLookup>> | null = null;
let heroCache: Promise<Map<number, HeroLookup>> | null = null;

const stringValue = (value: unknown) => {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
};

const numberValue = (value: unknown) => {
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0) {
    return value;
  }

  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};

function normalizeProPlayer(player: OpenDotaProPlayerResponse): PlayerProfileLookup | null {
  const accountId = numberValue(player.account_id);
  if (!accountId) {
    return null;
  }

  return {
    accountId,
    proName: stringValue(player.name),
    teamTag: stringValue(player.team_tag),
    teamName: stringValue(player.team_name),
    isPro: true,
  };
}

function heroSlugFromName(name: string) {
  return name.replace(/^npc_dota_hero_/, "");
}

function normalizeHero(hero: OpenDotaHeroResponse): HeroLookup | null {
  const id = numberValue(hero.id);
  const apiName = stringValue(hero.name);
  const localizedName = stringValue(hero.localized_name);

  if (!id || !apiName || !localizedName) {
    return null;
  }

  return {
    id,
    name: localizedName,
    slug: heroSlugFromName(apiName),
  };
}

function profileFromStored(value: unknown): PlayerProfileLookup | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const profile = value as Partial<Record<keyof PlayerProfileLookup, unknown>>;
  const accountId = numberValue(profile.accountId);
  if (!accountId) {
    return null;
  }

  return {
    accountId,
    proName: stringValue(profile.proName),
    teamTag: stringValue(profile.teamTag),
    teamName: stringValue(profile.teamName),
    isPro: true,
  };
}

function heroFromStored(value: unknown): HeroLookup | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const hero = value as Partial<Record<keyof HeroLookup, unknown>>;
  const id = numberValue(hero.id);
  const name = stringValue(hero.name);
  const slug = stringValue(hero.slug);

  if (!id || !name || !slug) {
    return null;
  }

  return {
    id,
    name,
    slug,
  };
}

function mapFromProfiles(profiles: PlayerProfileLookup[]) {
  return new Map(profiles.map((profile) => [profile.accountId, profile]));
}

function mapFromHeroes(heroes: HeroLookup[]) {
  return new Map(heroes.map((hero) => [hero.id, hero]));
}

function loadStoredProPlayerMap() {
  try {
    const stored = localStorage.getItem(proPlayerStorageKey);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as Partial<StoredProPlayers>;
    if (
      typeof parsed.cachedAt !== "number" ||
      Date.now() - parsed.cachedAt > proPlayerStorageMaxAgeMs ||
      !Array.isArray(parsed.players)
    ) {
      return null;
    }

    const players = parsed.players
      .map(profileFromStored)
      .filter((profile): profile is PlayerProfileLookup => profile !== null);

    return players.length ? mapFromProfiles(players) : null;
  } catch {
    return null;
  }
}

function loadStoredHeroMap() {
  try {
    const stored = localStorage.getItem(heroStorageKey);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as Partial<StoredHeroes>;
    if (
      typeof parsed.cachedAt !== "number" ||
      Date.now() - parsed.cachedAt > heroStorageMaxAgeMs ||
      !Array.isArray(parsed.heroes)
    ) {
      return null;
    }

    const heroes = parsed.heroes
      .map(heroFromStored)
      .filter((hero): hero is HeroLookup => hero !== null);

    return heroes.length ? mapFromHeroes(heroes) : null;
  } catch {
    return null;
  }
}

function saveStoredProPlayerMap(proPlayers: Map<number, PlayerProfileLookup>) {
  try {
    const players = Array.from(proPlayers.values());
    localStorage.setItem(
      proPlayerStorageKey,
      JSON.stringify({
        cachedAt: Date.now(),
        players,
      } satisfies StoredProPlayers),
    );
  } catch {
    // Ignore storage failures; the in-memory cache still avoids repeated calls in this session.
  }
}

function saveStoredHeroMap(heroes: Map<number, HeroLookup>) {
  try {
    localStorage.setItem(
      heroStorageKey,
      JSON.stringify({
        cachedAt: Date.now(),
        heroes: Array.from(heroes.values()),
      } satisfies StoredHeroes),
    );
  } catch {
    // Ignore storage failures; the in-memory cache still avoids repeated calls in this session.
  }
}

async function fetchProPlayerMap() {
  const url = new URL("https://api.opendota.com/api/proPlayers");

  const response = await fetch(url);
  if (!response.ok) {
    return new Map<number, PlayerProfileLookup>();
  }

  const data = (await response.json()) as OpenDotaProPlayerResponse[];
  const proPlayers = Array.isArray(data) ? data : [];

  const proPlayerMap = new Map(
    proPlayers
      .map(normalizeProPlayer)
      .filter((player): player is PlayerProfileLookup => player !== null)
      .map((player) => [player.accountId, player]),
  );
  saveStoredProPlayerMap(proPlayerMap);

  return proPlayerMap;
}

async function fetchHeroMap() {
  const url = new URL("https://api.opendota.com/api/heroes");

  const response = await fetch(url);
  if (!response.ok) {
    return new Map<number, HeroLookup>();
  }

  const data = (await response.json()) as OpenDotaHeroResponse[];
  const apiHeroes = Array.isArray(data) ? data : [];
  const heroes = new Map(
    apiHeroes
      .map(normalizeHero)
      .filter((hero): hero is HeroLookup => hero !== null)
      .map((hero) => [hero.id, hero]),
  );
  saveStoredHeroMap(heroes);

  return heroes;
}

export function fetchOpenDotaProPlayerMap() {
  if (proPlayerCache) {
    return proPlayerCache;
  }

  const stored = loadStoredProPlayerMap();
  if (stored) {
    proPlayerCache = Promise.resolve(stored);
    return proPlayerCache;
  }

  proPlayerCache = fetchProPlayerMap().catch(() => {
    proPlayerCache = null;
    return new Map<number, PlayerProfileLookup>();
  });
  return proPlayerCache;
}

export function fetchOpenDotaHeroMap() {
  if (heroCache) {
    return heroCache;
  }

  const stored = loadStoredHeroMap();
  if (stored) {
    heroCache = Promise.resolve(stored);
    return heroCache;
  }

  heroCache = fetchHeroMap().catch(() => {
    heroCache = null;
    return new Map<number, HeroLookup>();
  });
  return heroCache;
}

export async function findOpenDotaProProfiles(
  players: ReplayPlayer[],
): Promise<Record<string, PlayerProfileLookup>> {
  const proPlayers = await fetchOpenDotaProPlayerMap();
  const profiles: Array<[string, PlayerProfileLookup]> = [];

  for (const player of players) {
    if (isSourceTvPlayer(player)) {
      continue;
    }

    const accountId = openDotaAccountIdForPlayer(player);
    if (!accountId) {
      continue;
    }

    const profile = proPlayers.get(accountId);
    if (profile) {
      profiles.push([player.steam_id, profile]);
    }
  }

  return Object.fromEntries(profiles);
}

export async function findOpenDotaHeroes(
  players: ReplayPlayer[],
): Promise<Record<number, HeroLookup>> {
  const heroes = await fetchOpenDotaHeroMap();
  const heroEntries: Array<[number, HeroLookup]> = [];

  for (const player of players) {
    if (!player.hero_id) {
      continue;
    }

    const hero = heroes.get(player.hero_id);
    if (hero) {
      heroEntries.push([player.hero_id, hero]);
    }
  }

  return Object.fromEntries(heroEntries);
}
