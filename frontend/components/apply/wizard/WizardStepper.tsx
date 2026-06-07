"use client";

import { WIZARD_STEPS } from "@/lib/apply/types";

type WizardStepperProps = {
  currentStep: number;
};

export function WizardStepper({ currentStep }: WizardStepperProps) {
  return (
    <nav aria-label="Application progress" className="mb-6">
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {WIZARD_STEPS.map((step, index) => {
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          return (
            <li key={step.id} className="flex flex-1 items-center gap-2">
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                  isComplete
                    ? "bg-pacific-teal text-pure-white"
                    : isCurrent
                      ? "bg-deep-teal text-pure-white"
                      : "border border-deep-teal/20 text-deep-teal/45"
                }`}
              >
                {isComplete ? "✓" : step.id}
              </span>
              <div className="min-w-0">
                <p
                  className={`truncate text-xs font-medium ${
                    isCurrent ? "text-deep-teal" : "text-deep-teal/50"
                  }`}
                >
                  {step.label}
                </p>
              </div>
              {index < WIZARD_STEPS.length - 1 ? (
                <span className="mx-2 hidden h-px flex-1 bg-deep-teal/10 sm:block" aria-hidden="true" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
