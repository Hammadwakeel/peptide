export const AUTH_TOKEN_COOKIE = "frontier-auth-token";
export const AUTH_ROLE_COOKIE = "frontier-auth-role";
export const AUTH_STORAGE_KEY = "frontier-auth-session";
export const AUTH_REMEMBER_KEY = "frontier-auth-remember";
export const PENDING_LOGIN_KEY = "frontier-pending-login";
export const RESET_TOKEN_STORAGE_KEY = "frontier-reset-token";

export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
export const REMEMBER_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;
export const REFRESH_INTERVAL_MS = 60 * 1000;

export const PORTAL_PATHS = {
  affiliate: "/portal/affiliate",
  admin: "/portal/admin",
  patient: "/portal/patient",
  doctor: "/portal/doctor",
} as const;

export const LOGIN_PATHS = {
  affiliate: "/login/affiliate",
  admin: "/login/admin",
  patient: "/login",
  doctor: "/login",
} as const;

export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/login/admin",
  "/login/affiliate",
  "/login/send-otp",
  "/login/verify-otp",
  "/forgot-password",
  "/reset-password",
  "/set-password",
  "/accept-invitation",
  "/accept-clinic-invitation",
  "/apply",
  "/apply/submitted",
] as const;

export function loginPathForRole(role: keyof typeof LOGIN_PATHS) {
  return LOGIN_PATHS[role];
}

export function loginPathForPortalPath(pathname: string) {
  if (pathname.startsWith("/portal/patient")) return "/login?role=patient";
  if (pathname.startsWith("/portal/admin")) return LOGIN_PATHS.admin;
  if (pathname.startsWith("/portal/affiliate")) return LOGIN_PATHS.affiliate;
  return LOGIN_PATHS.doctor;
}

export function isLoginRoute(pathname: string) {
  return (
    pathname === LOGIN_PATHS.doctor ||
    pathname === LOGIN_PATHS.admin ||
    pathname === LOGIN_PATHS.affiliate ||
    pathname === "/login/send-otp" ||
    pathname === "/login/verify-otp"
  );
}
