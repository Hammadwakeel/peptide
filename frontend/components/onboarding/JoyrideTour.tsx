"use client";

import { useCallback, useEffect, useState } from "react";
import { EVENTS, Joyride, STATUS, type EventHandler, type Step } from "react-joyride";
import { FrontierJoyrideTooltip } from "@/components/onboarding/FrontierJoyrideTooltip";
import {
  APPLY_JOYRIDE_STEPS,
  JOYRIDE_FLOATING_OPTIONS,
  JOYRIDE_LOCALE,
  JOYRIDE_TOUR_OPTIONS,
} from "@/lib/onboarding/joyride-steps";

const APPLY_JOYRIDE_KEY = "frontier-apply-joyride-done";

type JoyrideTourProps = {
  steps: Step[];
  /** Increment to restart the tour manually. */
  runToken?: number;
  /** Auto-start once when enabled (e.g. first portal visit). */
  autoStart?: boolean;
  onComplete?: () => void;
};

export function JoyrideTour({ steps, runToken = 0, autoStart = false, onComplete }: JoyrideTourProps) {
  const [mounted, setMounted] = useState(false);
  const [run, setRun] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !autoStart || autoStarted || steps.length === 0) return;
    const timer = window.setTimeout(() => {
      setRun(true);
      setAutoStarted(true);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [mounted, autoStart, autoStarted, steps.length]);

  useEffect(() => {
    if (runToken > 0) {
      setRun(true);
    }
  }, [runToken]);

  const onEvent: EventHandler = useCallback(
    (data, controls) => {
      if (data.type === EVENTS.TARGET_NOT_FOUND) {
        controls.next();
        return;
      }

      if (data.type !== EVENTS.TOUR_END) return;
      setRun(false);
      if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
        onComplete?.();
      }
    },
    [onComplete],
  );

  if (steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep={false}
      tooltipComponent={FrontierJoyrideTooltip}
      floatingOptions={JOYRIDE_FLOATING_OPTIONS}
      options={JOYRIDE_TOUR_OPTIONS}
      locale={JOYRIDE_LOCALE}
      onEvent={onEvent}
    />
  );
}

type ApplyJoyrideProps = {
  runToken?: number;
};

export function ApplyJoyride({ runToken = 0 }: ApplyJoyrideProps) {
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      setDone(window.sessionStorage.getItem(APPLY_JOYRIDE_KEY) === "1");
    } catch {
      setDone(false);
    } finally {
      setReady(true);
    }
  }, []);

  function handleComplete() {
    try {
      window.sessionStorage.setItem(APPLY_JOYRIDE_KEY, "1");
    } catch {
      // ignore storage errors
    }
    setDone(true);
  }

  if (!ready) return null;

  return (
    <JoyrideTour
      steps={APPLY_JOYRIDE_STEPS}
      runToken={runToken}
      autoStart={!done}
      onComplete={handleComplete}
    />
  );
}
