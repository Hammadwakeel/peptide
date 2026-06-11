"use client";

import { Pause, Play } from "lucide-react";
import { Tooltip } from "@/components/ui/Tippy";
import { useEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/chat/types";
import { VoiceWaveform } from "@/components/chat/VoiceWaveform";

type VoiceMessageBubbleProps = {
  mediaUrl: string;
  durationMs?: number | null;
  messageId: string;
  isOwn: boolean;
};

export function VoiceMessageBubble({ mediaUrl, durationMs, messageId, isOwn }: VoiceMessageBubbleProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentMs, setCurrentMs] = useState(0);

  useEffect(() => {
    const audio = new Audio(mediaUrl);
    audioRef.current = audio;

    const onTimeUpdate = () => {
      if (!audio.duration) return;
      setProgress(audio.currentTime / audio.duration);
      setCurrentMs(audio.currentTime * 1000);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentMs(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [mediaUrl]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    void audio.play().catch(() => {
      setIsPlaying(false);
    });
    setIsPlaying(true);
  }

  const displayMs = isPlaying ? currentMs : (durationMs ?? 0);

  return (
    <div className="flex min-w-[220px] items-center gap-3">
      <Tooltip content={isPlaying ? "Pause voice message" : "Play voice message"}>
        <button
          type="button"
          onClick={togglePlay}
          className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
            isOwn ? "bg-pure-white/15 text-pure-white" : "bg-deep-teal/10 text-deep-teal"
          }`}
          aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
        >
          {isPlaying ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}
        </button>
      </Tooltip>

      <div className="min-w-0 flex-1">
        <VoiceWaveform
          seed={messageId}
          barCount={24}
          className="h-6"
          barClassName={isOwn ? "bg-pure-white/80" : "bg-pacific-teal/70"}
        />
        <div
          className={`mt-1 h-0.5 overflow-hidden rounded-full ${isOwn ? "bg-pure-white/20" : "bg-deep-teal/10"}`}
        >
          <div
            className={`h-full rounded-full transition-all ${isOwn ? "bg-pure-white" : "bg-pacific-teal"}`}
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>

      <span className={`text-[11px] tabular-nums ${isOwn ? "text-pure-white/75" : "text-deep-teal/50"}`}>
        {formatDuration(displayMs)}
      </span>
    </div>
  );
}
