export const AUTH_TOKEN_COOKIE = "frontier-auth-token";
export const AUTH_ROLE_COOKIE = "frontier-auth-role";
export const AUTH_STORAGE_KEY = "frontier-auth-session";
export const RESET_TOKEN_STORAGE_KEY = "frontier-reset-token";

export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
export const REMEMBER_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

export const PORTAL_PATHS = {
  affiliate: "/portal/affiliate",
  admin: "/portal/admin",
  patient: "/portal/patient",
  doctor: "/portal/doctor",
} as const;

export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/apply",
  "/apply/submitted",
] as const;
