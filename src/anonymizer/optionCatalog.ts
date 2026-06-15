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
    title: "Player Specific",
    sections: [
      {
        title: "Identity",
        items: [
          {
            key: "removePlayerSteamIds",
            title: "Steam IDs",
            description: "Remove Steam IDs from the replay.",
            inactiveDescription: "Keep Steam IDs.",
            tooltip: "Main identifier that links player to their profiles",
          },
          {
            key: "removePlayerNames",
            title: "Player names",
            description: "Replace names with anonymous ones.",
            inactiveDescription: "Leave names as they are.",
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
            description: "Remove hero cosmetics from the replay.",
            inactiveDescription: "Keep hero cosmetics.",
            tooltip: "Arcana models and personas are kept and may be broken",
          },
          {
            key: "removeCourierCosmetics",
            title: "Couriers",
            description: "Use default courier models.",
            inactiveDescription: "Keep courier models.",
          },
          {
            key: "removeWardCosmetics",
            title: "Wards",
            description: "Use default observer and sentry ward models.",
            inactiveDescription: "Keep ward models.",
          },
          {
            key: "removePoogieCosmetics",
            title: "Poogies",
            description: "Use the default poogie model.",
            inactiveDescription: "Keep poogie cosmetics.",
          },
          {
            key: "removeStatueCosmetics",
            title: "Effigy statues",
            description: "Drop statue wearables.",
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
            description: "Hide levels, icons, and badges.",
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
            inactiveDescription: "Keep camera traces.",
          },
          {
            key: "removeMouseMovements",
            title: "Mouse movements",
            description: "Remove cursor movements.",
            inactiveDescription: "Keep mouse traces.",
          },
          {
            key: "removeClickMovements",
            title: "Click movements",
            description: "Remove selection and click traces.",
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
            description: "Remove chat messages from anonymized players.",
            inactiveDescription: "Keep text chat.",
          },
          {
            key: "removeChatWheel",
            title: "Chat wheel",
            description: "Remove chat wheel lines from anonymized players.",
            inactiveDescription: "Keep chat wheel lines.",
          },
          {
            key: "removeMapPings",
            title: "Map pings",
            description: "Remove pings from anonymized players.",
            inactiveDescription: "Keep map pings.",
          },
          {
            key: "removeMinimapDrawings",
            title: "Minimap drawings",
            description: "Remove minimap drawings from anonymized players.",
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
            description: "Clear the replay match identifier.",
            inactiveDescription: "Keep the match ID.",
          },
          {
            key: "removeLobbyName",
            title: "Lobby name",
            description: "Clear custom lobby names.",
            inactiveDescription: "Keep lobby names.",
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
        title: "Logs and effects",
        items: [
          {
            key: "removeCombatLog",
            title: "Combat log",
            description: "Remove combat log messages.",
            inactiveDescription: "Keep combat log data.",
          },
        ],
      },
    ],
  },
];
