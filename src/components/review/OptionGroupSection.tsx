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
    <section className="option-group">
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
  );
}
