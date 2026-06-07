"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  loginWithBackend,
  refreshAuthSession,
  shouldRefreshToken,
} from "@/lib/auth/api";
import {
  clearSession,
  getPortalPath,
  persistSession,
  readSession,
} from "@/lib/auth/storage";
import type { AuthSession, LoginCredentials, UserRole } from "@/lib/auth/types";
import { toast } from "@/lib/toast";

type AuthContextValue = {
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSession(readSession());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(async () => {
      const current = readSession();
      if (!current || !shouldRefreshToken(current.expiresAt)) return;

      try {
        const refreshed = await refreshAuthSession(current);
        const rememberMe = refreshed.expiresAt - Date.now() > 24 * 60 * 60 * 1000;
        persistSession(refreshed, rememberMe);
        setSession(refreshed);
      } catch {
        clearSession();
        setSession(null);
      }
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const nextSession = await loginWithBackend(credentials);
      persistSession(nextSession, credentials.rememberMe);
      setSession(nextSession);
      router.push(getPortalPath(credentials.role));
    },
    [router],
  );

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    toast.success("Signed out successfully.");
    router.push("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      isAuthenticated: Boolean(session),
      login,
      logout,
    }),
    [session, isLoading, login, logout],
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

export function useRequiredRole(requiredRole: UserRole) {
  const { session, isLoading } = useAuth();
  return {
    session,
    isLoading,
    hasAccess: session?.role === requiredRole,
  };
}
