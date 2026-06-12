import init, {
  anonymize_loaded_replay,
  clear_replay,
  load_replay,
  release_anonymized_replay,
} from "../wasm-pkg/d2_replay_anonymizer_wasm.js";
import type { AnonymizeOptions, ReplayInspection } from "../types";

type InspectMessage = {
  id: number;
  type: "inspect";
  payload: {
    buffer: ArrayBuffer;
  };
};

type AnonymizeMessage = {
  id: number;
  type: "anonymize";
  payload: {
    options: AnonymizeOptions;
    buffer?: ArrayBuffer;
  };
};

type WorkerRequest = InspectMessage | AnonymizeMessage;

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

const handleMessage = ({ id, type, payload }: WorkerRequest) => {
  try {
    if (type === "inspect") {
      replayLoaded = false;
      clear_replay();
      try {
        const inspection = JSON.parse(
          load_replay(new Uint8Array(payload.buffer)),
        ) as ReplayInspection;
        detachBuffer(payload.buffer);
        replayLoaded = true;
        self.postMessage({ id, ok: true, payload: { inspection } });
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
        const output = anonymize_loaded_replay(JSON.stringify(payload.options));
        const blob = new Blob([output as unknown as BlobPart], {
          type: "application/octet-stream",
        });
        release_anonymized_replay();
        clear_replay();
        replayLoaded = false;
        self.postMessage({ id, ok: true, payload: { blob } });
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
