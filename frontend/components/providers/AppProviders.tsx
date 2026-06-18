"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { usePatientRequestsStore } from "@/stores/patient-requests-store";

const TOAST_CLASS_NAMES = {
  toast: "rounded-xl border border-deep-teal/10 bg-pure-white text-deep-teal shadow-lg",
  title: "text-sm font-light",
  description: "text-sm text-deep-teal/70",
} as const;

function isPortalRoute(pathname: string) {
  return pathname.startsWith("/portal");
}

function PersistStoreHydration() {
  useEffect(() => {
    void useOnboardingStore.persist.rehydrate();
    void usePatientRequestsStore.persist.rehydrate();
  }, []);

  return null;
}

function AppProvidersShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const enableSmoothScroll = !isPortalRoute(pathname);

  return enableSmoothScroll ? <SmoothScroll>{children}</SmoothScroll> : children;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [routerReady, setRouterReady] = useState(false);

  useEffect(() => {
    setRouterReady(true);
  }, []);

  const toastOptions = useMemo(
    () => ({
      classNames: TOAST_CLASS_NAMES,
    }),
    [],
  );

  return (
    <AuthProvider>
      <PersistStoreHydration />
      {routerReady ? <AppProvidersShell>{children}</AppProvidersShell> : children}
      <Toaster position="top-center" closeButton toastOptions={toastOptions} />
    </AuthProvider>
  );
}
