"use client";

import { create } from "zustand";
import {
  isTokenExpired,
  loginWithBackend,
  refreshAuthSession,
  shouldRefreshToken,
} from "@/lib/auth/api";
import {
  clearSession,
  destroyAuthSession,
  getPortalPath,
  persistSession,
  readRememberMe,
  readSession,
} from "@/lib/auth/storage";
import type { AuthSession, LoginCredentials } from "@/lib/auth/types";
import { resetPortalBootstrap } from "@/lib/bootstrap/portal-bootstrap";
import { toast } from "@/lib/toast";

type AuthState = {
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshInFlight: boolean;
  setSession: (session: AuthSession | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setRefreshInFlight: (inFlight: boolean) => void;
  resolveInitialSession: () => Promise<void>;
  refreshSession: () => Promise<void>;
  expireSession: () => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  establishSession: (session: AuthSession, rememberMe?: boolean) => void;
  logout: () => void;
};

export async function resolveAuthSession(): Promise<AuthSession | null> {
  const current = readSession();
  if (!current) return null;

  if (isTokenExpired(current.refreshExpiresAt)) {
    clearSession();
    return null;
  }

  if (isTokenExpired(current.expiresAt) || shouldRefreshToken(current.expiresAt)) {
    const refreshed = await refreshAuthSession(current);
    persistSession(refreshed, readRememberMe());
    return refreshed;
  }

  return current;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  isLoading: true,
  isAuthenticated: false,
  refreshInFlight: false,

  setSession: (session) => set({ session, isAuthenticated: Boolean(session) }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setRefreshInFlight: (refreshInFlight) => set({ refreshInFlight }),

  resolveInitialSession: async () => {
    try {
      const nextSession = await resolveAuthSession();
      get().setSession(nextSession);
    } catch {
      clearSession();
      get().setSession(null);
    } finally {
      get().setIsLoading(false);
    }
  },

  expireSession: () => {
    clearSession();
    get().setSession(null);
    toast.error("Your session has expired. Please sign in again.");
    window.location.assign("/login");
  },

  refreshSession: async () => {
    if (get().refreshInFlight) return;
    get().setRefreshInFlight(true);

    try {
      const nextSession = await resolveAuthSession();
      get().setSession(nextSession);
      if (!nextSession) {
        get().expireSession();
      }
    } catch {
      clearSession();
      get().setSession(null);
      get().expireSession();
    } finally {
      get().setRefreshInFlight(false);
    }
  },

  establishSession: (nextSession, rememberMe = false) => {
    persistSession(nextSession, rememberMe);
    get().setSession(nextSession);
    window.location.assign(getPortalPath(nextSession.role));
  },

  login: async (credentials) => {
    const nextSession = await loginWithBackend(credentials);
    get().establishSession(nextSession, credentials.rememberMe);
  },

  logout: () => {
    destroyAuthSession();
    resetPortalBootstrap();
    get().setSession(null);
    toast.success("Signed out successfully.");
    window.location.assign("/");
  },
}));
