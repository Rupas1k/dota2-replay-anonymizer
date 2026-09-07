import { ControlPanel } from "./components/layout/ControlPanel";
import { GithubLink } from "./components/layout/GithubLink";
import { ReviewPanel } from "./components/layout/ReviewPanel";
import { useReplayAnonymizer } from "./hooks/useReplayAnonymizer";

export default function App() {
  const replay = useReplayAnonymizer();

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1300px] px-[22px] pt-[18px] pb-14 max-[980px]:px-[18px] max-[980px]:pt-[18px] max-[720px]:px-3.5 max-[720px]:pt-3.5">
      <div className="grid grid-cols-[minmax(270px,318px)_minmax(0,1fr)] items-start gap-5 max-[980px]:grid-cols-1">
        <ControlPanel
          activeTab={replay.activeTab}
          busy={replay.busy}
          canAnonymize={replay.canAnonymize}
          dragging={replay.dragging}
          file={replay.file}
          fileInputRef={replay.fileInputRef}
          inspection={replay.inspection}
          outputFileName={replay.outputFileName}
          status={replay.status}
          onActiveTabChange={replay.setActiveTab}
          onDownload={() => void replay.anonymizeReplay()}
          onDragLeave={replay.handleDragLeave}
          onDragOver={replay.handleDragOver}
          onDrop={replay.handleDrop}
          onExportOptionsJson={replay.exportOptionsJson}
          onFileChange={replay.handleFileChange}
          onOutputFileNameChange={replay.setOutputFileName}
          onRestoreDefaultOptions={replay.restoreDefaultOptions}
          onRunFullScan={() => void replay.runFullScan()}
        />

        <ReviewPanel
          activeTab={replay.activeTab}
          heroesById={replay.heroesById}
          inspection={replay.inspection}
          options={replay.options}
          playerProfiles={replay.playerProfiles}
          playerState={replay.playerState}
          onOptionChange={replay.updateOption}
          onOptionsChange={replay.updateOptions}
          onUpdatePlayer={replay.updatePlayer}
        />
      </div>

      <GithubLink />
    </main>
  );
}
