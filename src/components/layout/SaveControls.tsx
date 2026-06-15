type SaveControlsProps = {
  busy: boolean;
  canAnonymize: boolean;
  file: File | null;
  outputFileName: string;
  onDownload: () => void;
  onOutputFileNameChange: (name: string) => void;
};

export function SaveControls({
  busy,
  canAnonymize,
  file,
  outputFileName,
  onDownload,
  onOutputFileNameChange,
}: SaveControlsProps) {
  return (
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
  );
}
