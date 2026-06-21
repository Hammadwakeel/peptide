"use client";

import { OnboardingProgressSteps } from "@/components/onboarding/OnboardingProgressSteps";
import { useRoleOnboarding } from "@/lib/hooks/use-role-onboarding";
import type { OnboardingRole } from "@/lib/onboarding/types";

type PortalOnboardingHeaderStripProps = {
  role: OnboardingRole;
  filterStepIds?: string[];
};

export function PortalOnboardingHeaderStrip({
  role,
  filterStepIds,
}: PortalOnboardingHeaderStripProps) {
  const { isVisible, progressSteps } = useRoleOnboarding(role, filterStepIds);

  if (!isVisible || progressSteps.length === 0) return null;

  return (
    <div
      className="border-t border-deep-teal/8 bg-surface-muted/30 px-4 py-3 sm:px-6 lg:px-8"
      data-tour="onboarding-progress"
    >
      <div className="mx-auto max-w-3xl">
        <OnboardingProgressSteps steps={progressSteps} compact variant="funnel" />
      </div>
    </div>
  );
}
