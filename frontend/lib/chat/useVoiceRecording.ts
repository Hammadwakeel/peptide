"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceRecordingState = {
  elapsedMs: number;
  analyser: AnalyserNode | null;
  isReady: boolean;
  error: string | null;
  stopAndGetFile: () => Promise<{ file: File; durationMs: number }>;
  cancel: () => void;
};

function pickRecorderMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  for (const type of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "audio/webm";
}

function normalizeAudioMime(mimeType: string): string {
  const base = mimeType.split(";")[0]?.trim().toLowerCase() || "audio/webm";
  if (["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/wav"].includes(base)) {
    return base;
  }
  return "audio/webm";
}

function extensionForMime(mimeType: string): string {
  switch (normalizeAudioMime(mimeType)) {
    case "audio/mp4":
      return "m4a";
    case "audio/ogg":
      return "ogg";
    case "audio/mpeg":
      return "mp3";
    case "audio/wav":
      return "wav";
    default:
      return "webm";
  }
}

function closeAudioContextSafely(context: AudioContext | null | undefined) {
  if (!context || context.state === "closed") return;
  void context.close().catch(() => {
    // Ignore double-close races in React Strict Mode.
  });
}

type RecordingSession = {
  stream: MediaStream;
  recorder: MediaRecorder;
  audioContext: AudioContext;
  analyser: AnalyserNode;
  chunks: Blob[];
  startedAt: number;
  mimeType: string;
};

export function useVoiceRecording(active: boolean): VoiceRecordingState {
  const sessionRef = useRef<RecordingSession | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disposeSession = useCallback((session: RecordingSession | null) => {
    if (!session) return;
    if (session.recorder.state !== "inactive") {
      try {
        session.recorder.stop();
      } catch {
        // ignore
      }
    }
    session.stream.getTracks().forEach((track) => track.stop());
    closeAudioContextSafely(session.audioContext);
  }, []);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    async function start() {
      if (sessionRef.current) return;

      setError(null);
      setIsReady(false);
      setElapsedMs(0);
      setAnalyser(null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const mimeType = pickRecorderMimeType();
        const audioContext = new AudioContext();
        await audioContext.resume();

        const source = audioContext.createMediaStreamSource(stream);
        const analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 64;
        source.connect(analyserNode);

        const recorder = new MediaRecorder(stream, { mimeType });
        const chunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };

        const session: RecordingSession = {
          stream,
          recorder,
          audioContext,
          analyser: analyserNode,
          chunks,
          startedAt: Date.now(),
          mimeType: recorder.mimeType || mimeType,
        };

        sessionRef.current = session;
        recorder.start(250);
        setAnalyser(analyserNode);
        setIsReady(true);

        timerRef.current = setInterval(() => {
          setElapsedMs(Date.now() - session.startedAt);
        }, 200);
      } catch {
        if (!cancelled) {
          setError("Microphone access denied or unavailable.");
        }
      }
    }

    void start();

    return () => {
      cancelled = true;
    };
  }, [active]);

  useEffect(() => {
    if (active) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    disposeSession(sessionRef.current);
    sessionRef.current = null;
    setAnalyser(null);
    setIsReady(false);
    setElapsedMs(0);
    setError(null);
  }, [active, disposeSession]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    disposeSession(sessionRef.current);
    sessionRef.current = null;
    setAnalyser(null);
    setIsReady(false);
    setElapsedMs(0);
  }, [disposeSession]);

  const stopAndGetFile = useCallback(async () => {
    const session = sessionRef.current;
    if (!session) {
      throw new Error("Recording not ready.");
    }

    const durationMs = Math.max(elapsedMs, Date.now() - session.startedAt);

    await new Promise<void>((resolve, reject) => {
      session.recorder.onstop = () => resolve();
      session.recorder.onerror = () => reject(new Error("Recording failed."));
      try {
        if (session.recorder.state === "recording") {
          session.recorder.requestData();
          session.recorder.stop();
        } else {
          resolve();
        }
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Recording failed."));
      }
    });

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const mimeType = normalizeAudioMime(session.mimeType);
    const blob = new Blob(session.chunks, { type: mimeType });
    session.stream.getTracks().forEach((track) => track.stop());
    closeAudioContextSafely(session.audioContext);
    sessionRef.current = null;
    setAnalyser(null);
    setIsReady(false);

    if (blob.size === 0) {
      throw new Error("Recording was too short.");
    }

    const extension = extensionForMime(mimeType);
    const file = new File([blob], `voice-${Date.now()}.${extension}`, { type: mimeType });
    return { file, durationMs };
  }, [elapsedMs]);

  return {
    elapsedMs,
    analyser,
    isReady,
    error,
    stopAndGetFile,
    cancel,
  };
}
