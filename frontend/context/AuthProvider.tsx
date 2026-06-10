"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  isTokenExpired,
  loginWithBackend,
  refreshAuthSession,
  shouldRefreshToken,
} from "@/lib/auth/api";
import { REFRESH_INTERVAL_MS } from "@/lib/auth/constants";
import {
  clearSession,
  getPortalPath,
  persistSession,
  readRememberMe,
  readSession,
} from "@/lib/auth/storage";
import type { AuthSession, LoginCredentials } from "@/lib/auth/types";
import { toast } from "@/lib/toast";

type AuthContextValue = {
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  establishSession: (session: AuthSession, rememberMe?: boolean) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function resolveSession(): Promise<AuthSession | null> {
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshInFlight = useRef(false);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    toast.success("Signed out successfully.");
    router.push("/login");
  }, [router]);

  const expireSession = useCallback(() => {
    clearSession();
    setSession(null);
    toast.error("Your session has expired. Please sign in again.");
    router.push("/login");
  }, [router]);

  const refreshSession = useCallback(async () => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;

    try {
      const nextSession = await resolveSession();
      setSession(nextSession);
      if (!nextSession) {
        expireSession();
      }
    } catch {
      clearSession();
      setSession(null);
      expireSession();
    } finally {
      refreshInFlight.current = false;
    }
  }, [expireSession]);

  useEffect(() => {
    resolveSession()
      .then((nextSession) => {
        setSession(nextSession);
      })
      .catch(() => {
        clearSession();
        setSession(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const current = readSession();
      if (!current) return;

      if (isTokenExpired(current.refreshExpiresAt)) {
        expireSession();
        return;
      }

      if (shouldRefreshToken(current.expiresAt) || isTokenExpired(current.expiresAt)) {
        void refreshSession();
      }
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [expireSession, refreshSession]);

  const establishSession = useCallback(
    (nextSession: AuthSession, rememberMe = false) => {
      persistSession(nextSession, rememberMe);
      setSession(nextSession);
      router.push(getPortalPath(nextSession.role));
    },
    [router],
  );

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const nextSession = await loginWithBackend(credentials);
      establishSession(nextSession, credentials.rememberMe);
    },
    [establishSession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      isAuthenticated: Boolean(session),
      login,
      establishSession,
      logout,
    }),
    [session, isLoading, login, establishSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}

export function useRequiredRole(requiredRole: AuthSession["role"]) {
  const { session, isLoading } = useAuth();
  return {
    session,
    isLoading,
    hasAccess: session?.role === requiredRole,
  };
}
