import type { ChangeEvent, DragEvent, RefObject } from "react";
import { formatBytes } from "../../utils";
import { Button } from "../ui/Button";
import { PanelSection, SectionHeading } from "../ui/Panel";

type ReplayControlsProps = {
  busy: boolean;
  dragging: boolean;
  file: File | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
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
    <PanelSection>
      <SectionHeading step={1} title="Replay" description="Load a `.dem` file." />

      <label
        className={`grid min-h-[116px] cursor-pointer content-center gap-1 rounded-lg border border-dashed p-[18px] transition-colors ${dragging ? "border-accent bg-[#122334]" : "border-[#526575] bg-input hover:border-accent hover:bg-[#122334] focus-within:border-accent focus-within:bg-[#122334]"}`}
        htmlFor="file"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <span className="overflow-hidden text-ellipsis whitespace-nowrap font-bold text-app-text">
          {file ? file.name : "Drop replay here or browse"}
        </span>
        <span className="m-0 text-sm text-muted">
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
      <Button className="w-full" disabled={!file || busy} onClick={onRunFullScan}>
        Full scan
      </Button>
    </PanelSection>
  );
}
