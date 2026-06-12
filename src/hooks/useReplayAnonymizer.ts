import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import {
  buildAnonymizeOptions,
  createDefaultUiOptions,
  loadUiOptions,
  saveUiOptions,
} from "../options";
import { findOpenDotaHeroes, findOpenDotaProProfiles } from "../openDota";
import { buildPlayerState } from "../replayState";
import type {
  AnonymizeOptions,
  HeroLookup,
  PlayerProfileLookup,
  PlayerState,
  PlayerStateMap,
  ReplayPlayer,
  ReplayInspection,
  ReviewTab,
  UiOptionKey,
  UiOptions,
} from "../types";
import { isLockedPlayer, playerKey } from "../utils";
import { useReplayWorker } from "./useReplayWorker";

const normalizeSteamId = (steamId: string) => steamId.trim().toLowerCase();

function listHasPlayerSteamId(list: string[], player: ReplayPlayer) {
  const normalizedList = new Set(list.map(normalizeSteamId));
  return normalizedList.has(normalizeSteamId(player.steam_id));
}

function shouldAnonymizePlayer({
  options,
  player,
  profile,
}: {
  options: UiOptions;
  player: ReplayPlayer;
  profile?: PlayerProfileLookup;
}) {
  if (isLockedPlayer(player)) {
    return false;
  }

  if (listHasPlayerSteamId(options.excludeSteamIds, player)) {
    return false;
  }

  if (listHasPlayerSteamId(options.includeSteamIds, player)) {
    return true;
  }

  if (player.team_num === 1) {
    if (options.spectatorAnonymizeMode === "includeSpectators") {
      return true;
    }

    if (options.spectatorAnonymizeMode === "excludeSpectators") {
      return false;
    }
  }

  if (profile?.isPro) {
    if (options.proAnonymizeMode === "includePro") {
      return true;
    }

    if (options.proAnonymizeMode === "excludePro") {
      return false;
    }
  }

  return options.playerSelectionMode === "includeAll";
}

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
      Object.fromEntries(
        inspection.players.map((player) => {
          const key = playerKey(player);
          const previous = current[key];

          return [
            key,
            {
              ...previous,
              anonymize: shouldAnonymizePlayer({
                options,
                player,
                profile: playerProfiles[player.steam_id],
              }),
            },
          ];
        }),
      ),
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

    void findOpenDotaProProfiles(inspection.players).then((profiles) => {
      if (cancelled) {
        return;
      }

      setPlayerProfiles(profiles);
    });

    return () => {
      cancelled = true;
    };
  }, [inspection]);

  useEffect(() => {
    if (!inspection) {
      return;
    }

    let cancelled = false;

    void findOpenDotaHeroes(inspection.players).then((heroes) => {
      if (cancelled) {
        return;
      }

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
      setOutputFileName(nextFile ? nextFile.name.replace(/\.dem$/i, "") + ".anon.dem" : "");
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
        const response = await workerCall<{ inspection: ReplayInspection }>(
          "inspect",
          { buffer },
          [buffer],
        );

        const nextInspection = response.inspection;
        console.log("Replay players", nextInspection.players);
        setInspection(nextInspection);
        setReplayResident(true);
        setPlayerState(buildPlayerState(nextInspection));
        setActiveTab("review");
        setStatus("Replay inspected. Review the anonymization settings.");

      } catch (error) {
        resetInspection();
        setStatus(error instanceof Error ? error.message : String(error));
      } finally {
        setBusy(false);
      }
    },
    [resetInspection, workerCall, workerReady],
  );

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      void inspectFile(event.target.files?.[0] ?? null);
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

      const { blob } = await workerCall<{ blob: Blob }>("anonymize", payload, transfer);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = outputFileName.trim() || file.name.replace(/\.dem$/i, "") + ".anon.dem";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
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
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const baseName = file?.name.replace(/\.dem$/i, "") || "d2-anonymizer-options";

    link.href = url;
    link.download = `${baseName}.options.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
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
