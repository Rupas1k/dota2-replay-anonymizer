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
    <section className="review-section options-review">
      <div className="option-board">
        <section className="option-group">
          <header className="option-group-head">
            <h3>Players to anonymize</h3>
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
