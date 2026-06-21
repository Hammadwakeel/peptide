"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EVENTS, Joyride, STATUS, type EventHandler, type Step } from "react-joyride";
import { FrontierJoyrideTooltip } from "@/components/onboarding/FrontierJoyrideTooltip";
import type { GuidedTourStep } from "@/lib/onboarding/doctor/types";
import {
  JOYRIDE_FLOATING_OPTIONS,
  JOYRIDE_LOCALE,
  JOYRIDE_TOUR_OPTIONS,
} from "@/lib/onboarding/joyride-steps";

type GuidedTourEngineProps = {
  steps: GuidedTourStep[];
  runToken?: number;
  autoStart?: boolean;
  autoAdvanceMs?: number;
  stepIndex?: number;
  onStepChange?: (index: number) => void;
  onDemoAction?: (step: GuidedTourStep, index: number) => void;
  onComplete?: () => void;
};

export function GuidedTourEngine({
  steps,
  runToken = 0,
  autoStart = false,
  autoAdvanceMs,
  stepIndex = 0,
  onStepChange,
  onDemoAction,
  onComplete,
}: GuidedTourEngineProps) {
  const [mounted, setMounted] = useState(false);
  const [run, setRun] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(stepIndex);
  const autoAdvanceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCurrentIndex(stepIndex);
  }, [stepIndex]);

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
      setCurrentIndex(0);
    }
  }, [runToken]);

  const currentStep = steps[currentIndex];

  const joyrideSteps = useMemo(
    () =>
      steps.map((step) => {
        const isActionGated = step.advanceMode === "custom_event";
        return {
          ...step,
          hideFooter: isActionGated,
          spotlightClicks: (step as GuidedTourStep).spotlightClicks ?? isActionGated,
          data: {
            advanceMode: step.advanceMode ?? "manual",
            actionHint: step.actionHint,
            missionId: step.missionId,
          },
        } as Step;
      }),
    [steps],
  );

  const advance = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      onStepChange?.(next);
      if (next >= steps.length) {
        setRun(false);
        onComplete?.();
        return prev;
      }
      return next;
    });
  }, [onStepChange, onComplete, steps.length]);

  useEffect(() => {
    if (!currentStep?.advanceEvent || currentStep.advanceMode !== "custom_event") return;
    const eventName = currentStep.advanceEvent;

    function handler() {
      advance();
    }

    window.addEventListener(eventName, handler);
    return () => window.removeEventListener(eventName, handler);
  }, [currentStep, advance]);

  useEffect(() => {
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    if (!run || !autoAdvanceMs || !currentStep) return;

    autoAdvanceTimerRef.current = window.setTimeout(() => {
      if (currentStep.advanceMode === "custom_event") {
        onDemoAction?.(currentStep, currentIndex);
      } else {
        advance();
      }
    }, autoAdvanceMs);

    return () => {
      if (autoAdvanceTimerRef.current !== null) {
        window.clearTimeout(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
    };
  }, [run, autoAdvanceMs, currentStep, currentIndex, onDemoAction, advance]);

  const onEvent: EventHandler = useCallback(
    (data) => {
      if (data.type === EVENTS.TARGET_NOT_FOUND) {
        advance();
        return;
      }

      if (data.type === EVENTS.STEP_AFTER && data.action === "next") {
        const step = steps[data.index];
        if (step?.advanceMode === "custom_event") {
          return;
        }
        const next = data.index + 1;
        setCurrentIndex(next);
        onStepChange?.(next);
        if (next >= steps.length) {
          setRun(false);
          onComplete?.();
        }
        return;
      }

      if (data.type === EVENTS.STEP_BEFORE) {
        onStepChange?.(data.index);
      }

      if (data.type !== EVENTS.TOUR_END) return;
      setRun(false);
      if (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED) {
        onComplete?.();
      }
    },
    [advance, onComplete, onStepChange, steps],
  );

  if (steps.length === 0) return null;

  return (
    <Joyride
      steps={joyrideSteps}
      run={run}
      stepIndex={currentIndex}
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
