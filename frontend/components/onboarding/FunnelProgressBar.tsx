"use client";

import type { OnboardingStep } from "@/lib/onboarding/types";

type FunnelProgressBarProps = {
  steps: OnboardingStep[];
  completedStepIds: string[];
};

export function FunnelProgressBar({ steps, completedStepIds }: FunnelProgressBarProps) {
  const completedCount = steps.filter((step) => completedStepIds.includes(step.id)).length;
  const percent = steps.length ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-light text-deep-teal">Funnel progress</span>
        <span className="text-deep-teal/60">
          {completedCount} of {steps.length} stages · {percent}%
        </span>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-deep-teal/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={`Funnel progress ${percent} percent`}
      >
        <div
          className="h-full rounded-full bg-pacific-teal transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {steps.map((step) => {
          const done = completedStepIds.includes(step.id);
          return (
            <span
              key={step.id}
              className={`rounded-full px-2.5 py-1 text-[10px] font-light sm:text-xs ${
                done
                  ? "bg-pacific-teal/15 text-pacific-teal"
                  : "bg-deep-teal/5 text-deep-teal/45"
              }`}
            >
              {step.stageLabel}
            </span>
          );
        })}
      </div>
    </div>
  );
}
