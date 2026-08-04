import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/Button";

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
    <section
      className={`flex min-w-0 flex-col rounded-lg border border-slate-700/45 bg-surface p-3 ${editing ? "gap-2.5" : "gap-2"}`}
      aria-label={label}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col items-start gap-2">
          <strong className="overflow-hidden text-sm text-ellipsis whitespace-nowrap text-muted-strong">
            {label}
          </strong>
          <span className="overflow-hidden text-xs text-ellipsis whitespace-nowrap text-muted">
            {values.length ? countText : "No overrides"}
          </span>
        </div>
        <button
          className="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-sm font-bold text-accent-strong hover:text-blue-200 focus-visible:outline-3 focus-visible:outline-blue-500/20"
          type="button"
          onClick={startEditing}
        >
          {values.length ? "Edit" : "Add"}
        </button>
      </div>

      {!editing && values.length ? (
        <p className="m-0 overflow-hidden font-mono text-xs text-ellipsis whitespace-nowrap text-muted">
          {preview}
          {values.length > 2 ? `, +${values.length - 2} more` : ""}
        </p>
      ) : null}

      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            className="min-h-40 w-full resize-y rounded-lg border border-border bg-input px-2.5 py-2 font-mono text-sm text-app-text focus:border-accent focus:outline-3 focus:outline-blue-500/20"
            value={draft}
            rows={8}
            spellCheck={false}
            placeholder={"76561198000000000\n76561198000000001"}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted [&>span:not(:first-child)]:text-warning">
            <span>{parsed.valid.length ? `${parsed.valid.length} ready` : "No valid IDs"}</span>
            {parsed.invalid.length ? <span>{invalidText}</span> : null}
            {parsed.duplicates ? <span>{duplicateText}</span> : null}
          </div>
          <div className="flex flex-wrap items-center justify-start gap-2">
            <Button size="small" onClick={() => setDraft("")}>
              Clear
            </Button>
            <Button size="small" onClick={cancelEditing}>
              Cancel
            </Button>
            <Button size="small" variant="primary" onClick={applyChanges}>
              Apply
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
