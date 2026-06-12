import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { buildAnonymizeOptions } from "../anonymizer/anonymizeOptions";
import { findOpenDotaHeroes, findOpenDotaProProfiles } from "../anonymizer/openDota";
import { buildPlayerState } from "../anonymizer/playerRules";
import type {
  AnonymizeOptions,
  HeroLookup,
  PlayerProfileLookup,
  PlayerState,
  PlayerStateMap,
  ReplayInspection,
  ReviewTab,
  UiOptionKey,
  UiOptions,
} from "../types";
import { createDefaultUiOptions, loadUiOptions, saveUiOptions } from "../anonymizer/uiOptions";
import { anonymizedReplayName, downloadBlob, optionsJsonName } from "../utils";
import { useReplayWorker } from "./useReplayWorker";

export function useReplayAnonymizer() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { workerReady, workerError, workerCall } = useReplayWorker();

  const [status, setStatus] = useState("Loading WASM...");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [outputFileName, setOutputFileName] = useState("");
  const [inspection, setInspection] = useState<ReplayInspection | null>(null);
  const [replayResident, setReplayResident] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerStateMap>({});
  const [playerProfiles, setPlayerProfiles] = useState<Record<string, PlayerProfileLookup>>({});
  const [heroesById, setHeroesById] = useState<Record<number, HeroLookup>>({});
  const [options, setOptions] = useState<UiOptions>(loadUiOptions);
  const [activeTab, setActiveTab] = useState<ReviewTab>("options");

  useEffect(() => {
    if (workerError) {
      setStatus(workerError);
      return;
    }

    if (workerReady && !file && !busy) {
      setStatus("Ready. Choose a replay to inspect.");
    }
  }, [busy, file, workerError, workerReady]);

  useEffect(() => {
    saveUiOptions(options);
  }, [options]);

  useEffect(() => {
    if (!inspection) {
      return;
    }

    setPlayerState((current) =>
      buildPlayerState({
        inspection,
        options,
        profiles: playerProfiles,
        previous: current,
      }),
    );
  }, [
    inspection,
    options.excludeSteamIds,
    options.includeSteamIds,
    options.playerSelectionMode,
    options.proAnonymizeMode,
    options.spectatorAnonymizeMode,
    playerProfiles,
  ]);

  useEffect(() => {
    if (!inspection) {
      return;
    }

    let cancelled = false;

    void Promise.all([
      findOpenDotaProProfiles(inspection.players),
      findOpenDotaHeroes(inspection.players),
    ]).then(([profiles, heroes]) => {
      if (cancelled) {
        return;
      }

      setPlayerProfiles(profiles);
      setHeroesById(heroes);
    });

    return () => {
      cancelled = true;
    };
  }, [inspection]);

  const resetInspection = useCallback(() => {
    setInspection(null);
    setReplayResident(false);
    setPlayerState({});
    setPlayerProfiles({});
    setHeroesById({});
    setActiveTab("options");
  }, []);

  const canAnonymize = workerReady && !busy && Boolean(file && inspection);

  const inspectFile = useCallback(
    async (nextFile: File | null) => {
      setFile(nextFile);
      setOutputFileName(nextFile ? anonymizedReplayName(nextFile.name) : "");
      resetInspection();
      setBusy(true);

      if (!nextFile) {
        setStatus(workerReady ? "Ready. Choose a replay to inspect." : "Loading WASM...");
        setBusy(false);
        return;
      }

      try {
        setStatus("Inspecting replay...");
        const buffer = await nextFile.arrayBuffer();
        const response = await workerCall("inspect", { buffer }, [buffer]);

        const nextInspection = response.inspection;
        setInspection(nextInspection);
        setReplayResident(true);
        setPlayerState(
          buildPlayerState({
            inspection: nextInspection,
            options,
          }),
        );
        setActiveTab("review");
        setStatus("Replay inspected. Review the anonymization settings.");

      } catch (error) {
        resetInspection();
        setStatus(error instanceof Error ? error.message : String(error));
      } finally {
        setBusy(false);
      }
    },
    [options, resetInspection, workerCall, workerReady],
  );

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextFile = event.target.files?.[0] ?? null;
      event.target.value = "";
      void inspectFile(nextFile);
    },
    [inspectFile],
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(true);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      setDragging(false);
      const nextFile = event.dataTransfer.files?.[0] ?? null;

      if (nextFile && fileInputRef.current) {
        const transfer = new DataTransfer();
        transfer.items.add(nextFile);
        fileInputRef.current.files = transfer.files;
      }

      void inspectFile(nextFile);
    },
    [inspectFile],
  );

  const updatePlayer = useCallback((key: string, patch: Partial<PlayerState>) => {
    setPlayerState((current) => {
      const previous = current[key] ?? {
        anonymize: false,
      };

      return {
        ...current,
        [key]: {
          ...previous,
          ...patch,
        },
      };
    });
  }, []);

  const updateOption = useCallback((key: UiOptionKey, value: boolean) => {
    setOptions((current) => ({
      ...current,
      [key]: value,
    }));
  }, []);

  const updateOptions = useCallback((patch: Partial<UiOptions>) => {
    setOptions((current) => ({
      ...current,
      ...patch,
    }));
  }, []);

  const restoreDefaultOptions = useCallback(() => {
    setOptions(createDefaultUiOptions());
    setStatus("Options restored to defaults.");
  }, []);

  const readOptions = useCallback((): AnonymizeOptions | null => {
    if (!inspection) {
      return null;
    }

    return buildAnonymizeOptions({
      inspection,
      playerState,
      options,
    });
  }, [inspection, options, playerState]);

  const anonymizeReplay = useCallback(async () => {
    const anonymizeOptions = readOptions();
    if (!file || !inspection || !anonymizeOptions) {
      setStatus("Choose and inspect a replay first.");
      return;
    }

    setBusy(true);
    setStatus("Anonymizing replay...");

    try {
      const payload: { options: AnonymizeOptions; buffer?: ArrayBuffer } = {
        options: anonymizeOptions,
      };
      const transfer: Transferable[] = [];

      if (!replayResident) {
        setStatus("Reloading replay...");
        const buffer = await file.arrayBuffer();
        payload.buffer = buffer;
        transfer.push(buffer);
        setStatus("Anonymizing replay...");
      }

      const { blob } = await workerCall("anonymize", payload, transfer);

      downloadBlob(blob, outputFileName.trim() || anonymizedReplayName(file.name));
      setReplayResident(false);
      setStatus("Done. The anonymized replay was downloaded.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }, [file, inspection, outputFileName, readOptions, replayResident, workerCall]);

  const exportOptionsJson = useCallback(() => {
    const exportInspection =
      inspection ??
      ({
        players: [],
        input_bytes: 0,
        playback_ticks: 0,
      } satisfies ReplayInspection);
    const jsonOptions = buildAnonymizeOptions({
      inspection: exportInspection,
      playerState,
      options,
    });
    const blob = new Blob([JSON.stringify(jsonOptions, null, 2) + "\n"], {
      type: "application/json",
    });

    downloadBlob(blob, optionsJsonName(file?.name));
    setStatus("Options JSON exported.");
  }, [file, inspection, options, playerState]);

  return {
    activeTab,
    busy,
    canAnonymize,
    dragging,
    file,
    fileInputRef,
    heroesById,
    inspection,
    options,
    outputFileName,
    playerProfiles,
    playerState,
    status,
    workerReady,
    anonymizeReplay,
    handleDragLeave: () => setDragging(false),
    handleDragOver,
    handleDrop,
    handleFileChange,
    setActiveTab,
    setOutputFileName,
    exportOptionsJson,
    restoreDefaultOptions,
    updateOption,
    updateOptions,
    updatePlayer,
  };
}
