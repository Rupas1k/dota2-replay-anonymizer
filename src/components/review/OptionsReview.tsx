import { useState } from "react";
import type {
  PlayerSelectionMode,
  ProAnonymizeMode,
  SpectatorAnonymizeMode,
  UiOptionKey,
  UiOptions,
} from "../../types";

type OptionItem = {
  key?: UiOptionKey;
  title: string;
  description: string;
  inactiveDescription?: string;
  locked?: boolean;
  checked?: boolean;
};

type OptionSection = {
  title: string;
  items: OptionItem[];
};

type OptionGroup = {
  title: string;
  sections: OptionSection[];
};

type OptionsReviewProps = {
  options: UiOptions;
  onOptionChange: (key: UiOptionKey, value: boolean) => void;
  onOptionsChange: (patch: Partial<UiOptions>) => void;
};

const optionGroups: OptionGroup[] = [
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

function optionChecked(option: OptionItem, options: UiOptions) {
  if (option.locked) {
    return option.checked ?? true;
  }

  return option.key ? options[option.key] : false;
}

function OptionToggle({
  option,
  options,
  onOptionChange,
}: {
  option: OptionItem;
  options: UiOptions;
  onOptionChange: (key: UiOptionKey, value: boolean) => void;
}) {
  const checked = optionChecked(option, options);
  const disabled = Boolean(option.locked || !option.key);
  const description = checked
    ? option.description
    : (option.inactiveDescription ?? "Keeps this data unchanged.");

  return (
    <label className={`option-toggle${checked ? " is-checked" : ""}${disabled ? " is-locked" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => {
          if (option.key) {
            onOptionChange(option.key, event.target.checked);
          }
        }}
      />
      <span className="option-copy">
        <span className="option-title-row">
          <strong>{option.title}</strong>
        </span>
        <small>{description}</small>
      </span>
      <span className="option-switch" aria-hidden="true">
        <span />
      </span>
    </label>
  );
}

function parseSteamIdList(value: string) {
  const seen = new Set<string>();

  return value
    .split(/[\s,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry) => {
      if (seen.has(entry)) {
        return false;
      }

      seen.add(entry);
      return true;
    });
}

function SteamIdListInput({
  label,
  placeholder,
  values,
  onChange,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(values.join("\n"));
  const preview = values.slice(0, 3).join(", ");
  const countText = values.length === 1 ? "1 Steam ID" : `${values.length} Steam IDs`;

  const startEditing = () => {
    setDraft(values.join("\n"));
    setEditing(true);
  };

  const applyChanges = () => {
    onChange(parseSteamIdList(draft));
    setEditing(false);
  };

  const cancelEditing = () => {
    setDraft(values.join("\n"));
    setEditing(false);
  };

  return (
    <div className={`steam-id-list-field${editing ? " is-editing" : ""}`}>
      <div className="steam-id-list-head">
        <div>
          <strong>{label}</strong>
          <span>{values.length ? countText : "No overrides"}</span>
        </div>
        <button type="button" onClick={startEditing}>
          {values.length ? "Edit" : "Add"}
        </button>
      </div>

      {values.length && !editing ? (
        <p className="steam-id-preview">
          {preview}
          {values.length > 3 ? `, +${values.length - 3} more` : ""}
        </p>
      ) : null}

      {editing ? (
        <div className="steam-id-editor">
          <textarea
            value={draft}
            rows={6}
            placeholder={placeholder}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className="steam-id-editor-actions">
            <button type="button" onClick={() => setDraft("")}>
              Clear
            </button>
            <button type="button" onClick={cancelEditing}>
              Cancel
            </button>
            <button type="button" className="primary-action" onClick={applyChanges}>
              Apply
            </button>
          </div>
          <small>Paste one SteamID64 per line. Spaces, commas, and duplicates are cleaned on apply.</small>
        </div>
      ) : null}
    </div>
  );
}

export function OptionsReview({
  options,
  onOptionChange,
  onOptionsChange,
}: OptionsReviewProps) {
  const setSelectionMode = (mode: PlayerSelectionMode) => {
    onOptionsChange({ playerSelectionMode: mode });
  };

  const setProMode = (mode: ProAnonymizeMode) => {
    onOptionsChange({ proAnonymizeMode: mode });
  };

  const setSpectatorMode = (mode: SpectatorAnonymizeMode) => {
    onOptionsChange({ spectatorAnonymizeMode: mode });
  };

  return (
    <section className="review-section options-review">
      <div className="option-board">
        <section className="option-group">
          <header className="option-group-head">
            <h3>Players to anonymize</h3>
          </header>

          <div className="player-rule-panel">
            <div className="player-rule-row">
              <span className="rule-label">Default</span>
              <div className="segmented-control" role="group" aria-label="Default player selection">
                <button
                  type="button"
                  className={options.playerSelectionMode === "includeAll" ? "is-active" : ""}
                  onClick={() => setSelectionMode("includeAll")}
                >
                  Anonymize all
                </button>
                <button
                  type="button"
                  className={options.playerSelectionMode === "excludeAll" ? "is-active" : ""}
                  onClick={() => setSelectionMode("excludeAll")}
                >
                  Keep all
                </button>
              </div>
            </div>

            <div className="player-rule-row">
              <span className="rule-label">Pro players</span>
              <div className="segmented-control is-three" role="group" aria-label="Pro player override">
                <button
                  type="button"
                  className={options.proAnonymizeMode === "ignore" ? "is-active" : ""}
                  onClick={() => setProMode("ignore")}
                >
                  No override
                </button>
                <button
                  type="button"
                  className={options.proAnonymizeMode === "includePro" ? "is-active" : ""}
                  onClick={() => setProMode("includePro")}
                >
                  Anonymize pros
                </button>
                <button
                  type="button"
                  className={options.proAnonymizeMode === "excludePro" ? "is-active" : ""}
                  onClick={() => setProMode("excludePro")}
                >
                  Keep pros
                </button>
              </div>
            </div>

            <div className="player-rule-row">
              <span className="rule-label">Spectators</span>
              <div className="segmented-control is-three" role="group" aria-label="Spectator player override">
                <button
                  type="button"
                  className={options.spectatorAnonymizeMode === "ignore" ? "is-active" : ""}
                  onClick={() => setSpectatorMode("ignore")}
                >
                  No override
                </button>
                <button
                  type="button"
                  className={options.spectatorAnonymizeMode === "includeSpectators" ? "is-active" : ""}
                  onClick={() => setSpectatorMode("includeSpectators")}
                >
                  Anonymize spectators
                </button>
                <button
                  type="button"
                  className={options.spectatorAnonymizeMode === "excludeSpectators" ? "is-active" : ""}
                  onClick={() => setSpectatorMode("excludeSpectators")}
                >
                  Keep spectators
                </button>
              </div>
            </div>

            <div className="player-rule-row">
              <span className="rule-label">Steam IDs</span>
              <div className="steam-id-rule-grid">
                <SteamIdListInput
                  label="Always anonymize players"
                  placeholder={"76561198000000000\n76561198000000001"}
                  values={options.includeSteamIds}
                  onChange={(includeSteamIds) => onOptionsChange({ includeSteamIds })}
                />
                <SteamIdListInput
                  label="Never anonymize players"
                  placeholder={"76561198000000000\n76561198000000001"}
                  values={options.excludeSteamIds}
                  onChange={(excludeSteamIds) => onOptionsChange({ excludeSteamIds })}
                />
              </div>
            </div>
          </div>
        </section>

        {optionGroups.map((group) => (
          <section className="option-group" key={group.title}>
            <header className="option-group-head">
              <h3>{group.title}</h3>
            </header>

            <div className="option-category-list">
              {group.sections.map((section) => (
                <section className="option-category" key={section.title}>
                  <div className="option-category-meta">
                    <h4>{section.title}</h4>
                  </div>
                  <div className="option-toggle-grid">
                    {section.items.map((option) => (
                      <OptionToggle
                        key={option.key ?? option.title}
                        option={option}
                        options={options}
                        onOptionChange={onOptionChange}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
