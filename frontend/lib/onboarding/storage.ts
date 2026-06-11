import type { UserRole } from "@/lib/auth/types";
import { useOnboardingStore, type OnboardingProgress } from "@/stores/onboarding-store";

export type { OnboardingProgress };

function normalizeProgress(progress: OnboardingProgress): OnboardingProgress {
  return {
    completedStepIds: progress.completedStepIds ?? [],
    dismissed: Boolean(progress.dismissed),
    joyrideCompleted: Boolean(progress.joyrideCompleted),
  };
}

export function readOnboardingProgress(userId: string, role: UserRole): OnboardingProgress {
  return normalizeProgress(useOnboardingStore.getState().getProgress(userId, role));
}

export function writeOnboardingProgress(
  userId: string,
  role: UserRole,
  progress: OnboardingProgress,
) {
  const key = `${userId}:${role}`;
  useOnboardingStore.setState((state) => ({
    progressByKey: { ...state.progressByKey, [key]: progress },
  }));
}

export function toggleOnboardingStep(
  userId: string,
  role: UserRole,
  stepId: string,
  completed: boolean,
) {
  useOnboardingStore.getState().toggleStep(userId, role, stepId, completed);
}

export function dismissOnboarding(userId: string, role: UserRole) {
  useOnboardingStore.getState().dismiss(userId, role);
}
