"use client";

import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthProvider";
import { SmoothScroll } from "@/components/SmoothScroll";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SmoothScroll>{children}</SmoothScroll>
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast:
              "rounded-xl border border-deep-teal/10 bg-pure-white text-deep-teal shadow-lg",
            title: "text-sm font-medium",
            description: "text-sm text-deep-teal/70",
          },
        }}
      />
    </AuthProvider>
  );
}
