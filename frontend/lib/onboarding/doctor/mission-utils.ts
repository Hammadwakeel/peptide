import type { DoctorMission, DoctorMissionId } from "@/lib/onboarding/doctor/types";

export function getNextIncompleteMission(
  missions: DoctorMission[],
  completedMissionIds: DoctorMissionId[],
): DoctorMission | undefined {
  return missions.find((mission) => !completedMissionIds.includes(mission.id));
}
