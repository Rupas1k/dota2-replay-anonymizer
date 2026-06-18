import type { UiOptionKey } from "../types";

export type OptionItem = {
  key?: UiOptionKey;
  title: string;
  description: string;
  tooltip?: string;
  inactiveDescription?: string;
};

export type OptionSection = {
  title: string;
  items: OptionItem[];
};

export type OptionGroup = {
  title: string;
  sections: OptionSection[];
};

export const optionGroups: OptionGroup[] = [
  {
    title: "Selected Players",
    sections: [
      {
        title: "Identity",
        items: [
          {
            key: "removePlayerSteamIds",
            title: "Steam IDs",
            description: "Remove player Steam IDs.",
            inactiveDescription: "Keep Steam IDs.",
            tooltip: "Main identifier that links players to their profiles",
          },
          {
            key: "removePlayerNames",
            title: "Player names",
            description: "Replace player names with anonymous names.",
            inactiveDescription: "Keep player names.",
            tooltip: "Names that are used when steam IDs are not available",
          },
        ],
      },
      {
        title: "Cosmetics",
        items: [
          {
            key: "removeHeroCosmetics",
            title: "Hero cosmetics",
            description: "Remove hero cosmetic items.",
            inactiveDescription: "Keep hero cosmetics.",
            tooltip: "Arcana models and personas are kept and may be broken",
          },
          {
            key: "removeCourierCosmetics",
            title: "Couriers",
            description: "Replace courier models with defaults.",
            inactiveDescription: "Keep courier models.",
          },
          {
            key: "removeWardCosmetics",
            title: "Wards",
            description: "Replace observer and sentry ward models with defaults.",
            inactiveDescription: "Keep ward models.",
          },
          {
            key: "removePoogieCosmetics",
            title: "Poogies",
            description: "Replace poogie models with the default.",
            inactiveDescription: "Keep poogie cosmetics.",
          },
          {
            key: "removeStatueCosmetics",
            title: "Effigy statues",
            description: "Remove effigy statue wearables.",
            inactiveDescription: "Keep statue wearables.",
          },
        ],
      },
      {
        title: "Profile",
        items: [
          {
            key: "removeDotaPlusBadges",
            title: "Dota Plus",
            description: "Clear Dota Plus levels, icons, and badges.",
            inactiveDescription: "Keep Dota Plus profile details.",
          },
          {
            key: "removeGuildData",
            title: "Guild data",
            description: "Clear guild ID, logo, colors, and tier.",
            inactiveDescription: "Keep guild details.",
          },
        ],
      },
      {
        title: "Input traces",
        items: [
          {
            key: "removeCameraMovements",
            title: "Camera movements",
            description: "Remove camera movements.",
            inactiveDescription: "Keep camera movements.",
          },
          {
            key: "removeMouseMovements",
            title: "Mouse movements",
            description: "Remove cursor movements.",
            inactiveDescription: "Keep cursor movements.",
          },
          {
            key: "removeClicks",
            title: "Clicks",
            description: "Remove click traces.",
            inactiveDescription: "Keep click traces.",
          },
        ],
      },
      {
        title: "Communication",
        items: [
          {
            key: "removeChatMessages",
            title: "Text chat",
            description: "Remove chat messages.",
            inactiveDescription: "Keep chat messages.",
          },
          {
            key: "removeChatWheel",
            title: "Chat wheel",
            description: "Remove chat wheel lines.",
            inactiveDescription: "Keep chat wheel lines.",
          },
          {
            key: "removeMapPings",
            title: "Map pings",
            description: "Remove map pings.",
            inactiveDescription: "Keep map pings.",
          },
          {
            key: "removeMinimapDrawings",
            title: "Minimap drawings",
            description: "Remove minimap drawings.",
            inactiveDescription: "Keep minimap drawings.",
          },
        ],
      },
    ],
  },
  {
    title: "Global",
    sections: [
      {
        title: "Identifiers",
        items: [
          {
            key: "removeMatchId",
            title: "Match ID",
            description: "Clear the replay match ID.",
            inactiveDescription: "Keep the match ID.",
          },
          {
            key: "removeLobbyName",
            title: "Lobby name",
            description: "Clear custom lobby name.",
            inactiveDescription: "Keep lobby names.",
          },
          {
            key: "removeLeagueInfo",
            title: "League info",
            description: "Clear league IDs from the replay.",
            inactiveDescription: "Keep league IDs.",
          },
        ],
      },
      {
        title: "Team identity",
        items: [
          {
            key: "removeTeamName",
            title: "Team name",
            description: "Clear Radiant and Dire team names.",
            inactiveDescription: "Keep team names.",
          },
          {
            key: "removeTeamTag",
            title: "Team tag",
            description: "Clear short team tags.",
            inactiveDescription: "Keep team tags.",
          },
          {
            key: "removeTournamentTeamId",
            title: "Tournament team ID",
            description: "Clear tournament team IDs.",
            inactiveDescription: "Keep tournament team IDs.",
          },
          {
            key: "removeTeamLogo",
            title: "Team logos",
            description: "Clear logo, base logo, and banner logo.",
            inactiveDescription: "Keep team logos.",
          },
        ],
      },
      {
        title: "Extra",
        items: [
          {
            key: "removeCombatLog",
            title: "Combat log",
            description: "Remove combat log messages.",
            inactiveDescription: "Keep combat log data.",
          },
          {
            key: "removeBroadcasterInfo",
            title: "Broadcaster info",
            description: "Clear broadcaster channels and voice data.",
            inactiveDescription: "Keep broadcaster info.",
          },
        ],
      },
    ],
  },
];
