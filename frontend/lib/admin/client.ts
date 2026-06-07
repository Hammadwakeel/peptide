import {
  isTokenExpired,
  refreshAuthSession,
  shouldRefreshToken,
} from "@/lib/auth/api";
import { readRememberMe, readSession, persistSession } from "@/lib/auth/storage";

function parseApiError(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const record = payload as { detail?: unknown; message?: unknown };
  if (typeof record.detail === "string") return record.detail;
  if (Array.isArray(record.detail) && record.detail[0]?.msg) {
    return String(record.detail[0].msg);
  }
  if (typeof record.message === "string") return record.message;
  return fallback;
}

async function getAccessToken(): Promise<string> {
  let session = readSession();
  if (!session) {
    throw new Error("Not authenticated.");
  }

  if (isTokenExpired(session.refreshExpiresAt)) {
    throw new Error("Session expired. Please sign in again.");
  }

  if (shouldRefreshToken(session.expiresAt) || isTokenExpired(session.expiresAt)) {
    session = await refreshAuthSession(session);
    persistSession(session, readRememberMe());
  }

  return session.accessToken;
}

export async function adminFetch<T>(
  input: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken();
  const isFormData = options.body instanceof FormData;

  const response = await fetch(input, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseApiError(payload, "Request failed."));
  }

  return payload as T;
}

export { parseApiError };
