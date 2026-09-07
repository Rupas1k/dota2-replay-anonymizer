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
      className={`grid gap-1 rounded-sm bg-input p-[5px] ${options.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            className={`min-h-9 min-w-0 cursor-pointer rounded-sm px-[9px] py-[7px] text-sm leading-snug font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent/70 ${
              selected
                ? "bg-control text-app-text hover:bg-control-hover"
                : "bg-transparent text-muted hover:bg-white/4 hover:text-app-text"
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
