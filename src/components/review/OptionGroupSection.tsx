import type { OptionGroup } from "../../anonymizer/optionCatalog";
import type { UiOptionKey, UiOptions } from "../../types";
import { OptionToggle } from "./OptionToggle";

type OptionGroupSectionProps = {
  group: OptionGroup;
  options: UiOptions;
  onOptionChange: (key: UiOptionKey, value: boolean) => void;
};

export function OptionGroupSection({ group, options, onOptionChange }: OptionGroupSectionProps) {
  return (
    <section className="grid gap-3">
      <header className="flex items-center gap-2.5 after:h-px after:flex-1 after:bg-border">
        <h3 className="m-0 text-base text-app-text">{group.title}</h3>
      </header>

      <div className="grid gap-3">
        {group.sections.map((section) => (
          <section
            className="grid grid-cols-[minmax(170px,220px)_minmax(0,1fr)] items-start gap-[18px] p-0 max-[980px]:grid-cols-1"
            key={section.title}
          >
            <div className="grid min-w-0 content-start pt-2.5">
              <h4 className="m-0 text-[0.95rem] font-medium text-muted-strong">{section.title}</h4>
            </div>
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-[9px] max-[720px]:grid-cols-1 [&>*:only-child]:col-span-full [&>*:nth-last-child(1):nth-child(odd)]:col-span-full">
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
  );
}
