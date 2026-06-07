import {
  AUTH_ROLE_COOKIE,
  AUTH_STORAGE_KEY,
  AUTH_TOKEN_COOKIE,
  PORTAL_PATHS,
  REMEMBER_TTL_MS,
  RESET_TOKEN_STORAGE_KEY,
  SESSION_TTL_MS,
} from "@/lib/auth/constants";
import type { AuthSession, UserRole } from "@/lib/auth/types";

function cookieMaxAge(rememberMe: boolean) {
  return rememberMe ? REMEMBER_TTL_MS / 1000 : SESSION_TTL_MS / 1000;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw) as AuthSession;
    if (!session.accessToken || !session.role || session.expiresAt <= Date.now()) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function persistSession(session: AuthSession, rememberMe = false) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

  const maxAge = cookieMaxAge(rememberMe);
  setCookie(AUTH_TOKEN_COOKIE, session.accessToken, maxAge);
  setCookie(AUTH_ROLE_COOKIE, session.role, maxAge);
}

export function clearSession() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  clearCookie(AUTH_TOKEN_COOKIE);
  clearCookie(AUTH_ROLE_COOKIE);
}

export function storeResetToken(token: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(RESET_TOKEN_STORAGE_KEY, token);
}

export function readResetToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(RESET_TOKEN_STORAGE_KEY);
}

export function clearResetToken() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(RESET_TOKEN_STORAGE_KEY);
}

export function getPortalPath(role: UserRole) {
  return PORTAL_PATHS[role];
}
