import type { OptionItem } from "../../anonymizer/optionCatalog";
import type { UiOptionKey, UiOptions } from "../../types";
import { InfoTooltip } from "../InfoTooltip";

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
    <label className={`option-toggle${checked ? " is-checked" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => {
          if (option.key) {
            onOptionChange(option.key, event.target.checked);
          }
        }}
      />
      <span className="option-copy">
        <span className="option-title-row">
          <span>
            <strong>{option.title}</strong>
            {option.tooltip && <InfoTooltip text={option.tooltip} />}
          </span>
        </span>
        <small>{description}</small>
      </span>
      <span className="option-switch" aria-hidden="true">
        <span />
      </span>
    </label>
  );
}
