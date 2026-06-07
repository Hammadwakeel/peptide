import {
  AUTH_ROLE_COOKIE,
  AUTH_TOKEN_COOKIE,
  PORTAL_PATHS,
} from "@/lib/auth/constants";
import type { UserRole } from "@/lib/auth/types";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const STATIC_PREFIXES = [
  "/_next",
  "/fonts",
  "/brand",
  "/hero-frames",
  "/favicon.ico",
  "/icon.png",
];

function isStaticAsset(pathname: string) {
  return (
    STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

function portalForRole(role: UserRole) {
  return PORTAL_PATHS[role];
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const role = request.cookies.get(AUTH_ROLE_COOKIE)?.value as UserRole | undefined;
  const isAuthenticated = Boolean(token && role);

  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL(portalForRole(role!), request.url));
  }

  if (isAuthenticated && pathname === "/patient/login") {
    return NextResponse.redirect(new URL(PORTAL_PATHS.patient, request.url));
  }

  if (!isAuthenticated && pathname.startsWith("/portal")) {
    const loginUrl = new URL(
      pathname.startsWith("/portal/patient") ? "/patient/login" : "/login",
      request.url,
    );
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!isAuthenticated && pathname === "/patient/login") {
    return NextResponse.next();
  }

  if (isAuthenticated && role && pathname.startsWith("/portal")) {
    const expectedPortal = PORTAL_PATHS[role];
    if (!pathname.startsWith(expectedPortal)) {
      return NextResponse.redirect(new URL(expectedPortal, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
