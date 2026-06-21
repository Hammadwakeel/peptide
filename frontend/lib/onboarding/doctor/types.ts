import type { ClinicPermission } from "@/lib/doctor/clinic-types";
import type { Step } from "react-joyride";

export type DoctorMissionId =
  | "workspace"
  | "practice"
  | "catalog"
  | "storefront"
  | "patients"
  | "orders"
  | "messages"
  | "team"
  | "accounting"
  | "support";

export type TourAdvanceMode = "manual" | "click_target" | "custom_event";

export type DoctorMission = {
  id: DoctorMissionId;
  title: string;
  description: string;
  route: string;
  stage: number;
  stageLabel: string;
  estimatedMinutes: number;
  /** Required permission to run interactive steps; mission still shown as informational if missing */
  requiredPermission?: ClinicPermission;
  /** Skip mission entirely when permission missing */
  skipWithoutPermission?: boolean;
};

export type GuidedTourStep = Step & {
  advanceMode?: TourAdvanceMode;
  /** Custom event name to listen for before advancing (advanceMode: custom_event) */
  advanceEvent?: string;
  actionHint?: string;
  missionId?: DoctorMissionId;
  /** Shorthand — resolved to data-tour selector */
  targetId?: string;
  spotlightClicks?: boolean;
};

export type DoctorTourStepInput = Omit<GuidedTourStep, "target"> & {
  target?: Step["target"];
  targetId?: string;
};

export type DoctorOnboardingSnapshot = {
  profile: import("@/lib/doctor/clinic-types").ClinicProfileResponse | null;
  storeCount: number;
  visibleStoreCount: number;
  patientCount: number;
  memberCount: number;
  pendingInviteCount: number;
  pendingReviewCount: number;
  visitedRoutes: string[];
};

export const LEGACY_STEP_TO_MISSION: Record<string, DoctorMissionId> = {
  "clinic-settings": "practice",
  "my-store": "storefront",
  "invite-patients": "patients",
  "invite-staff": "team",
};
