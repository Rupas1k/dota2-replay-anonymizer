import type { ChangeEvent, DragEvent, RefObject } from "react";
import type { ReplayInspection, ReviewTab } from "../../types";
import { OptionsControls } from "./OptionsControls";
import { ReplayControls } from "./ReplayControls";
import { SaveControls } from "./SaveControls";

type ControlPanelProps = {
  activeTab: ReviewTab;
  busy: boolean;
  canAnonymize: boolean;
  dragging: boolean;
  file: File | null;
  fileInputRef: RefObject<HTMLInputElement>;
  inspection: ReplayInspection | null;
  outputFileName: string;
  status: string;
  onActiveTabChange: (tab: ReviewTab) => void;
  onDownload: () => void;
  onDragLeave: () => void;
  onDragOver: (event: DragEvent<HTMLLabelElement>) => void;
  onDrop: (event: DragEvent<HTMLLabelElement>) => void;
  onExportOptionsJson: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onOutputFileNameChange: (name: string) => void;
  onRestoreDefaultOptions: () => void;
  onRunFullScan: () => void;
};

export function ControlPanel({
  activeTab,
  busy,
  canAnonymize,
  dragging,
  file,
  fileInputRef,
  inspection,
  outputFileName,
  status,
  onActiveTabChange,
  onDownload,
  onDragLeave,
  onDragOver,
  onDrop,
  onExportOptionsJson,
  onFileChange,
  onOutputFileNameChange,
  onRestoreDefaultOptions,
  onRunFullScan,
}: ControlPanelProps) {
  const visibleStatus = status.startsWith("Ready.") ? "" : status;

  return (
    <aside className="control-panel">
      <ReplayControls
        busy={busy}
        dragging={dragging}
        file={file}
        fileInputRef={fileInputRef}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onFileChange={onFileChange}
        onRunFullScan={onRunFullScan}
      />

      <OptionsControls
        activeTab={activeTab}
        inspection={inspection}
        onActiveTabChange={onActiveTabChange}
        onExportOptionsJson={onExportOptionsJson}
        onRestoreDefaultOptions={onRestoreDefaultOptions}
      />

      <SaveControls
        busy={busy}
        canAnonymize={canAnonymize}
        file={file}
        outputFileName={outputFileName}
        onDownload={onDownload}
        onOutputFileNameChange={onOutputFileNameChange}
      />

      {visibleStatus ? (
        <p className={`status${busy ? " is-busy" : ""}`} role="status">
          {visibleStatus}
        </p>
      ) : null}
    </aside>
  );
}
