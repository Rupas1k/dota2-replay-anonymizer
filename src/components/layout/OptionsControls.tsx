import type { ReplayInspection, ReviewTab } from "../../types";
import { Button } from "../ui/Button";
import { PanelSection, SectionHeading } from "../ui/Panel";

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
    <PanelSection>
      <SectionHeading title="Options" />
      <Button
        className="w-full"
        disabled={!inspection}
        onClick={() => {
          if (inspection) {
            onActiveTabChange(activeTab === "options" ? "review" : "options");
          }
        }}
      >
        {optionsButtonText}
      </Button>
      <div className="flex flex-col">
        <div className="flex gap-2">
          <Button
            className="min-w-0 flex-1 text-[0.82rem]"
            size="small"
            onClick={onRestoreDefaultOptions}
          >
            Restore
          </Button>
          <Button
            className="min-w-0 flex-1 text-[0.82rem]"
            size="small"
            onClick={onExportOptionsJson}
          >
            Export JSON
          </Button>
        </div>
      </div>
    </PanelSection>
  );
}
