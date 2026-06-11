"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "@/lib/auth/types";

export type OnboardingProgress = {
  completedStepIds: string[];
  dismissed: boolean;
  joyrideCompleted: boolean;
};

type OnboardingState = {
  progressByKey: Record<string, OnboardingProgress>;
  joyrideRunToken: number;
  getProgress: (userId: string, role: UserRole) => OnboardingProgress;
  toggleStep: (userId: string, role: UserRole, stepId: string, completed: boolean) => void;
  dismiss: (userId: string, role: UserRole) => void;
  completeJoyride: (userId: string, role: UserRole) => void;
  triggerJoyride: () => void;
};

function storageKey(userId: string, role: UserRole) {
  return `${userId}:${role}`;
}

export const EMPTY_ONBOARDING_PROGRESS: OnboardingProgress = {
  completedStepIds: [],
  dismissed: false,
  joyrideCompleted: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      progressByKey: {},
      joyrideRunToken: 0,

      getProgress: (userId, role) => {
        return get().progressByKey[storageKey(userId, role)] ?? EMPTY_ONBOARDING_PROGRESS;
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
    }),
    { name: "frontier-onboarding" },
  ),
);
