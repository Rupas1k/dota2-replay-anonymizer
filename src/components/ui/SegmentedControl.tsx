type Segment<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  ariaLabel: string;
  options: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  ariaLabel,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`grid gap-1 rounded-lg bg-input p-[3px] ${options.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            className={`min-h-9 min-w-0 cursor-pointer rounded-lg border px-3 py-[7px] font-bold transition-colors focus-visible:border-accent focus-visible:outline-3 focus-visible:outline-blue-500/20 ${
              selected
                ? "border-accent/55 bg-[#142538] text-accent-strong shadow-[inset_0_0_0_1px_rgba(102,168,232,0.08)] hover:border-accent/70 hover:bg-[#182d43]"
                : "border-transparent bg-transparent text-muted-strong hover:border-border-strong hover:bg-surface"
            }`}
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
