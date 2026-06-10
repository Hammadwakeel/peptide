"use client";

import { useEffect, useRef, useState } from "react";

type VoiceWaveformProps = {
  analyser?: AnalyserNode | null;
  active?: boolean;
  barCount?: number;
  seed?: string;
  className?: string;
  barClassName?: string;
};

function seededHeights(seed: string, count: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Array.from({ length: count }, (_, index) => {
    const value = Math.abs(Math.sin(hash + index * 1.7)) * 0.65 + 0.25;
    return value;
  });
}

export function VoiceWaveform({
  analyser,
  active = false,
  barCount = 28,
  seed = "wave",
  className = "",
  barClassName = "bg-pacific-teal",
}: VoiceWaveformProps) {
  const [levels, setLevels] = useState<number[]>(() => seededHeights(seed, barCount));
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!analyser || !active) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      setLevels(seededHeights(seed, barCount));
      return;
    }

    const buffer = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(buffer);
      const slice = buffer.slice(0, barCount);
      const max = Math.max(...slice, 1);
      setLevels(
        Array.from({ length: barCount }, (_, index) => {
          const sample = slice[index] ?? 0;
          return Math.max(0.12, sample / max);
        }),
      );
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [analyser, active, barCount, seed]);

  return (
    <div className={`flex h-8 flex-1 items-center gap-[2px] ${className}`}>
      {levels.map((level, index) => (
        <span
          key={index}
          className={`w-[3px] rounded-full transition-[height] duration-75 ${barClassName}`}
          style={{ height: `${Math.round(level * 100)}%` }}
        />
      ))}
    </div>
  );
}
