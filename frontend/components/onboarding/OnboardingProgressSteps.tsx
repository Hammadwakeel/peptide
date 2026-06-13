"use client";

import { Check } from "lucide-react";
import { Fragment } from "react";

export type OnboardingProgressStep = {
  id: string;
  title: string;
  completed: boolean;
  stageLabel?: string;
};

type OnboardingProgressStepsProps = {
  steps: OnboardingProgressStep[];
  compact?: boolean;
  variant?: "default" | "funnel";
};

export function OnboardingProgressSteps({
  steps,
  compact = false,
  variant = "default",
}: OnboardingProgressStepsProps) {
  const completedCount = steps.filter((step) => step.completed).length;
  const allComplete = completedCount === steps.length;
  const activeIndex = allComplete
    ? steps.length - 1
    : steps.findIndex((step) => !step.completed);

  return (
    <div
      className="w-full"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={steps.length}
      aria-valuenow={completedCount}
      aria-label={`Onboarding progress: ${completedCount} of ${steps.length} steps complete`}
    >
      <div className="flex w-full items-center">
        {steps.map((step, index) => {
          const isComplete = step.completed;
          const isActive = !allComplete && index === activeIndex;
          const isUpcoming = !isComplete && !isActive;

          return (
            <Fragment key={step.id}>
              <div className="flex min-w-0 shrink-0 flex-col items-center gap-1.5">
                <div
                  className={`flex size-8 items-center justify-center rounded-lg border-2 text-xs font-light transition-colors sm:size-9 sm:text-sm ${
                    isComplete
                      ? "border-pacific-teal bg-pacific-teal text-pure-white"
                      : isActive
                        ? "border-deep-teal bg-deep-teal text-pure-white"
                        : "border-deep-teal/15 bg-pure-white text-deep-teal/40"
                  }`}
                >
                  {isComplete ? (
                    <Check className="size-4" strokeWidth={2.25} aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </div>
                {!compact ? (
                  <p
                    className={`hidden max-w-[5.5rem] truncate text-center text-[10px] font-light leading-tight sm:block sm:max-w-[7rem] sm:text-xs ${
                      isUpcoming ? "text-deep-teal/40" : "text-deep-teal"
                    }`}
                    title={variant === "funnel" && step.stageLabel ? step.stageLabel : step.title}
                  >
                    {variant === "funnel" && step.stageLabel ? step.stageLabel : step.title}
                  </p>
                ) : null}
              </div>

              {index < steps.length - 1 ? (
                <div
                  className="mx-2 h-0.5 min-w-4 flex-1 self-start rounded-full sm:mx-3"
                  style={{ marginTop: compact ? "1rem" : "1.125rem" }}
                  aria-hidden="true"
                >
                  <div
                    className={`h-full rounded-full transition-colors ${
                      isComplete ? "bg-pacific-teal" : "bg-deep-teal/10"
                    }`}
                  />
                </div>
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
