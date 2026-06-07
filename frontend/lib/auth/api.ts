import { REFRESH_THRESHOLD_MS } from "@/lib/auth/constants";
import type {
  AuthSession,
  ForgotPasswordPayload,
  LoginCredentials,
  ResetPasswordPayload,
  UserRole,
} from "@/lib/auth/types";

const IDENTITY_API_URL =
  process.env.NEXT_PUBLIC_IDENTITY_API_URL ?? "http://localhost:3001";

type LoginResponse = {
  status: boolean;
  token?: string;
  refresh_token?: string;
  message?: string;
  email_verified?: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    email_verified?: boolean;
  };
};

type RefreshResponse = {
  status: boolean;
  token?: string;
  refresh_token?: string;
};

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

function mapBackendRole(role: string): UserRole {
  const normalized = role.toLowerCase();
  if (normalized === "clinic_owner" || normalized === "clinic_staff") return "doctor";
  if (normalized === "admin" || normalized === "super_admin") return "admin";
  if (normalized === "affiliate") return "affiliate";
  if (normalized === "patient") return "patient";
  throw new Error(`Unsupported account role: ${role}`);
}

function getTokenExpiryMs(token: string): number {
  try {
    const payload = token.split(".")[1];
    if (!payload) throw new Error("Invalid token");
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: number };
    if (typeof decoded.exp === "number") return decoded.exp * 1000;
  } catch {
    // fall through
  }
  return Date.now() + 15 * 60 * 1000;
}

function toAuthSession(
  accessToken: string,
  refreshToken: string,
  email: string,
  backendRole: string,
  requestedRole: UserRole,
): AuthSession {
  const role = mapBackendRole(backendRole);
  if (role !== requestedRole) {
    throw new Error(
      `Select the "${role.charAt(0).toUpperCase()}${role.slice(1)}" role for this account.`,
    );
  }

  return {
    accessToken,
    refreshToken,
    expiresAt: getTokenExpiryMs(accessToken),
    role,
    email: email.trim().toLowerCase(),
  };
}

export async function loginWithBackend(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  const email = credentials.email.trim();
  const password = credentials.password.trim();

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const response = await fetch(`${IDENTITY_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: credentials.role,
      email,
      password,
    }),
  });

  const payload = (await response.json().catch(() => null)) as LoginResponse | null;

  if (!response.ok || !payload) {
    throw new Error(parseApiError(payload, "Unable to sign in."));
  }

  if (payload.status === false) {
    throw new Error(payload.message ?? "Additional verification is required.");
  }

  if (!payload.token || !payload.refresh_token || !payload.user) {
    throw new Error("Invalid response from authentication service.");
  }

  return toAuthSession(
    payload.token,
    payload.refresh_token,
    payload.user.email,
    payload.user.role,
    credentials.role,
  );
}

export async function refreshAuthSession(session: AuthSession): Promise<AuthSession> {
  const response = await fetch(`${IDENTITY_API_URL}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: session.refreshToken }),
  });

  const payload = (await response.json().catch(() => null)) as RefreshResponse | null;

  if (!response.ok || !payload?.token || !payload.refresh_token) {
    throw new Error(parseApiError(payload, "Session expired. Please sign in again."));
  }

  return {
    ...session,
    accessToken: payload.token,
    refreshToken: payload.refresh_token,
    expiresAt: getTokenExpiryMs(payload.token),
  };
}

export async function sendPatientOtp(email: string): Promise<void> {
  const response = await fetch(`${IDENTITY_API_URL}/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(parseApiError(payload, "Unable to send verification code."));
  }
}

export async function verifyPatientOtp(email: string, otp: string): Promise<void> {
  const response = await fetch(`${IDENTITY_API_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(parseApiError(payload, "Invalid or expired verification code."));
  }
}

export async function requestPasswordReset(
  _payload: ForgotPasswordPayload,
): Promise<{ resetToken: string }> {
  throw new Error(
    "Password reset is not available through the app yet. Contact your administrator.",
  );
}

export async function resetPassword(_payload: ResetPasswordPayload): Promise<void> {
  throw new Error(
    "Password reset is not available through the app yet. Contact your administrator.",
  );
}

export function shouldRefreshToken(expiresAt: number) {
  return expiresAt - Date.now() <= REFRESH_THRESHOLD_MS;
}
