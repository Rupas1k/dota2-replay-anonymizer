import { Button } from "../ui/Button";
import { PanelSection, SectionHeading } from "../ui/Panel";

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
    <PanelSection className="text-white">
      <SectionHeading step={3} title="Save" description="Create the anonymized replay." inverted />
      <label className="grid gap-1.5 text-sm font-semibold text-muted">
        Save as
        <input
          type="text"
          className="min-h-[38px] w-full rounded-lg border border-border bg-input px-2.5 py-2 text-app-text focus:border-accent focus:outline-3 focus:outline-blue-500/20 disabled:text-[#778795]"
          value={outputFileName}
          placeholder="name_anon.dem"
          disabled={!file || busy}
          onChange={(event) => onOutputFileNameChange(event.target.value)}
        />
      </label>
      <Button className="w-full" variant="primary" disabled={!canAnonymize} onClick={onDownload}>
        Download replay
      </Button>
    </PanelSection>
  );
}
