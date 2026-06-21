"use client";

import { useAuth } from "@/context/AuthProvider";
import { ROLE_ONBOARDING_CONFIGS } from "@/lib/onboarding/configs";
import type { OnboardingRole } from "@/lib/onboarding/types";
import { EMPTY_ONBOARDING_PROGRESS, useOnboardingStore } from "@/stores/onboarding-store";

export function useRoleOnboarding(role: OnboardingRole, filterStepIds?: string[]) {
  const { session } = useAuth();
  const config = ROLE_ONBOARDING_CONFIGS[role as keyof typeof ROLE_ONBOARDING_CONFIGS];

  const steps = filterStepIds
    ? config.steps.filter((step) => !filterStepIds.includes(step.id))
    : config.steps;

  const progressKey = session ? `${session.userId}:${role}` : "";
  const storedProgress = useOnboardingStore((state) =>
    progressKey ? state.progressByKey[progressKey] : undefined,
  );
  const progress = storedProgress ?? EMPTY_ONBOARDING_PROGRESS;

  const completedCount = steps.filter((step) => progress.completedStepIds.includes(step.id)).length;
  const allComplete = completedCount === steps.length;
  const isVisible = Boolean(session) && !progress.dismissed;

  const progressSteps = steps.map((step) => ({
    id: step.id,
    title: step.title,
    stageLabel: step.stageLabel,
    completed: progress.completedStepIds.includes(step.id),
  }));

  return {
    config,
    steps,
    progress,
    progressSteps,
    completedCount,
    allComplete,
    isVisible,
  };
}
