import type { ReactNode } from "react";
import type { UiOptions } from "../../types";
import { InfoTooltip } from "../ui/InfoTooltip";
import { SegmentedControl } from "../ui/SegmentedControl";
import { SteamIdListInput } from "./SteamIdListInput";

type PlayerRulesPanelProps = {
  options: UiOptions;
  onOptionsChange: (patch: Partial<UiOptions>) => void;
};

const defaultOptions = [
  { value: "includeAll", label: "Anonymize all" },
  { value: "excludeAll", label: "Keep all" },
] as const;

const proOptions = [
  { value: "ignore", label: "No override" },
  { value: "includePro", label: "Anonymize pros" },
  { value: "excludePro", label: "Keep pros" },
] as const;

const spectatorOptions = [
  { value: "ignore", label: "No override" },
  { value: "includeSpectators", label: "Anonymize spectators" },
  { value: "excludeSpectators", label: "Keep spectators" },
] as const;

function RuleRow({
  alignTop,
  label,
  tooltip,
  children,
}: {
  alignTop?: boolean;
  label: string;
  tooltip?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(170px,220px)_minmax(0,1fr)] items-start gap-[18px] max-[980px]:grid-cols-1">
      <span
        className={`inline-flex items-center gap-[7px] font-medium text-muted-strong ${alignTop ? "h-7 text-sm" : "pt-[9px] text-[0.95rem]"}`}
      >
        {label}
        {tooltip ? <InfoTooltip text={tooltip} /> : null}
      </span>
      {children}
    </div>
  );
}

export function PlayerRulesPanel({ options, onOptionsChange }: PlayerRulesPanelProps) {
  const updateSteamIds = (key: "includeSteamIds" | "excludeSteamIds", values: string[]) => {
    const otherKey = key === "includeSteamIds" ? "excludeSteamIds" : "includeSteamIds";
    const selected = new Set(values);

    onOptionsChange({
      [key]: values,
      [otherKey]: options[otherKey].filter((steamId) => !selected.has(steamId)),
    });
  };

  return (
    <div className="grid gap-3">
      <RuleRow label="Default">
        <SegmentedControl
          ariaLabel="Default player selection"
          options={defaultOptions}
          value={options.playerSelectionMode}
          onChange={(playerSelectionMode) => onOptionsChange({ playerSelectionMode })}
        />
      </RuleRow>

      <RuleRow label="Pro players" tooltip="Pro players list is taken from OpenDota">
        <SegmentedControl
          ariaLabel="Pro player override"
          options={proOptions}
          value={options.proAnonymizeMode}
          onChange={(proAnonymizeMode) => onOptionsChange({ proAnonymizeMode })}
        />
      </RuleRow>

      <RuleRow label="Spectators" tooltip="Full scan may be needed to get full spectator list">
        <SegmentedControl
          ariaLabel="Spectator player override"
          options={spectatorOptions}
          value={options.spectatorAnonymizeMode}
          onChange={(spectatorAnonymizeMode) => onOptionsChange({ spectatorAnonymizeMode })}
        />
      </RuleRow>

      <RuleRow alignTop label="Steam IDs">
        <div className="grid grid-cols-2 items-start gap-3 has-[textarea]:grid-cols-1 max-[980px]:grid-cols-1">
          <SteamIdListInput
            label="Always anonymize"
            values={options.includeSteamIds}
            onChange={(values) => updateSteamIds("includeSteamIds", values)}
          />
          <SteamIdListInput
            label="Never anonymize"
            values={options.excludeSteamIds}
            onChange={(values) => updateSteamIds("excludeSteamIds", values)}
          />
        </div>
      </RuleRow>
    </div>
  );
}
