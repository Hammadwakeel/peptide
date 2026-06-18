"use client";

import { useEffect, useState } from "react";
import {
  LANDING_PRELOAD_TIMEOUT_MS,
  preloadLandingAssets,
} from "@/lib/landing/preload-assets";

export function useLandingPreload(): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const timeoutId = window.setTimeout(() => {
      if (!cancelled) setIsReady(true);
    }, LANDING_PRELOAD_TIMEOUT_MS);

    void preloadLandingAssets().finally(() => {
      if (!cancelled) {
        window.clearTimeout(timeoutId);
        setIsReady(true);
      }
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  return isReady;
}
