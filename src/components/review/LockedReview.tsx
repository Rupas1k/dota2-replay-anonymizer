export function LockedReview({ workerReady, busy }: { workerReady: boolean; busy: boolean }) {
  return (
    <div className="empty-state">
      <div className="empty-mark">DEM</div>
      <h2>{busy ? "Inspecting replay..." : "Replay required"}</h2>
      <p>
        {workerReady
          ? "Choose a replay to unlock review."
          : "The WebAssembly worker is loading. The review area will unlock once it is ready."}
      </p>
    </div>
  );
}
