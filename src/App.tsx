import { AppHeader } from "./components/layout/AppHeader";
import { ControlPanel } from "./components/layout/ControlPanel";
import { ReviewPanel } from "./components/layout/ReviewPanel";
import { useReplayAnonymizer } from "./hooks/useReplayAnonymizer";

export default function App() {
  const replay = useReplayAnonymizer();

  return (
    <main className="app-shell">
      <AppHeader />

      <div className="workspace">
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
    </main>
  );
}
