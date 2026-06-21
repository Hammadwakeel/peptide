"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "@/lib/auth/types";
import type { DoctorMissionId } from "@/lib/onboarding/doctor/types";
import { migrateLegacyDoctorProgress } from "@/lib/onboarding/doctor/predicates";

export type OnboardingProgress = {
  completedStepIds: string[];
  dismissed: boolean;
  joyrideCompleted: boolean;
  /** Doctor elite onboarding */
  completedMissionIds?: DoctorMissionId[];
  activeMissionId?: DoctorMissionId | null;
  activeStepIndex?: number;
  visitedRoutes?: string[];
  /** First-login auto kickoff for the clinic launch guide */
  setupGuideKickoff?: boolean;
};

type OnboardingState = {
  progressByKey: Record<string, OnboardingProgress>;
  joyrideRunToken: number;
  getProgress: (userId: string, role: UserRole) => OnboardingProgress;
  toggleStep: (userId: string, role: UserRole, stepId: string, completed: boolean) => void;
  dismiss: (userId: string, role: UserRole) => void;
  completeJoyride: (userId: string, role: UserRole) => void;
  triggerJoyride: () => void;
  setDoctorProgress: (userId: string, patch: Partial<OnboardingProgress>) => void;
  completeDoctorMission: (userId: string, missionId: DoctorMissionId) => void;
  setActiveDoctorMission: (userId: string, missionId: DoctorMissionId | null, stepIndex?: number) => void;
  markDoctorRouteVisited: (userId: string, route: string) => void;
  syncDoctorMissions: (userId: string, missionIds: DoctorMissionId[]) => void;
  restartDoctorGuide: (userId: string) => void;
};

function storageKey(userId: string, role: UserRole) {
  return `${userId}:${role}`;
}

export function normalizeDoctorProgress(progress: OnboardingProgress): OnboardingProgress {
  const completedMissionIds = progress.completedMissionIds ?? [];
  const migrated = migrateLegacyDoctorProgress(progress.completedStepIds);
  const mergedMissions = Array.from(new Set([...completedMissionIds, ...migrated]));
  const setupGuideKickoff = Boolean(progress.setupGuideKickoff);

  // Workspace used to auto-complete on dashboard visit; clear that stale state.
  const completedMissionIdsNormalized = setupGuideKickoff
    ? mergedMissions
    : mergedMissions.filter((id) => id !== "workspace");

  return {
    completedStepIds: progress.completedStepIds ?? [],
    dismissed: Boolean(progress.dismissed),
    joyrideCompleted: Boolean(progress.joyrideCompleted),
    completedMissionIds: completedMissionIdsNormalized,
    activeMissionId: progress.activeMissionId ?? null,
    activeStepIndex: progress.activeStepIndex ?? 0,
    visitedRoutes: progress.visitedRoutes ?? [],
    setupGuideKickoff: Boolean(progress.setupGuideKickoff),
  };
}

export const EMPTY_ONBOARDING_PROGRESS: OnboardingProgress = {
  completedStepIds: [],
  dismissed: false,
  joyrideCompleted: false,
  completedMissionIds: [],
  activeMissionId: null,
  activeStepIndex: 0,
  visitedRoutes: [],
  setupGuideKickoff: false,
};

export const NORMALIZED_EMPTY_DOCTOR_PROGRESS = normalizeDoctorProgress(EMPTY_ONBOARDING_PROGRESS);

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      progressByKey: {},
      joyrideRunToken: 0,

      getProgress: (userId, role) => {
        const raw = get().progressByKey[storageKey(userId, role)] ?? EMPTY_ONBOARDING_PROGRESS;
        return role === "doctor" ? normalizeDoctorProgress(raw) : raw;
      },

      toggleStep: (userId, role, stepId, completed) => {
        const key = storageKey(userId, role);
        const current = get().getProgress(userId, role);
        const completedStepIds = completed
          ? Array.from(new Set([...current.completedStepIds, stepId]))
          : current.completedStepIds.filter((id) => id !== stepId);

        set((state) => ({
          progressByKey: {
            ...state.progressByKey,
            [key]: { ...current, completedStepIds },
          },
        }));
      },

      dismiss: (userId, role) => {
        const key = storageKey(userId, role);
        const current = get().getProgress(userId, role);
        set((state) => ({
          progressByKey: {
            ...state.progressByKey,
            [key]: { ...current, dismissed: true },
          },
        }));
      },

      completeJoyride: (userId, role) => {
        const key = storageKey(userId, role);
        const current = get().getProgress(userId, role);
        set((state) => ({
          progressByKey: {
            ...state.progressByKey,
            [key]: { ...current, joyrideCompleted: true },
          },
        }));
      },

      triggerJoyride: () => {
        set((state) => ({ joyrideRunToken: state.joyrideRunToken + 1 }));
      },

      setDoctorProgress: (userId, patch) => {
        const key = storageKey(userId, "doctor");
        const current = get().getProgress(userId, "doctor");
        set((state) => ({
          progressByKey: {
            ...state.progressByKey,
            [key]: normalizeDoctorProgress({ ...current, ...patch }),
          },
        }));
      },

      completeDoctorMission: (userId, missionId) => {
        const key = storageKey(userId, "doctor");
        const current = get().getProgress(userId, "doctor");
        const completedMissionIds = Array.from(
          new Set([...(current.completedMissionIds ?? []), missionId]),
        );
        set((state) => ({
          progressByKey: {
            ...state.progressByKey,
            [key]: normalizeDoctorProgress({
              ...current,
              completedMissionIds,
              activeMissionId: null,
              activeStepIndex: 0,
            }),
          },
        }));
      },

      setActiveDoctorMission: (userId, missionId, stepIndex = 0) => {
        const key = storageKey(userId, "doctor");
        const current = get().getProgress(userId, "doctor");
        set((state) => ({
          progressByKey: {
            ...state.progressByKey,
            [key]: normalizeDoctorProgress({
              ...current,
              activeMissionId: missionId,
              activeStepIndex: stepIndex,
            }),
          },
        }));
      },

      markDoctorRouteVisited: (userId, route) => {
        const key = storageKey(userId, "doctor");
        const current = get().getProgress(userId, "doctor");
        if (current.visitedRoutes?.includes(route)) return;
        const visitedRoutes = Array.from(new Set([...(current.visitedRoutes ?? []), route]));
        set((state) => ({
          progressByKey: {
            ...state.progressByKey,
            [key]: normalizeDoctorProgress({ ...current, visitedRoutes }),
          },
        }));
      },

      syncDoctorMissions: (userId, missionIds) => {
        if (missionIds.length === 0) return;
        const key = storageKey(userId, "doctor");
        const current = get().getProgress(userId, "doctor");
        const existing = new Set(current.completedMissionIds ?? []);
        const newMissionIds = missionIds.filter((id) => !existing.has(id));
        if (newMissionIds.length === 0) return;
        const completedMissionIds = Array.from(new Set([...existing, ...newMissionIds]));
        set((state) => ({
          progressByKey: {
            ...state.progressByKey,
            [key]: normalizeDoctorProgress({ ...current, completedMissionIds }),
          },
        }));
      },

      restartDoctorGuide: (userId) => {
        const key = storageKey(userId, "doctor");
        const current = get().getProgress(userId, "doctor");
        set((state) => ({
          progressByKey: {
            ...state.progressByKey,
            [key]: normalizeDoctorProgress({
              ...current,
              completedMissionIds: [],
              joyrideCompleted: false,
              activeMissionId: null,
              activeStepIndex: 0,
              dismissed: false,
              setupGuideKickoff: true,
            }),
          },
        }));
      },
    }),
    { name: "frontier-onboarding", skipHydration: true },
  ),
);
