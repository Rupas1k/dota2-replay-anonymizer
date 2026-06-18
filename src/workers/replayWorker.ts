import init, {
  anonymize_loaded_replay,
  clear_replay,
  inspect_loaded_replay,
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

const readInspection = (buffer: ArrayBuffer, mode: "quick" | "full"): ReplayInspection => {
  load_replay_bytes(new Uint8Array(buffer));

  const inspection =
    mode === "full"
      ? (inspect_loaded_replay() as ReplayInspection)
      : (quick_scan_loaded_replay() as ReplayInspection);

  if (!inspection || !Array.isArray(inspection.players)) {
    throw new Error("Replay inspection did not return players.");
  }

  return inspection;
};

const handleMessage = ({ id, type, payload }: WorkerRequest) => {
  try {
    switch (type) {
      case "inspect": {
        replayLoaded = false;
        clear_replay();
        try {
          const inspection = readInspection(payload.buffer, payload.mode ?? "quick");
          replayLoaded = true;
          postSuccess(id, type, { inspection });
        } finally {
          detachBuffer(payload.buffer);
        }
        return;
      }

      case "anonymize": {
        if (!replayLoaded && payload.buffer) {
          try {
            load_replay_bytes(new Uint8Array(payload.buffer));
            replayLoaded = true;
          } finally {
            detachBuffer(payload.buffer);
          }
        }

        if (!replayLoaded) {
          throw new Error("No replay loaded.");
        }

        let releasedOutput = false;

        try {
          const output = anonymize_loaded_replay(JSON.stringify(payload.options));
          const blob = new Blob([output], {
            type: "application/octet-stream",
          });
          release_anonymized_replay();
          releasedOutput = true;
          clear_replay();
          replayLoaded = false;
          postSuccess(id, type, { blob });
        } finally {
          if (!releasedOutput) {
            release_anonymized_replay();
          }
        }
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
