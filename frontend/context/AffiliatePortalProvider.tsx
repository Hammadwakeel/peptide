"use client";

import { useShallow } from "@/lib/hooks/zustand";
import { useAffiliatePortalStore } from "@/stores/affiliate-portal-store";

export function AffiliatePortalProvider({ children }: { children: React.ReactNode }) {
  return children;
}

export function useAffiliatePortal() {
  return useAffiliatePortalStore(
    useShallow((state) => ({
      profile: state.profile,
      isMain: state.isMain,
      isLoading: state.isLoading,
      refreshProfile: state.refreshProfile,
    })),
  );
}
