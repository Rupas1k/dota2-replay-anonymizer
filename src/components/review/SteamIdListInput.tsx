import { useEffect, useMemo, useState } from "react";

type SteamIdListInputProps = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
};

const splitSteamIds = (value: string) =>
  value
    .split(/[\s,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);

const isSteamId64 = (value: string) => /^\d{17}$/.test(value);

function parseSteamIds(value: string) {
  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  let duplicates = 0;

  for (const entry of splitSteamIds(value)) {
    if (!isSteamId64(entry)) {
      invalid.push(entry);
      continue;
    }

    if (seen.has(entry)) {
      duplicates += 1;
      continue;
    }

    seen.add(entry);
    valid.push(entry);
  }

  return { valid, invalid, duplicates };
}

const listText = (values: string[]) => values.join("\n");

export function SteamIdListInput({ label, values, onChange }: SteamIdListInputProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => listText(values));
  const parsed = useMemo(() => parseSteamIds(draft), [draft]);
  const preview = values.slice(0, 2).join(", ");
  const countText = values.length === 1 ? "1 Steam ID" : `${values.length} Steam IDs`;
  const invalidText =
    parsed.invalid.length === 1 ? "1 invalid value" : `${parsed.invalid.length} invalid values`;
  const duplicateText = parsed.duplicates === 1 ? "1 duplicate" : `${parsed.duplicates} duplicates`;

  useEffect(() => {
    if (!editing) {
      setDraft(listText(values));
    }
  }, [editing, values]);

  const startEditing = () => {
    setDraft(listText(values));
    setEditing(true);
  };

  const applyChanges = () => {
    onChange(parsed.valid);
    setDraft(listText(parsed.valid));
    setEditing(false);
  };

  const cancelEditing = () => {
    setDraft(listText(values));
    setEditing(false);
  };

  return (
    <section className={`steam-id-list-field${editing ? " is-editing" : ""}`} aria-label={label}>
      <div className="steam-id-list-head">
        <div>
          <strong>{label}</strong>
          <span>{values.length ? countText : "No overrides"}</span>
        </div>
        <button type="button" onClick={startEditing}>
          {values.length ? "Edit" : "Add"}
        </button>
      </div>

      {!editing && values.length ? (
        <p className="steam-id-preview">
          {preview}
          {values.length > 2 ? `, +${values.length - 2} more` : ""}
        </p>
      ) : null}

      {editing ? (
        <div className="steam-id-editor">
          <textarea
            value={draft}
            rows={8}
            spellCheck={false}
            placeholder={"76561198000000000\n76561198000000001"}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className="steam-id-editor-summary">
            <span>{parsed.valid.length ? `${parsed.valid.length} ready` : "No valid IDs"}</span>
            {parsed.invalid.length ? <span>{invalidText}</span> : null}
            {parsed.duplicates ? <span>{duplicateText}</span> : null}
          </div>
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
        </div>
      ) : null}
    </section>
  );
}
