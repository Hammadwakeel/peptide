"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthProvider";
import { SmoothScroll } from "@/components/SmoothScroll";

const TOAST_CLASS_NAMES = {
  toast: "rounded-xl border border-deep-teal/10 bg-pure-white text-deep-teal shadow-lg",
  title: "text-sm font-medium",
  description: "text-sm text-deep-teal/70",
} as const;

function isPortalRoute(pathname: string) {
  return pathname.startsWith("/portal");
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const enableSmoothScroll = !isPortalRoute(pathname);

  const toastOptions = useMemo(
    () => ({
      classNames: TOAST_CLASS_NAMES,
    }),
    [],
  );

  return (
    <AuthProvider>
      {enableSmoothScroll ? <SmoothScroll>{children}</SmoothScroll> : children}
      <Toaster position="top-center" richColors closeButton toastOptions={toastOptions} />
    </AuthProvider>
  );
}
