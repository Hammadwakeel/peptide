"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getAffiliateProfile } from "@/lib/affiliate/api";
import type { AffiliateProfile } from "@/lib/affiliate/types";
import { isMainAffiliate } from "@/lib/affiliate/types";
import { showError } from "@/lib/toast";

type AffiliatePortalContextValue = {
  profile: AffiliateProfile | null;
  isMain: boolean;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
};

const AffiliatePortalContext = createContext<AffiliatePortalContextValue | null>(null);

export function AffiliatePortalProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<AffiliateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAffiliateProfile();
      setProfile(response.affiliate);
    } catch (error) {
      showError(error, "Unable to load affiliate profile.");
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const value = useMemo(
    () => ({
      profile,
      isMain: isMainAffiliate(profile),
      isLoading,
      refreshProfile,
    }),
    [profile, isLoading, refreshProfile],
  );

  return (
    <AffiliatePortalContext.Provider value={value}>
      {children}
    </AffiliatePortalContext.Provider>
  );
}

export function useAffiliatePortal() {
  const context = useContext(AffiliatePortalContext);
  if (!context) {
    throw new Error("useAffiliatePortal must be used within AffiliatePortalProvider.");
  }
  return context;
}
