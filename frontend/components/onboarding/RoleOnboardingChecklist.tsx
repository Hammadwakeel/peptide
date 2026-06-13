"use client";

import { FunnelOnboarding } from "@/components/onboarding/FunnelOnboarding";
import type { UserRole } from "@/lib/auth/types";

type RoleOnboardingChecklistProps = {
  role: UserRole;
  /** Hide sub-affiliate step for non-main affiliates */
  filterStepIds?: string[];
};

/** @deprecated Use FunnelOnboarding directly — kept for existing portal imports */
export function RoleOnboardingChecklist(props: RoleOnboardingChecklistProps) {
  return <FunnelOnboarding {...props} />;
}

export { FunnelOnboarding };
