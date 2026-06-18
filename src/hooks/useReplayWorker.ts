import { useCallback, useEffect, useRef, useState } from "react";
import type {
  WorkerRequestPayloads,
  WorkerRequestType,
  WorkerResponse,
  WorkerResponsePayloads,
} from "../types";

type PendingWorkerRequest = {
  resolve: (payload: unknown) => void;
  reject: (error: Error) => void;
};

export function useReplayWorker() {
  const workerRef = useRef<Worker | null>(null);
  const nextRequestId = useRef(1);
  const requests = useRef(new Map<number, PendingWorkerRequest>());

  const [workerReady, setWorkerReady] = useState(false);
  const [workerError, setWorkerError] = useState<string | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL("../workers/replayWorker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;

    worker.addEventListener("message", ({ data }: MessageEvent<WorkerResponse>) => {
      if ("type" in data && data.type === "ready") {
        setWorkerReady(true);
        setWorkerError(null);
        return;
      }

      if (!("id" in data)) {
        return;
      }

      const request = requests.current.get(data.id);
      if (!request) {
        return;
      }

      requests.current.delete(data.id);
      if ("ok" in data && data.ok) {
        request.resolve(data.payload);
      } else if ("error" in data) {
        request.reject(new Error(data.error || "Worker failed."));
      }
    });

    worker.addEventListener("error", (event) => {
      setWorkerError(event.message || "Worker failed to load.");
    });

    return () => {
      worker.terminate();
      for (const request of requests.current.values()) {
        request.reject(new Error("Worker terminated."));
      }
      requests.current.clear();
    };
  }, []);

  const workerCall = useCallback(
    <Type extends WorkerRequestType>(
      type: Type,
      payload: WorkerRequestPayloads[Type],
      transfer: Transferable[] = [],
    ) => {
      if (!workerRef.current) {
        return Promise.reject(new Error("Worker failed to load."));
      }

      const id = nextRequestId.current++;
      return new Promise<WorkerResponsePayloads[Type]>((resolve, reject) => {
        requests.current.set(id, {
          resolve: resolve as (payload: unknown) => void,
          reject,
        });
        workerRef.current?.postMessage({ id, type, payload }, transfer);
      });
    },
    [],
  );

  return {
    workerReady,
    workerError,
    workerCall,
  };
}
