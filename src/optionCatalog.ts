import type { UiOptionKey } from "./types";

export type OptionItem = {
  key?: UiOptionKey;
  title: string;
  description: string;
  inactiveDescription?: string;
  locked?: boolean;
  checked?: boolean;
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
            checked: true,
            locked: true,
            title: "Steam IDs",
            description:
              "Always clears Steam IDs from user info, player resources, controllers, and team data.",
          },
          {
            key: "removePlayerNames",
            title: "Player names",
            description: "Will replace player names in user info and entity data.",
            inactiveDescription: "Keeps replay player names unchanged.",
          },
        ],
      },
      {
        title: "Cosmetics",
        items: [
          {
            checked: true,
            locked: true,
            title: "Hero cosmetics",
            description: "Always removes hero-specific cosmetic identity.",
          },
          {
            key: "removeCourierCosmetics",
            title: "Courier cosmetics",
            description: "Will normalize player-owned courier models.",
            inactiveDescription: "Keeps player-owned courier models unchanged.",
          },
          {
            key: "removeWardCosmetics",
            title: "Ward cosmetics",
            description: "Will normalize observer and sentry ward models.",
            inactiveDescription: "Keeps observer and sentry ward models unchanged.",
          },
          {
            key: "removePoogieCosmetics",
            title: "Poogie cosmetics",
            description: "Will normalize poogie model data.",
            inactiveDescription: "Keeps poogie model data unchanged.",
          },
          {
            key: "removeStatueCosmetics",
            title: "Effigy statue cosmetics",
            description: "Will remove statue wearable handles.",
            inactiveDescription: "Keeps statue wearable handles unchanged.",
          },
        ],
      },
      {
        title: "Profile",
        items: [
          {
            key: "removeDotaPlusBadges",
            title: "Dota Plus",
            description: "Will remove player Dota Plus level, icons, and badges.",
            inactiveDescription: "Keeps player Dota Plus level, icons, and badges unchanged.",
          },
          {
            key: "removeGuildData",
            title: "Guild data",
            description: "Will clear guild ID, logo, colors, and tier.",
            inactiveDescription: "Keeps guild ID, logo, colors, and tier unchanged.",
          },
        ],
      },
      {
        title: "Input traces",
        items: [
          {
            key: "removeCameraMovements",
            title: "Camera movements",
            description: "Will remove camera-to-unit replay messages.",
            inactiveDescription: "Keeps camera-to-unit replay messages unchanged.",
          },
          {
            key: "removeMouseMovements",
            title: "Mouse movements",
            description: "Will remove spectator cursor and target traces.",
            inactiveDescription: "Keeps spectator cursor and target traces unchanged.",
          },
          {
            key: "removeClickMovements",
            title: "Click movements",
            description: "Will remove selection and click activity traces.",
            inactiveDescription: "Keeps selection and click activity traces unchanged.",
          },
        ],
      },
      {
        title: "Communication",
        items: [
          {
            key: "removeChatMessages",
            title: "Chat messages",
            description: "Will remove chat messages from anonymized players.",
            inactiveDescription: "Keeps player chat messages unchanged.",
          },
          {
            key: "removeChatWheel",
            title: "Chat wheel",
            description: "Will remove chat wheel messages from anonymized players.",
            inactiveDescription: "Keeps player chat wheel messages unchanged.",
          },
          {
            key: "removeMapPings",
            title: "Map pings",
            description: "Will remove map pings from anonymized players.",
            inactiveDescription: "Keeps player map pings unchanged.",
          },
          {
            key: "removeMinimapDrawings",
            title: "Minimap drawings",
            description: "Will remove minimap drawings from anonymized players.",
            inactiveDescription: "Keeps player minimap drawings unchanged.",
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
            description: "Will clear the global match identifier from game rules.",
            inactiveDescription: "Keeps the global match identifier unchanged.",
          },
          {
            key: "removeLobbyName",
            title: "Lobby name",
            description: "Will clear custom lobby names from game rules.",
            inactiveDescription: "Keeps custom lobby names unchanged.",
          },
        ],
      },
      {
        title: "Team identity",
        items: [
          {
            key: "removeTeamName",
            title: "Team name",
            description: "Will clear player-team display names.",
            inactiveDescription: "Keeps player-team display names unchanged.",
          },
          {
            key: "removeTeamTag",
            title: "Team tag",
            description: "Will clear short team tags.",
            inactiveDescription: "Keeps short team tags unchanged.",
          },
          {
            key: "removeTournamentTeamId",
            title: "Tournament team ID",
            description: "Will clear tournament team identifiers.",
            inactiveDescription: "Keeps tournament team identifiers unchanged.",
          },
          {
            key: "removeTeamLogo",
            title: "Team logos",
            description: "Will clear logo, base logo, and banner logo handles.",
            inactiveDescription: "Keeps logo, base logo, and banner logo handles unchanged.",
          },
        ],
      },
      {
        title: "Logs and effects",
        items: [
          {
            key: "removeCombatLog",
            title: "Combat log",
            description: "Will remove combat log messages and derived combat event history.",
            inactiveDescription: "Keeps combat log messages and derived combat history unchanged.",
          },
        ],
      },
    ],
  },
];
