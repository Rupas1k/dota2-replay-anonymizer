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
import {
  createDefaultUiOptions,
  loadUiOptions,
  saveUiOptions,
  uiOptionsFromJson,
} from "../anonymizer/uiOptions";
import { anonymizedReplayName, downloadBlob, optionsJsonName, playerKey, steamIdText } from "../utils";
import { useReplayWorker } from "./useReplayWorker";

export function useReplayAnonymizer() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const optionsInputRef = useRef<HTMLInputElement | null>(null);
  const importedPlayersRef = useRef<Map<string, boolean> | null>(null);
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

    setPlayerState((current) => {
      const next = buildPlayerState({
        inspection,
        options,
        profiles: playerProfiles,
        previous: current,
      });
      const importedPlayers = importedPlayersRef.current;

      if (!importedPlayers) {
        return next;
      }

      importedPlayersRef.current = null;
      return Object.fromEntries(
        inspection.players.map((player) => {
          const key = playerKey(player);
          const anonymize =
            importedPlayers.get(key) ??
            importedPlayers.get(`steam:${steamIdText(player.steam_id)}`) ??
            next[key]?.anonymize ??
            true;

          return [key, { ...next[key], anonymize, locked: false } satisfies PlayerState];
        }),
      );
    });
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

  const inspectLoadedFile = useCallback(
    async (nextFile: File, mode: "quick" | "full") => {
      setStatus(mode === "full" ? "Running full replay scan..." : "Inspecting replay...");
      console.time(`replay inspect ${mode}: load file into browser memory`);
      const buffer = await nextFile.arrayBuffer();
      console.timeEnd(`replay inspect ${mode}: load file into browser memory`);

      console.time(`replay inspect ${mode}: worker total`);
      const response = await workerCall("inspect", { buffer, mode }, [buffer]);
      console.timeEnd(`replay inspect ${mode}: worker total`);

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
      setStatus(
        mode === "full"
          ? "Full scan finished. Review the updated player list."
          : "Replay inspected. Review the anonymization settings.",
      );
    },
    [options, workerCall],
  );

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
        await inspectLoadedFile(nextFile, "quick");
      } catch (error) {
        resetInspection();
        setStatus(error instanceof Error ? error.message : String(error));
      } finally {
        setBusy(false);
      }
    },
    [inspectLoadedFile, resetInspection, workerReady],
  );

  const runFullScan = useCallback(async () => {
    if (!file || busy) {
      return;
    }

    setBusy(true);

    try {
      await inspectLoadedFile(file, "full");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }, [busy, file, inspectLoadedFile]);

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
        locked: false,
      };

      if (previous.locked) {
        return current;
      }

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

  const importOptionsJson = useCallback(() => {
    optionsInputRef.current?.click();
  }, []);

  const handleOptionsJsonChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const nextFile = event.target.files?.[0] ?? null;
      event.target.value = "";

      if (!nextFile) {
        return;
      }

      try {
        const parsed = JSON.parse(await nextFile.text()) as Partial<AnonymizeOptions>;

        if (Array.isArray(parsed.players)) {
          importedPlayersRef.current = new Map(
            parsed.players.flatMap((player) => {
              const entries: [string, boolean][] = [];
              const anonymize = Boolean(player.anonymize);

              if (player.player_id != null) {
                entries.push([`player:${player.player_id}`, anonymize]);
              }

              entries.push([`steam:${player.steam_id}`, anonymize]);
              return entries;
            }),
          );
        }

        setOptions((current) => uiOptionsFromJson(parsed, current));
        setStatus("Options JSON imported.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : String(error));
      }
    },
    [],
  );

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
      console.time("replay anonymize: total");
      const payload: { options: AnonymizeOptions; buffer?: ArrayBuffer } = {
        options: anonymizeOptions,
      };
      const transfer: Transferable[] = [];

      if (!replayResident) {
        setStatus("Reloading replay...");
        console.time("replay anonymize: load file into browser memory");
        const buffer = await file.arrayBuffer();
        console.timeEnd("replay anonymize: load file into browser memory");
        payload.buffer = buffer;
        transfer.push(buffer);
        setStatus("Anonymizing replay...");
      }

      console.time("replay anonymize: worker");
      const { blob } = await workerCall("anonymize", payload, transfer);
      console.timeEnd("replay anonymize: worker");

      console.time("replay anonymize: download");
      downloadBlob(blob, outputFileName.trim() || anonymizedReplayName(file.name));
      console.timeEnd("replay anonymize: download");
      console.timeEnd("replay anonymize: total");
      setReplayResident(false);
      setStatus("Done. The anonymized replay was downloaded.");
    } catch (error) {
      console.timeEnd("replay anonymize: total");
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
    optionsInputRef,
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
    handleOptionsJsonChange,
    importOptionsJson,
    runFullScan,
    setActiveTab,
    setOutputFileName,
    exportOptionsJson,
    restoreDefaultOptions,
    updateOption,
    updateOptions,
    updatePlayer,
  };
}
