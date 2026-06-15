import { useState } from "react";

type SteamIdListInputProps = {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
};

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

export function SteamIdListInput({
  label,
  placeholder,
  values,
  onChange,
}: SteamIdListInputProps) {
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
