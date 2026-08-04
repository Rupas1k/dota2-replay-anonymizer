import type { OptionItem } from "../../anonymizer/optionCatalog";
import type { UiOptionKey, UiOptions } from "../../types";
import { InfoTooltip } from "../ui/InfoTooltip";

type OptionToggleProps = {
  option: OptionItem;
  options: UiOptions;
  onOptionChange: (key: UiOptionKey, value: boolean) => void;
};

export function OptionToggle({ option, options, onOptionChange }: OptionToggleProps) {
  const checked = option.key ? options[option.key] : false;
  const description = checked
    ? option.description
    : (option.inactiveDescription ?? "Leave this data as-is.");

  return (
    <label
      className={`group relative grid min-h-[92px] cursor-pointer grid-cols-[minmax(0,1fr)_44px] items-start gap-3.5 rounded-lg border px-[13px] py-3 transition-colors hover:border-accent/30 ${checked ? "border-accent/40 bg-blue-950/25" : "border-slate-700/45 bg-surface"}`}
    >
      <input
        className="peer absolute size-px overflow-hidden whitespace-nowrap [clip-path:inset(50%)] [clip:rect(0_0_0_0)]"
        type="checkbox"
        checked={checked}
        onChange={(event) => {
          if (option.key) {
            onOptionChange(option.key, event.target.checked);
          }
        }}
      />
      <span className="min-w-0">
        <span className="flex items-start justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <strong className="block text-[0.88rem]">{option.title}</strong>
            {option.tooltip && <InfoTooltip text={option.tooltip} />}
          </span>
        </span>
        <small className="mt-[3px] block text-sm leading-snug text-muted">{description}</small>
      </span>
      <span
        className={`relative col-start-2 row-start-1 mt-px h-6 w-[42px] rounded-full border transition-colors peer-focus-visible:outline-3 peer-focus-visible:outline-blue-500/20 peer-focus-visible:outline-offset-2 ${checked ? "border-accent/70 bg-accent/20" : "border-slate-600 bg-input"}`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-[3px] left-[3px] size-4 rounded-full transition-[transform,background] ${checked ? "translate-x-[18px] bg-accent-strong" : "bg-slate-400"}`}
        />
      </span>
    </label>
  );
}
