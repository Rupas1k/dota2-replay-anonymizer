import { optionGroups } from "../../anonymizer/optionCatalog";
import type { UiOptionKey, UiOptions } from "../../types";
import { OptionGroupSection } from "./OptionGroupSection";
import { PlayerRulesPanel } from "./PlayerRulesPanel";

type OptionsReviewProps = {
  options: UiOptions;
  onOptionChange: (key: UiOptionKey, value: boolean) => void;
  onOptionsChange: (patch: Partial<UiOptions>) => void;
};

export function OptionsReview({ options, onOptionChange, onOptionsChange }: OptionsReviewProps) {
  return (
    <section className="grid gap-5">
      <div className="grid gap-6 max-[980px]:grid-cols-1">
        <section className="grid gap-3">
          <header className="flex items-center gap-2.5 after:h-px after:flex-1 after:bg-[rgba(80,99,115,0.34)]">
            <h3 className="m-0 text-base text-app-text">Players to anonymize</h3>
          </header>

          <PlayerRulesPanel options={options} onOptionsChange={onOptionsChange} />
        </section>

        {optionGroups.map((group) => (
          <OptionGroupSection
            key={group.title}
            group={group}
            options={options}
            onOptionChange={onOptionChange}
          />
        ))}
      </div>
    </section>
  );
}
