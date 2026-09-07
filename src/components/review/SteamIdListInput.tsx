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
  const invalidText =
    parsed.invalid.length === 1 ? "1 invalid value" : `${parsed.invalid.length} invalid values`;
  const duplicateText = parsed.duplicates === 1 ? "1 duplicate" : `${parsed.duplicates} duplicates`;
  const editLabel = `${values.length ? "Edit" : "Add"} ${label.toLowerCase()} Steam IDs`;
  const entryCountText = values.length === 1 ? "1 entry" : `${values.length} entries`;

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
    <section className="grid min-w-0 gap-2" aria-label={label}>
      <div className="flex min-w-0 items-center justify-between gap-3">
        <span className="flex min-w-0 items-baseline gap-2">
          <strong className="truncate text-sm font-medium text-muted-strong">{label}</strong>
          <span className="shrink-0 text-xs text-muted">{entryCountText}</span>
        </span>
        {!editing ? (
          <button
            className="inline-grid size-7 shrink-0 cursor-pointer place-items-center rounded-sm border-0 bg-transparent p-0 text-muted transition-colors hover:bg-control hover:text-app-text focus-visible:outline-2 focus-visible:outline-accent/70"
            type="button"
            aria-label={editLabel}
            onClick={startEditing}
          >
            <svg
              className="size-3.5 fill-none stroke-current stroke-[1.8]"
              aria-hidden="true"
              viewBox="0 0 24 24"
            >
              <path d="m4 20 4.2-1 10.7-10.7a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z" />
              <path d="m14.5 6.7 2.8 2.8" />
            </svg>
          </button>
        ) : null}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          <textarea
            className="min-h-32 w-full resize-y rounded-sm border border-border bg-input px-2.5 py-2 font-mono text-sm text-app-text focus:border-accent focus:outline-2 focus:outline-accent/70"
            value={draft}
            rows={6}
            spellCheck={false}
            placeholder={"76561198000000000\n76561198000000001"}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            {parsed.invalid.length || parsed.duplicates ? (
              <div className="flex flex-wrap items-center gap-2 text-xs text-warning">
                {parsed.invalid.length ? <span>{invalidText}</span> : null}
                {parsed.duplicates ? <span>{duplicateText}</span> : null}
              </div>
            ) : null}
            <div className="ml-auto flex items-center gap-2">
              <Button size="small" onClick={cancelEditing}>
                Cancel
              </Button>
              <Button size="small" variant="primary" onClick={applyChanges}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
