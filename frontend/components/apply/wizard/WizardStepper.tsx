"use client";

import { WIZARD_STEPS } from "@/lib/apply/types";

type WizardStepperProps = {
  currentStep: number;
  variant?: "compact" | "sidebar";
};

export function WizardStepper({ currentStep, variant = "compact" }: WizardStepperProps) {
  if (variant === "sidebar") {
    return (
      <nav aria-label="Application progress" className="space-y-1">
        <ol className="space-y-3">
          {WIZARD_STEPS.map((step) => {
            const isComplete = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <li
                key={step.id}
                className={`flex items-start gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                  isCurrent
                    ? "border-pure-white/25 bg-pure-white/10"
                    : "border-transparent bg-transparent"
                }`}
              >
                <span
                  className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-light ${
                    isComplete
                      ? "bg-pacific-teal text-pure-white"
                      : isCurrent
                        ? "bg-pure-white text-deep-teal"
                        : "border border-pure-white/25 text-pure-white/45"
                  }`}
                >
                  {isComplete ? "✓" : step.id}
                </span>
                <div className="min-w-0 pt-0.5">
                  <p
                    className={`text-sm font-light ${
                      isCurrent ? "text-pure-white" : "text-pure-white/55"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-xs text-pure-white/45">{step.short}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  const progress = ((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100;

  return (
    <nav aria-label="Application progress">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-light text-deep-teal/55">
          {Math.round((currentStep / WIZARD_STEPS.length) * 100)}% complete
        </p>
        <p className="text-xs text-deep-teal/40">
          {currentStep} / {WIZARD_STEPS.length}
        </p>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-deep-teal/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pacific-teal to-deep-teal transition-all duration-500 ease-out"
          style={{ width: `${Math.max(progress, 100 / WIZARD_STEPS.length)}%` }}
        />
      </div>
      <ol className="grid grid-cols-3 gap-2">
        {WIZARD_STEPS.map((step) => {
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <li key={step.id} className="min-w-0 text-center">
              <span
                className={`mx-auto flex size-8 items-center justify-center rounded-full text-xs font-light ${
                  isComplete
                    ? "bg-pacific-teal text-pure-white"
                    : isCurrent
                      ? "bg-deep-teal text-pure-white ring-4 ring-pacific-teal/15"
                      : "border border-deep-teal/12 text-deep-teal/35"
                }`}
              >
                {isComplete ? "✓" : step.id}
              </span>
              <p
                className={`mt-2 truncate text-[11px] font-light ${
                  isCurrent ? "text-deep-teal" : "text-deep-teal/45"
                }`}
              >
                {step.short}
              </p>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
