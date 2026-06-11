"use client";

import { create } from "zustand";
import { getAffiliateProfile } from "@/lib/affiliate/api";
import type { AffiliateProfile } from "@/lib/affiliate/types";
import { isMainAffiliate } from "@/lib/affiliate/types";
import { patchIfChanged } from "@/lib/cache/set-if-changed";
import { showError } from "@/lib/toast";

type AffiliatePortalState = {
  profile: AffiliateProfile | null;
  isMain: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  refreshInFlight: Promise<void> | null;
  refreshProfile: (options?: { force?: boolean }) => Promise<void>;
  reset: () => void;
};

export const useAffiliatePortalStore = create<AffiliatePortalState>((set, get) => ({
  profile: null,
  isMain: false,
  isLoading: true,
  isHydrated: false,
  refreshInFlight: null,

  reset: () =>
    set({
      profile: null,
      isMain: false,
      isLoading: true,
      isHydrated: false,
      refreshInFlight: null,
    }),

  refreshProfile: async (options = {}) => {
    const { force = false } = options;
    if (!force && get().isHydrated) return;
    if (get().refreshInFlight) return get().refreshInFlight!;

    const promise = (async () => {
      if (!get().isHydrated) set({ isLoading: true });
      try {
        const response = await getAffiliateProfile();
        const profile = response.affiliate;
        const isMain = isMainAffiliate(profile);
        set((state) => ({
          profile: patchIfChanged(state.profile, profile),
          isMain,
          isHydrated: true,
        }));
      } catch (error) {
        showError(error, "Unable to load affiliate profile.");
        if (force) set({ profile: null, isMain: false });
      } finally {
        set({ isLoading: false, refreshInFlight: null });
      }
    })();

    set({ refreshInFlight: promise });
    return promise;
  },
}));
