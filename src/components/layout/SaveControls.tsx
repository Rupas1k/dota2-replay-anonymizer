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
    <PanelSection>
      <SectionHeading title="Save as" />
      <input
        aria-label="Save as"
        type="text"
        className="min-h-[38px] w-full rounded-sm border border-border bg-input px-2.5 py-2 text-app-text focus:border-accent focus:outline-2 focus:outline-accent/70 disabled:text-muted"
        value={outputFileName}
        placeholder="name_anon.dem"
        disabled={!file || busy}
        onChange={(event) => onOutputFileNameChange(event.target.value)}
      />
      <Button className="w-full" variant="primary" disabled={!canAnonymize} onClick={onDownload}>
        Download replay
      </Button>
    </PanelSection>
  );
}
