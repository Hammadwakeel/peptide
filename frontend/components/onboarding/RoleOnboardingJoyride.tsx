"use client";

import { useCallback, useMemo } from "react";
import { JoyrideTour } from "@/components/onboarding/JoyrideTour";
import { useAuth } from "@/context/AuthProvider";
import { ROLE_ONBOARDING_CONFIGS } from "@/lib/onboarding/configs";
import { getRoleJoyrideSteps } from "@/lib/onboarding/joyride-steps";
import { useShallow } from "@/lib/hooks/zustand";
import { useOnboardingStore } from "@/stores/onboarding-store";
import type { OnboardingRole } from "@/lib/onboarding/types";

type RoleOnboardingJoyrideProps = {
  role: OnboardingRole;
  filterStepIds?: string[];
};

export function RoleOnboardingJoyride({ role, filterStepIds }: RoleOnboardingJoyrideProps) {
  const { session } = useAuth();
  const { joyrideRunToken, completeJoyride } = useOnboardingStore(
    useShallow((state) => ({
      joyrideRunToken: state.joyrideRunToken,
      completeJoyride: state.completeJoyride,
    })),
  );

  const progressKey = session ? `${session.userId}:${role}` : "";
  const progress = useOnboardingStore((state) =>
    progressKey ? state.progressByKey[progressKey] : undefined,
  );
  const joyrideCompleted = progress?.joyrideCompleted ?? false;
  const config = ROLE_ONBOARDING_CONFIGS[role];
  const visibleChecklistSteps = filterStepIds
    ? config.steps.filter((step) => !filterStepIds.includes(step.id))
    : config.steps;
  const checklistComplete =
    visibleChecklistSteps.length > 0 &&
    visibleChecklistSteps.every((step) => progress?.completedStepIds.includes(step.id));
  const includeChecklistStep =
    !progress || (!progress.dismissed && !checklistComplete);

  const steps = useMemo(
    () => getRoleJoyrideSteps(role, { filterStepIds, includeChecklistStep }),
    [role, filterStepIds, includeChecklistStep],
  );

  const handleComplete = useCallback(() => {
    if (!session) return;
    completeJoyride(session.userId, role);
  }, [completeJoyride, role, session]);

  if (!session) return null;

  return (
    <JoyrideTour
      steps={steps}
      runToken={joyrideRunToken}
      autoStart={!joyrideCompleted}
      onComplete={handleComplete}
    />
  );
}
