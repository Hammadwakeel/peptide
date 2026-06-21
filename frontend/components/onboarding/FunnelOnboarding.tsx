"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  Sparkles,
} from "lucide-react";
import { FunnelProgressBar } from "@/components/onboarding/FunnelProgressBar";
import { Tooltip } from "@/components/ui/Tippy";
import { useAuth } from "@/context/AuthProvider";
import { useRoleOnboarding } from "@/lib/hooks/use-role-onboarding";
import { useShallow } from "@/lib/hooks/zustand";
import { useOnboardingStore } from "@/stores/onboarding-store";
import {
  btnGhostClass,
  btnPrimaryClass,
  shapeStandardsCards,
  typeGuideSubtitle,
  typeGuideTitle,
  typeSectionLabel,
} from "@/lib/brand/design-system";
import type { OnboardingRole } from "@/lib/onboarding/types";

type FunnelOnboardingProps = {
  role: OnboardingRole;
  filterStepIds?: string[];
};

const CARD_CLASS =
  "overflow-hidden rounded-tl-[3.25rem] rounded-tr-xl rounded-br-[3.25rem] rounded-bl-xl border border-deep-teal/15 bg-pure-white shadow-[0_4px_24px_rgba(1,26,36,0.08)] sm:rounded-tl-[4rem] sm:rounded-br-[4rem]";

/** Funnel tier width — wider at top, narrower toward launch */
const TIER_WIDTH = ["w-full", "w-[94%]", "w-[88%]", "w-[82%]", "w-[76%]"];

function tierWidth(index: number) {
  return TIER_WIDTH[Math.min(index, TIER_WIDTH.length - 1)];
}

export function FunnelOnboarding({ role, filterStepIds }: FunnelOnboardingProps) {
  const { session } = useAuth();
  const { config, steps, progress, allComplete, isVisible, completedCount } = useRoleOnboarding(
    role,
    filterStepIds,
  );
  const { toggleStep, dismiss, triggerJoyride } = useOnboardingStore(
    useShallow((state) => ({
      toggleStep: state.toggleStep,
      dismiss: state.dismiss,
      triggerJoyride: state.triggerJoyride,
    })),
  );

  const activeIndex = steps.findIndex((step) => !progress.completedStepIds.includes(step.id));
  const defaultExpanded = activeIndex >= 0 ? steps[activeIndex]?.id : steps[steps.length - 1]?.id;
  const [expandedId, setExpandedId] = useState<string | undefined>(undefined);
  const openId = expandedId ?? defaultExpanded;

  if (!isVisible) return null;

  function handleToggle(stepId: string, completed: boolean) {
    if (!session) return;
    toggleStep(session.userId, role, stepId, completed);
  }

  function handleDismiss() {
    if (!session) return;
    dismiss(session.userId, role);
  }

  const totalMinutes = steps.reduce((sum, step) => sum + step.estimatedMinutes, 0);
  const remainingMinutes = steps
    .filter((step) => !progress.completedStepIds.includes(step.id))
    .reduce((sum, step) => sum + step.estimatedMinutes, 0);

  return (
    <section data-tour="onboarding-checklist" className={CARD_CLASS}>
      <div className="border-b border-deep-teal/8 bg-surface-muted/40 px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={typeSectionLabel}>Funnel onboarding</p>
            <h2 className={`mt-2 ${typeGuideTitle}`}>
              {allComplete ? "Launch funnel complete" : config.funnelTitle}
            </h2>
            <p className={`mt-2 max-w-2xl ${typeGuideSubtitle}`}>
              {allComplete
                ? "Every stage is done. Dismiss this funnel when you are ready to work without guidance."
                : config.funnelSubtitle}
            </p>
            {!allComplete ? (
              <p className="mt-2 text-xs text-deep-teal/50">
                ~{remainingMinutes} min remaining · {totalMinutes} min total funnel
              </p>
            ) : null}
          </div>
          {!allComplete ? (
            <button
              type="button"
              onClick={() => triggerJoyride()}
              className={`${btnGhostClass} shrink-0 px-3 py-1.5 text-xs`}
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              Guided tour
            </button>
          ) : null}
        </div>

        {!allComplete ? (
          <div className="mt-5">
            <FunnelProgressBar steps={steps} completedStepIds={progress.completedStepIds} />
          </div>
        ) : null}
      </div>

      {!allComplete ? (
        <div className="flex flex-col items-center gap-3 px-3 py-5 sm:px-4 sm:py-6">
          {steps.map((step, index) => {
            const completed = progress.completedStepIds.includes(step.id);
            const isActive = index === activeIndex;
            const isExpanded = openId === step.id;
            const shapeClass = shapeStandardsCards[index % shapeStandardsCards.length];

            return (
              <div
                key={step.id}
                className={`mx-auto transition-[width] duration-300 ${tierWidth(index)}`}
              >
                <article
                  className={`border transition-[border-color,box-shadow] duration-300 ${shapeClass} ${
                    completed
                      ? "border-pacific-teal/25 bg-pacific-teal/[0.04]"
                      : isActive
                        ? "border-deep-teal/20 bg-pure-white shadow-[0_8px_30px_rgba(1,26,36,0.08)]"
                        : "border-deep-teal/10 bg-surface-muted/20"
                  }`}
                >
                  <div className="flex w-full items-start gap-3 px-4 py-4 sm:px-5">
                    <Tooltip content={completed ? "Mark incomplete" : "Mark complete"}>
                      <button
                        type="button"
                        onClick={() => handleToggle(step.id, !completed)}
                        className="mt-0.5 shrink-0 text-pacific-teal"
                        aria-label={completed ? "Mark incomplete" : "Mark complete"}
                      >
                        {completed ? (
                          <CheckCircle2 className="size-5" />
                        ) : (
                          <Circle className="size-5" />
                        )}
                      </button>
                    </Tooltip>

                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => setExpandedId(isExpanded ? undefined : step.id)}
                      aria-expanded={isExpanded}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-deep-teal/8 px-2 py-0.5 text-[10px] font-light uppercase tracking-wide text-deep-teal/70">
                          Stage {step.stage} · {step.stageLabel}
                        </span>
                        {isActive && !completed ? (
                          <span className="rounded-full bg-coral-blush/80 px-2 py-0.5 text-[10px] font-light text-deep-teal">
                            Up next
                          </span>
                        ) : null}
                        <span className="inline-flex items-center gap-1 text-[10px] text-deep-teal/45">
                          <Clock3 className="size-3" aria-hidden="true" />~{step.estimatedMinutes} min
                        </span>
                      </div>
                      <h3 className="mt-2 font-light text-deep-teal">{step.title}</h3>
                      <p className="mt-1 text-sm text-deep-teal/60">{step.description}</p>
                    </button>

                    <button
                      type="button"
                      className="mt-0.5 shrink-0 text-deep-teal/40"
                      onClick={() => setExpandedId(isExpanded ? undefined : step.id)}
                      aria-label={isExpanded ? "Collapse stage" : "Expand stage"}
                    >
                      <ChevronDown
                        className={`size-5 transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  {isExpanded ? (
                    <div className="border-t border-deep-teal/8 px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
                      <p className="text-sm leading-relaxed text-deep-teal/75">{step.details}</p>

                      <div className="mt-4">
                        <p className="text-xs font-light uppercase tracking-wide text-deep-teal/50">
                          In this stage
                        </p>
                        <ul className="mt-2 space-y-2">
                          {step.checklist.map((item) => (
                            <li
                              key={item}
                              className="flex items-start gap-2 text-sm text-deep-teal/80"
                            >
                              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-pacific-teal" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Link
                        href={step.href}
                        className={`mt-5 inline-flex items-center gap-2 ${btnPrimaryClass} px-5 py-2.5 text-sm`}
                      >
                        {step.actionLabel ?? "Go to stage"}
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </div>
                  ) : null}
                </article>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
          <p className="text-sm text-deep-teal/60">
            All {completedCount} funnel stages complete. You are cleared for full portal access.
          </p>
          <button type="button" onClick={handleDismiss} className={btnPrimaryClass}>
            Dismiss funnel
          </button>
        </div>
      )}

      {!allComplete ? (
        <div className="flex justify-end border-t border-deep-teal/8 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={handleDismiss}
            className="text-sm text-deep-teal/50 transition-colors hover:text-deep-teal"
          >
            Dismiss funnel
          </button>
        </div>
      ) : null}
    </section>
  );
}
