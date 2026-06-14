import { useState } from "react";
import { optionGroups, type OptionItem } from "../../anonymizer/optionCatalog";
import type {
  PlayerSelectionMode,
  ProAnonymizeMode,
  SpectatorAnonymizeMode,
  UiOptionKey,
  UiOptions,
} from "../../types";

type OptionsReviewProps = {
  options: UiOptions;
  onOptionChange: (key: UiOptionKey, value: boolean) => void;
  onOptionsChange: (patch: Partial<UiOptions>) => void;
};


function OptionToggle({
  option,
  options,
  onOptionChange,
}: {
  option: OptionItem;
  options: UiOptions;
  onOptionChange: (key: UiOptionKey, value: boolean) => void;
}) {
  const checked = option.key ? options[option.key] : false;
  const description = checked
    ? option.description
    : (option.inactiveDescription ?? "Leave this data as-is.");

  return (
    <label className={`option-toggle${checked ? " is-checked" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
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
