import type { ClinicPermission, ClinicProfileResponse } from "@/lib/doctor/clinic-types";
import { DOCTOR_MISSIONS } from "@/lib/onboarding/doctor/config";
import type { DoctorMission, DoctorMissionId, DoctorOnboardingSnapshot } from "@/lib/onboarding/doctor/types";
import { LEGACY_STEP_TO_MISSION } from "@/lib/onboarding/doctor/types";

function hasPermission(permissions: ClinicPermission[], permission: ClinicPermission) {
  return permissions.includes(permission);
}

function isPracticeComplete(profile: ClinicProfileResponse | null): boolean {
  if (!profile) return false;
  const { clinic, address, banking } = profile;
  const permissions = profile.membership.permissions;
  const practiceFilled =
    Boolean(clinic.clinic_name?.trim()) &&
    Boolean(clinic.npi_number?.trim()) &&
    Boolean(clinic.dea_number?.trim()) &&
    Boolean(clinic.state_license_number?.trim()) &&
    Boolean(address?.address1?.trim()) &&
    Boolean(address?.city?.trim());

  if (!practiceFilled) return false;
  if (hasPermission(permissions, "edit_banking")) {
    return Boolean(banking?.account_last4 && banking?.routing_last4);
  }
  return true;
}

export function evaluateDoctorMissionCompletion(
  missionId: DoctorMissionId,
  snapshot: DoctorOnboardingSnapshot,
): boolean {
  const { profile, storeCount, visibleStoreCount, patientCount, memberCount, pendingInviteCount, visitedRoutes } =
    snapshot;

  switch (missionId) {
    case "workspace":
      // Completed only after the guided workspace tour finishes.
      return false;
    case "practice":
      return isPracticeComplete(profile);
    case "catalog":
      return storeCount >= 1;
    case "storefront":
      return visibleStoreCount >= 1;
    case "patients":
      return patientCount >= 1;
    case "orders":
      return visitedRoutes.includes("/portal/doctor/orders");
    case "messages":
      return visitedRoutes.includes("/portal/doctor/messages");
    case "team":
      return memberCount > 1 || pendingInviteCount > 0;
    case "accounting":
      return visitedRoutes.includes("/portal/doctor/accounting");
    case "support":
      return visitedRoutes.includes("/portal/doctor/help");
    default:
      return false;
  }
}

export function getApplicableDoctorMissions(permissions: ClinicPermission[]): DoctorMission[] {
  return DOCTOR_MISSIONS.filter((mission) => {
    if (!mission.skipWithoutPermission || !mission.requiredPermission) return true;
    return hasPermission(permissions, mission.requiredPermission);
  });
}

export function migrateLegacyDoctorProgress(completedStepIds: string[]): DoctorMissionId[] {
  return completedStepIds
    .map((id) => LEGACY_STEP_TO_MISSION[id])
    .filter((id): id is DoctorMissionId => Boolean(id));
}
