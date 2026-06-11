import {
  AUTH_REMEMBER_KEY,
  AUTH_ROLE_COOKIE,
  AUTH_STORAGE_KEY,
  AUTH_TOKEN_COOKIE,
  PENDING_LOGIN_KEY,
  PORTAL_PATHS,
  REMEMBER_TTL_MS,
  RESET_TOKEN_STORAGE_KEY,
  SESSION_TTL_MS,
} from "@/lib/auth/constants";
import type { AuthSession, PendingLogin, UserRole } from "@/lib/auth/types";

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
    const raw = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw) as AuthSession;
    if (!session.accessToken || !session.refreshToken || !session.role || !session.email) {
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

  window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  window.sessionStorage.setItem(AUTH_REMEMBER_KEY, rememberMe ? "1" : "0");

  const maxAge = cookieMaxAge(rememberMe);
  setCookie(AUTH_TOKEN_COOKIE, session.accessToken, maxAge);
  setCookie(AUTH_ROLE_COOKIE, session.role, maxAge);
}

export function readRememberMe(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(AUTH_REMEMBER_KEY) === "1";
}

export function clearSession() {
  if (typeof window === "undefined") return;

  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_REMEMBER_KEY);
  clearCookie(AUTH_TOKEN_COOKIE);
  clearCookie(AUTH_ROLE_COOKIE);
}

/** Clears all client-side auth tokens and related session data (used on sign out). */
export function destroyAuthSession() {
  clearSession();
  clearPendingLogin();
  clearResetToken();
}

export function storePendingLogin(data: PendingLogin) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify(data));
}

export function readPendingLogin(): PendingLogin | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(PENDING_LOGIN_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingLogin;
  } catch {
    clearPendingLogin();
    return null;
  }
}

export function clearPendingLogin() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PENDING_LOGIN_KEY);
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
