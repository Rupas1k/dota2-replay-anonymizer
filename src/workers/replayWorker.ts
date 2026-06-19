import init, {
  anonymize_loaded_replay,
  clear_replay,
  full_scan_loaded_replay,
  load_replay_bytes,
  quick_scan_loaded_replay,
  release_anonymized_replay,
} from "../wasm-pkg/d2_replay_anonymizer_wasm.js";
import type {
  ReplayInspection,
  WorkerRequest,
  WorkerRequestType,
  WorkerResponsePayloads,
} from "../types";

let replayLoaded = false;

const detachBuffer = (buffer: ArrayBuffer) => {
  if (buffer.byteLength === 0) {
    return;
  }

  structuredClone({}, { transfer: [buffer] });
};

const postError = (id: number, error: unknown) => {
  self.postMessage({
    id,
    ok: false,
    error: error instanceof Error ? error.message : String(error),
  });
};

const postSuccess = <Type extends WorkerRequestType>(
  id: number,
  type: Type,
  payload: WorkerResponsePayloads[Type],
) => {
  self.postMessage({
    id,
    type,
    ok: true,
    payload,
  });
};

const loadReplay = (buffer: ArrayBuffer) => {
  load_replay_bytes(new Uint8Array(buffer));
  replayLoaded = true;
};

const readInspection = (buffer: ArrayBuffer, mode: "quick" | "full"): ReplayInspection => {
  loadReplay(buffer);

  const inspection =
    mode === "full"
      ? (full_scan_loaded_replay() as ReplayInspection)
      : (quick_scan_loaded_replay() as ReplayInspection);

  if (!inspection || !Array.isArray(inspection.players)) {
    throw new Error("Replay scan did not return players.");
  }

  return inspection;
};

const handleScan = (id: number, payload: WorkerRequest<"scan">["payload"]) => {
  replayLoaded = false;
  clear_replay();

  try {
    const inspection = readInspection(payload.buffer, payload.mode ?? "quick");
    postSuccess(id, "scan", { inspection });
  } finally {
    detachBuffer(payload.buffer);
  }
};

const ensureReplayLoaded = (payload: WorkerRequest<"anonymize">["payload"]) => {
  if (replayLoaded || !payload.buffer) {
    return;
  }

  try {
    loadReplay(payload.buffer);
  } finally {
    detachBuffer(payload.buffer);
  }
};

const anonymizeLoadedReplay = (options: WorkerRequest<"anonymize">["payload"]["options"]) => {
  const output = anonymize_loaded_replay(JSON.stringify(options));

  return new Blob([output], {
    type: "application/octet-stream",
  });
};

const handleAnonymize = (id: number, payload: WorkerRequest<"anonymize">["payload"]) => {
  ensureReplayLoaded(payload);

  if (!replayLoaded) {
    throw new Error("No replay loaded.");
  }

  let releasedOutput = false;

  try {
    const blob = anonymizeLoadedReplay(payload.options);

    release_anonymized_replay();
    releasedOutput = true;

    clear_replay();
    replayLoaded = false;

    postSuccess(id, "anonymize", { blob });
  } finally {
    if (!releasedOutput) {
      release_anonymized_replay();
    }
  }
};

const handleMessage = ({ id, type, payload }: WorkerRequest) => {
  try {
    switch (type) {
      case "scan": {
        handleScan(id, payload);
        return;
      }

      case "anonymize": {
        handleAnonymize(id, payload);
        return;
      }

      default:
        throw new Error("Unknown worker message.");
    }
  } catch (error) {
    postError(id, error);
  }
};

const start = async () => {
  await init();
  self.postMessage({ type: "ready" });

  self.addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
    handleMessage(event.data);
  });
};

void start();
