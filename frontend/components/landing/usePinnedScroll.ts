"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useLenis } from "@/components/SmoothScroll";

/** Extra viewport heights of scroll consumed while the section is pinned. */
const SCROLL_VH = 2;

/**
 * Higher = progress catches up to the scroll position faster.
 * Time-based so it stays consistent across refresh rates.
 */
const SMOOTH_SPEED = 7;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type Options = {
  enabled?: boolean;
  scrollVh?: number;
  smoothSpeed?: number;
};

/**
 * Pins `sectionRef` for `scrollVh` extra viewport heights and reports a
 * smoothed scroll progress in [0, 1] via `onProgress` on every animation frame
 * while it is changing. The loop idles when progress settles or the section
 * leaves the viewport, so it stops when the user stops scrolling.
 */
export function usePinnedScrollProgress(
  sectionRef: RefObject<HTMLElement | null>,
  onProgress: (progress: number) => void,
  { enabled = true, scrollVh = SCROLL_VH, smoothSpeed = SMOOTH_SPEED }: Options = {},
) {
  const lenis = useLenis();
  const callbackRef = useRef(onProgress);
  callbackRef.current = onProgress;

  useEffect(() => {
    if (!enabled) return;

    const section = sectionRef.current;
    if (!section) return;

    let target = 0;
    let current = 0;
    let rafId = 0;
    let running = false;
    let lastFrame = 0;
    let inView = true;

    const setSectionHeight = () => {
      section.style.height = `${window.innerHeight * (1 + scrollVh)}px`;
    };

    const getScroll = () =>
      lenis ? lenis.scroll : window.scrollY || window.pageYOffset;

    const computeTarget = () => {
      const scroll = getScroll();
      const rect = section.getBoundingClientRect();
      const sectionTop = scroll + rect.top;
      const scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) {
        target = 0;
        return;
      }
      target = clamp((scroll - sectionTop) / scrollable, 0, 1);
    };

    const tick = (now: number) => {
      if (!running) return;

      const dt = lastFrame ? (now - lastFrame) / 1000 : 0;
      lastFrame = now;

      const diff = target - current;

      if (Math.abs(diff) < 0.0008) {
        current = target;
        callbackRef.current(current);
        running = false;
        lastFrame = 0;
        return;
      }

      current += diff * (1 - Math.exp(-smoothSpeed * dt));
      callbackRef.current(current);
      rafId = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (running || !inView) return;
      running = true;
      lastFrame = 0;
      rafId = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      computeTarget();
      startLoop();
    };

    const onResize = () => {
      setSectionHeight();
      computeTarget();
      // Emit immediately so the visual reflects the new layout.
      current = target;
      callbackRef.current(current);
      startLoop();
    };

    setSectionHeight();
    computeTarget();
    current = target;
    callbackRef.current(current);

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) onScroll();
        else running = false;
      },
      { threshold: 0 },
    );
    observer.observe(section);

    const off = lenis?.on("scroll", onScroll);
    if (!lenis) window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      off?.();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      cancelAnimationFrame(rafId);
      section.style.height = "";
    };
  }, [lenis, sectionRef, enabled, scrollVh, smoothSpeed]);
}
