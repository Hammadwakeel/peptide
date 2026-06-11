"use client";

import { useEffect } from "react";
import { REFRESH_INTERVAL_MS } from "@/lib/auth/constants";
import { isTokenExpired, shouldRefreshToken } from "@/lib/auth/api";
import { readSession } from "@/lib/auth/storage";
import type { AuthSession, LoginCredentials } from "@/lib/auth/types";
import { useShallow } from "@/lib/hooks/zustand";
import { useAuthStore } from "@/stores/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void useAuthStore.getState().resolveInitialSession();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const current = readSession();
      if (!current) return;

      const { expireSession, refreshSession } = useAuthStore.getState();

      if (isTokenExpired(current.refreshExpiresAt)) {
        expireSession();
        return;
      }

      if (shouldRefreshToken(current.expiresAt) || isTokenExpired(current.expiresAt)) {
        void refreshSession();
      }
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, []);

  return children;
}

export function useAuth() {
  return useAuthStore(
    useShallow((state) => ({
      session: state.session,
      isLoading: state.isLoading,
      isAuthenticated: state.isAuthenticated,
      login: state.login,
      establishSession: state.establishSession,
      logout: state.logout,
    })),
  );
}

export function useRequiredRole(requiredRole: AuthSession["role"]) {
  const { session, isLoading } = useAuthStore(
    useShallow((state) => ({
      session: state.session,
      isLoading: state.isLoading,
    })),
  );

  return {
    session,
    isLoading,
    hasAccess: session?.role === requiredRole,
  };
}

export type { LoginCredentials };
