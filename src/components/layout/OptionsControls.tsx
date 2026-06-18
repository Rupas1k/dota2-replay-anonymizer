import type { ReplayInspection, ReviewTab } from "../../types";

type OptionsControlsProps = {
  activeTab: ReviewTab;
  inspection: ReplayInspection | null;
  onActiveTabChange: (tab: ReviewTab) => void;
  onExportOptionsJson: () => void;
  onRestoreDefaultOptions: () => void;
};

export function OptionsControls({
  activeTab,
  inspection,
  onActiveTabChange,
  onExportOptionsJson,
  onRestoreDefaultOptions,
}: OptionsControlsProps) {
  const optionsButtonText = !inspection
    ? "Load replay to review players"
    : activeTab === "options"
      ? "Review players"
      : "Edit options";

  return (
    <section className="panel-section options-panel">
      <div className="section-heading">
        <span className="step-badge">2</span>
        <div>
          <h2>Options</h2>
          <p>Manage anonymizer settings.</p>
        </div>
      </div>
      <button
        type="button"
        className="secondary-action wide"
        disabled={!inspection}
        onClick={() => {
          if (inspection) {
            onActiveTabChange(activeTab === "options" ? "review" : "options");
          }
        }}
      >
        {optionsButtonText}
      </button>
      <div className="utility-actions">
        <div>
          <button type="button" onClick={onRestoreDefaultOptions}>
            Restore
          </button>
          <button type="button" onClick={onExportOptionsJson}>
            Export JSON
          </button>
        </div>
      </div>
    </section>
  );
}
