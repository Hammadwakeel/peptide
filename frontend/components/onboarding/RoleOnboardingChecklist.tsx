"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { ROLE_ONBOARDING_CONFIGS } from "@/lib/onboarding/configs";
import { Tooltip } from "@/components/ui/Tippy";
import { useShallow } from "@/lib/hooks/zustand";
import { EMPTY_ONBOARDING_PROGRESS, useOnboardingStore } from "@/stores/onboarding-store";
import type { UserRole } from "@/lib/auth/types";

type RoleOnboardingChecklistProps = {
  role: UserRole;
  /** Hide sub-affiliate step for non-main affiliates */
  filterStepIds?: string[];
};

export function RoleOnboardingChecklist({
  role,
  filterStepIds,
}: RoleOnboardingChecklistProps) {
  const { session } = useAuth();
  const config = ROLE_ONBOARDING_CONFIGS[role];
  const steps = filterStepIds
    ? config.steps.filter((step) => !filterStepIds.includes(step.id))
    : config.steps;

  const progressKey = session ? `${session.userId}:${role}` : "";
  const storedProgress = useOnboardingStore((state) =>
    progressKey ? state.progressByKey[progressKey] : undefined,
  );
  const progress = storedProgress ?? EMPTY_ONBOARDING_PROGRESS;
  const { toggleStep, dismiss, triggerJoyride } = useOnboardingStore(
    useShallow((state) => ({
      toggleStep: state.toggleStep,
      dismiss: state.dismiss,
      triggerJoyride: state.triggerJoyride,
    })),
  );

  if (!session || progress.dismissed) return null;

  const completedCount = steps.filter((step) =>
    progress.completedStepIds.includes(step.id),
  ).length;
  const allComplete = completedCount === steps.length;

  if (allComplete) return null;

  function handleToggle(stepId: string, completed: boolean) {
    if (!session) return;
    toggleStep(session.userId, role, stepId, completed);
  }

  function handleDismiss() {
    if (!session) return;
    dismiss(session.userId, role);
  }

  return (
    <section
      data-tour="onboarding-checklist"
      className="rounded-[1.75rem] border border-pacific-teal/20 bg-gradient-to-br from-pacific-teal/[0.06] to-pure-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-pacific-teal">
            Getting started
          </p>
          <h2 className="mt-2 font-serif text-xl font-light text-deep-teal sm:text-2xl">
            {config.title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-deep-teal/60">{config.subtitle}</p>
        </div>
        <div className="rounded-full border border-deep-teal/10 bg-pure-white px-3 py-1 text-xs font-medium text-deep-teal/70">
          {completedCount} / {steps.length} complete
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {steps.map((step) => {
          const completed = progress.completedStepIds.includes(step.id);
          return (
            <li
              key={step.id}
              className="flex items-start gap-3 rounded-2xl border border-deep-teal/8 bg-pure-white/80 px-4 py-3"
            >
              <Tooltip content={completed ? "Mark incomplete" : "Mark complete"}>
                <button
                  type="button"
                  aria-label={completed ? "Mark incomplete" : "Mark complete"}
                  onClick={() => handleToggle(step.id, !completed)}
                  className="mt-0.5 shrink-0 text-pacific-teal"
                >
                  {completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                </button>
              </Tooltip>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-deep-teal">{step.title}</p>
                <p className="mt-0.5 text-sm text-deep-teal/60">{step.description}</p>
                {step.href ? (
                  <Link
                    href={step.href}
                    className="mt-2 inline-block text-sm font-medium text-pacific-teal hover:underline"
                  >
                    {step.actionLabel ?? "Go to step"}
                  </Link>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => triggerJoyride()}
          className="text-sm font-medium text-pacific-teal hover:underline"
        >
          Take a guided tour
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-sm text-deep-teal/50 hover:text-deep-teal"
        >
          Dismiss checklist
        </button>
      </div>
    </section>
  );
}
