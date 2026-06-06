"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { usePinnedScrollProgress } from "@/components/landing/usePinnedScroll";

const FRAME_COUNT = 240;

const framePath = (i: number) =>
  `/hero-frames/frame-${String(i).padStart(4, "0")}.webp`;

type HeroScrollSequenceProps = {
  sectionRef: RefObject<HTMLElement | null>;
  className?: string;
};

export function HeroScrollSequence({
  sectionRef,
  className,
}: HeroScrollSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(-1);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = imagesRef.current[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    // "cover" fit: fill the canvas, cropping overflow.
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = w / h;
    let dw: number;
    let dh: number;
    let dx: number;
    let dy: number;
    if (canvasRatio > imgRatio) {
      dw = w;
      dh = w / imgRatio;
      dx = 0;
      dy = (h - dh) / 2;
    } else {
      dh = h;
      dw = h * imgRatio;
      dx = (w - dw) / 2;
      dy = 0;
    }

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  // Preload the full frame sequence.
  useEffect(() => {
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = framePath(i + 1);
      if (i === 0) {
        img.onload = () => {
          if (currentFrameRef.current < 0) {
            currentFrameRef.current = 0;
            drawFrame(0);
          }
        };
      }
      images[i] = img;
    }

    imagesRef.current = images;

    if (images[0].complete && images[0].naturalWidth > 0) {
      currentFrameRef.current = 0;
      drawFrame(0);
    }
  }, [drawFrame]);

  usePinnedScrollProgress(sectionRef, (progress) => {
    const frame = Math.min(
      FRAME_COUNT - 1,
      Math.max(0, Math.round(progress * (FRAME_COUNT - 1))),
    );
    if (frame !== currentFrameRef.current) {
      currentFrameRef.current = frame;
      drawFrame(frame);
    }
  });

  // Redraw the active frame when the container resizes.
  useEffect(() => {
    const onResize = () => {
      drawFrame(currentFrameRef.current < 0 ? 0 : currentFrameRef.current);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [drawFrame]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role="img"
      aria-label="Molecular verification animation controlled by scroll"
    />
  );
}
