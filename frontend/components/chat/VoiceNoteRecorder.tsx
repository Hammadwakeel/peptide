"use client";

import { Mic, Send, Trash2 } from "lucide-react";
import { Tooltip } from "@/components/ui/Tippy";
import { useState } from "react";
import { formatDuration } from "@/lib/chat/types";
import { VoiceWaveform } from "@/components/chat/VoiceWaveform";
import type { VoiceRecordingState } from "@/lib/chat/useVoiceRecording";

type VoiceNoteRecorderProps = {
  recording: VoiceRecordingState;
  onCancel: () => void;
  onSend: (file: File, durationMs: number) => Promise<void> | void;
  disabled?: boolean;
};

export function VoiceNoteRecorder({ recording, onCancel, onSend, disabled = false }: VoiceNoteRecorderProps) {
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  function handleCancel() {
    recording.cancel();
    onCancel();
  }

  async function handleSend() {
    if (isSending || disabled || !recording.isReady) return;

    setIsSending(true);
    setSendError(null);
    try {
      const { file, durationMs } = await recording.stopAndGetFile();
      await onSend(file, durationMs);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Could not send voice note.");
      setIsSending(false);
    }
  }

  if (recording.error) {
    return (
      <div className="flex items-center justify-between gap-3 border-t border-deep-teal/10 bg-pure-white px-4 py-3">
        <p className="text-sm text-coral-blush">{recording.error}</p>
        <button type="button" onClick={handleCancel} className="text-sm text-deep-teal/60 hover:text-deep-teal">
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-deep-teal/10 bg-pure-white px-3 py-3">
      {sendError ? (
        <p className="mb-2 px-1 text-xs text-coral-blush">{sendError}</p>
      ) : null}
      <div className="flex items-center gap-3 rounded-full bg-deep-teal/[0.04] px-3 py-2">
        <Tooltip content="Cancel recording">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSending}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-coral-blush hover:bg-coral-blush/10 disabled:opacity-40"
            aria-label="Cancel recording"
          >
            <Trash2 className="size-5" />
          </button>
        </Tooltip>

        <span className="relative flex size-3 shrink-0">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-coral-blush/60" />
          <span className="relative inline-flex size-3 rounded-full bg-coral-blush" />
        </span>

        <VoiceWaveform
          analyser={recording.analyser}
          active={recording.isReady}
          barClassName="bg-pacific-teal"
        />

        <span className="min-w-[3rem] text-xs font-light tabular-nums text-deep-teal/70">
          {recording.isReady ? formatDuration(recording.elapsedMs) : "0:00"}
        </span>

        <Tooltip content="Send voice note">
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={isSending || disabled || !recording.isReady}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-deep-teal text-pure-white hover:bg-pacific-teal disabled:opacity-40"
            aria-label="Send voice note"
          >
            {isSending ? <Mic className="size-4 animate-pulse" /> : <Send className="size-4" />}
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
