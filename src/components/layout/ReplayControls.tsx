import type { ChangeEvent, DragEvent, RefObject } from "react";
import { formatBytes } from "../../utils";

type ReplayControlsProps = {
  busy: boolean;
  dragging: boolean;
  file: File | null;
  fileInputRef: RefObject<HTMLInputElement>;
  onDragLeave: () => void;
  onDragOver: (event: DragEvent<HTMLLabelElement>) => void;
  onDrop: (event: DragEvent<HTMLLabelElement>) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRunFullScan: () => void;
};

export function ReplayControls({
  busy,
  dragging,
  file,
  fileInputRef,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileChange,
  onRunFullScan,
}: ReplayControlsProps) {
  return (
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
      <button
        type="button"
        className="secondary-action wide"
        disabled={!file || busy}
        onClick={onRunFullScan}
      >
        Full scan
      </button>
    </section>
  );
}
