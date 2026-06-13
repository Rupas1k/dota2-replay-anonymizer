import init, {
  anonymize_loaded_replay,
  clear_replay,
  load_replay,
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

const readInspection = (buffer: ArrayBuffer): ReplayInspection => {
  const inspection = load_replay(new Uint8Array(buffer)) as ReplayInspection;

  if (!inspection || !Array.isArray(inspection.players)) {
    throw new Error("Replay inspection did not return players.");
  }

  return inspection;
};

const handleMessage = ({ id, type, payload }: WorkerRequest) => {
  try {
    if (type === "inspect") {
      replayLoaded = false;
      clear_replay();
      try {
        const inspection = readInspection(payload.buffer);
        detachBuffer(payload.buffer);
        replayLoaded = true;
        postSuccess(id, type, { inspection });
      } finally {
        detachBuffer(payload.buffer);
      }
      return;
    }

    if (type === "anonymize") {
      if (!replayLoaded && payload.buffer) {
        try {
          load_replay(new Uint8Array(payload.buffer));
          replayLoaded = true;
        } finally {
          detachBuffer(payload.buffer);
        }
      }

      if (!replayLoaded) {
        throw new Error("No replay loaded.");
      }

      try {
        console.log("anonymize options", payload.options);
        const output = anonymize_loaded_replay(JSON.stringify(payload.options));
        const blob = new Blob([output], {
          type: "application/octet-stream",
        });
        release_anonymized_replay();
        clear_replay();
        replayLoaded = false;
        postSuccess(id, type, { blob });
      } finally {
        release_anonymized_replay();
      }
      return;
    }

    throw new Error(`Unknown worker message: ${type}`);
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
