import type {
  PlayerSelectionMode,
  ProAnonymizeMode,
  SpectatorAnonymizeMode,
  UiOptions,
} from "../../types";
import { InfoTooltip } from "../InfoTooltip";
import { SteamIdListInput } from "./SteamIdListInput";

type PlayerRulesPanelProps = {
  options: UiOptions;
  onOptionsChange: (patch: Partial<UiOptions>) => void;
};

export function PlayerRulesPanel({ options, onOptionsChange }: PlayerRulesPanelProps) {
  const setSelectionMode = (mode: PlayerSelectionMode) => {
    onOptionsChange({ playerSelectionMode: mode });
  };

  const setProMode = (mode: ProAnonymizeMode) => {
    onOptionsChange({ proAnonymizeMode: mode });
  };

  const setSpectatorMode = (mode: SpectatorAnonymizeMode) => {
    onOptionsChange({ spectatorAnonymizeMode: mode });
  };

  const setIncludeSteamIds = (includeSteamIds: string[]) => {
    const includeSet = new Set(includeSteamIds);

    onOptionsChange({
      includeSteamIds,
      excludeSteamIds: options.excludeSteamIds.filter((steamId) => !includeSet.has(steamId)),
    });
  };

  const setExcludeSteamIds = (excludeSteamIds: string[]) => {
    const excludeSet = new Set(excludeSteamIds);

    onOptionsChange({
      excludeSteamIds,
      includeSteamIds: options.includeSteamIds.filter((steamId) => !excludeSet.has(steamId)),
    });
  };

  return (
    <div className="player-rule-panel">
      <div className="player-rule-row">
        <span className="rule-label">Default</span>
        <div className="segmented-control" role="group" aria-label="Default player selection">
          <button
            type="button"
            className={options.playerSelectionMode === "includeAll" ? "is-active" : ""}
            onClick={() => setSelectionMode("includeAll")}
          >
            Anonymize all
          </button>
          <button
            type="button"
            className={options.playerSelectionMode === "excludeAll" ? "is-active" : ""}
            onClick={() => setSelectionMode("excludeAll")}
          >
            Keep all
          </button>
        </div>
      </div>

      <div className="player-rule-row">
        <span className="rule-label">
          Pro players
          <InfoTooltip text="Pro players list is taken from OpenDota" />
        </span>
        <div className="segmented-control is-three" role="group" aria-label="Pro player override">
          <button
            type="button"
            className={options.proAnonymizeMode === "ignore" ? "is-active" : ""}
            onClick={() => setProMode("ignore")}
          >
            No override
          </button>
          <button
            type="button"
            className={options.proAnonymizeMode === "includePro" ? "is-active" : ""}
            onClick={() => setProMode("includePro")}
          >
            Anonymize pros
          </button>
          <button
            type="button"
            className={options.proAnonymizeMode === "excludePro" ? "is-active" : ""}
            onClick={() => setProMode("excludePro")}
          >
            Keep pros
          </button>
        </div>
      </div>

      <div className="player-rule-row">
        <span className="rule-label">
          Spectators
          <InfoTooltip text="Full scan may be needed to get full spectator list" />
        </span>
        <div className="segmented-control is-three" role="group" aria-label="Spectator player override">
          <button
            type="button"
            className={options.spectatorAnonymizeMode === "ignore" ? "is-active" : ""}
            onClick={() => setSpectatorMode("ignore")}
          >
            No override
          </button>
          <button
            type="button"
            className={options.spectatorAnonymizeMode === "includeSpectators" ? "is-active" : ""}
            onClick={() => setSpectatorMode("includeSpectators")}
          >
            Anonymize spectators
          </button>
          <button
            type="button"
            className={options.spectatorAnonymizeMode === "excludeSpectators" ? "is-active" : ""}
            onClick={() => setSpectatorMode("excludeSpectators")}
          >
            Keep spectators
          </button>
        </div>
      </div>

      <div className="player-rule-row">
        <span className="rule-label">Steam IDs</span>
        <div className="steam-id-rule-grid">
          <SteamIdListInput
            label="Always anonymize players"
            values={options.includeSteamIds}
            onChange={setIncludeSteamIds}
          />
          <SteamIdListInput
            label="Never anonymize players"
            values={options.excludeSteamIds}
            onChange={setExcludeSteamIds}
          />
        </div>
      </div>
    </div>
  );
}
