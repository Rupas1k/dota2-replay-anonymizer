import type { ChangeEvent, DragEvent, RefObject } from "react";
import type { ReplayInspection, ReviewTab } from "../../types";
import { formatBytes } from "../../utils";

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
}: ControlPanelProps) {
  const visibleStatus = status.startsWith("Ready.") ? "" : status;

  return (
    <aside className="control-panel">
      <section className="panel-section">
        <div className="section-heading">
          <span className="step-badge">1</span>
          <div>
            <h2>Replay</h2>
            <p>Load a `.dem` file.</p>
          </div>
        </div>

        <label
          className={`upload-zone${dragging ? " is-dragging" : ""}`}
          htmlFor="file"
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <span className="upload-title">{file ? file.name : "Drop replay here or browse"}</span>
          <span className="upload-meta">
            {file ? formatBytes(file.size) : "Accepts Dota 2 `.dem` replay files"}
          </span>
          <input
            ref={fileInputRef}
            id="file"
            type="file"
            accept=".dem,application/octet-stream"
            disabled={busy}
            onChange={onFileChange}
          />
        </label>
      </section>

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
          {!inspection
            ? "Load replay to review players"
            : activeTab === "options"
              ? "Review players"
              : "Edit options"}
        </button>
        <div className="utility-actions">
          <div>
            <button type="button" onClick={onRestoreDefaultOptions}>
              Restore defaults
            </button>
            <button type="button" onClick={onExportOptionsJson}>
              Export JSON
            </button>
          </div>
        </div>
      </section>

      <section className="panel-section export-panel">
        <div className="section-heading">
          <span className="step-badge">3</span>
          <div>
            <h2>Save</h2>
            <p>Create the anonymized replay.</p>
          </div>
        </div>
        <label className="field-label">
          Save as
          <input
            type="text"
            value={outputFileName}
            placeholder="name.anon.dem"
            disabled={!file || busy}
            onChange={(event) => onOutputFileNameChange(event.target.value)}
          />
        </label>
        <button
          type="button"
          className="primary-action wide"
          disabled={!canAnonymize}
          onClick={onDownload}
        >
          Download anonymized replay
        </button>
      </section>

      {visibleStatus ? (
        <p className={`status${busy ? " is-busy" : ""}`} role="status">
          {visibleStatus}
        </p>
      ) : null}
    </aside>
  );
}
