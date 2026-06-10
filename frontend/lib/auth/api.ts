import { AUTH_ENDPOINTS } from "@/lib/auth/endpoints";
import { REFRESH_THRESHOLD_MS } from "@/lib/auth/constants";
import type {
  AuthSession,
  CreateAdminPayload,
  CreateAdminResponse,
  ForgotPasswordPayload,
  LoginCredentials,
  ResetPasswordPayload,
  SendOtpResponse,
  UserRole,
  VerifyOtpResponse,
} from "@/lib/auth/types";

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

function isOtpRequiredResponse(payload: LoginResponse): boolean {
  if (payload.status !== false) return false;
  const message = (payload.message ?? "").toLowerCase();
  return message.includes("otp") || payload.email_verified === false;
}

type RefreshResponse = {
  status: boolean;
  token?: string;
  refresh_token?: string;
};

export class OtpRequiredError extends Error {
  readonly email: string;

  constructor(email: string) {
    super("OTP verification required");
    this.name = "OtpRequiredError";
    this.email = email;
  }
}

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

export function getTokenExpiryMs(token: string): number {
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

export function isTokenExpired(expiresAt: number) {
  return expiresAt <= Date.now();
}

function mapBackendRole(role: string): UserRole {
  const normalized = role.toLowerCase();
  if (normalized === "clinic_owner" || normalized === "clinic_staff") return "doctor";
  if (normalized === "admin" || normalized === "super_admin") return "admin";
  if (normalized === "affiliate") return "affiliate";
  if (normalized === "patient") return "patient";
  throw new Error(`Unsupported account role: ${role}`);
}

function toAuthSession(
  accessToken: string,
  refreshToken: string,
  email: string,
  userId: string,
  backendRole: string,
  requestedRole?: UserRole,
): AuthSession {
  const role = mapBackendRole(backendRole);
  if (requestedRole && role !== requestedRole) {
    throw new Error(
      `Select the "${role.charAt(0).toUpperCase()}${role.slice(1)}" role for this account.`,
    );
  }

  return {
    accessToken,
    refreshToken,
    expiresAt: getTokenExpiryMs(accessToken),
    refreshExpiresAt: getTokenExpiryMs(refreshToken),
    role,
    email: email.trim().toLowerCase(),
    userId,
  };
}

export async function createAdmin(
  payload: CreateAdminPayload,
): Promise<CreateAdminResponse> {
  const response = await fetch(AUTH_ENDPOINTS.createAdmin, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email.trim(),
      password: payload.password,
    }),
  });

  const body = (await response.json().catch(() => null)) as CreateAdminResponse | null;
  if (!response.ok || !body?.status) {
    throw new Error(parseApiError(body, "Unable to create admin account."));
  }

  return body;
}

export async function loginWithBackend(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  const email = credentials.email.trim();
  const password = credentials.password.trim();

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const response = await fetch(AUTH_ENDPOINTS.login, {
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

  if (isOtpRequiredResponse(payload)) {
    throw new OtpRequiredError(email);
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
    payload.user.id,
    payload.user.role,
    credentials.role,
  );
}

export async function refreshAuthSession(session: AuthSession): Promise<AuthSession> {
  if (isTokenExpired(session.refreshExpiresAt)) {
    throw new Error("Session expired. Please sign in again.");
  }

  const response = await fetch(AUTH_ENDPOINTS.refreshToken, {
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
    refreshExpiresAt: getTokenExpiryMs(payload.refresh_token),
  };
}

export async function sendOtp(email: string): Promise<SendOtpResponse> {
  const response = await fetch(AUTH_ENDPOINTS.sendOtp, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() }),
  });

  const payload = (await response.json().catch(() => null)) as SendOtpResponse | null;
  if (!response.ok || !payload?.status) {
    throw new Error(parseApiError(payload, "Unable to send verification code."));
  }

  return payload;
}

export async function verifyOtp(
  email: string,
  otp: string,
  requestedRole?: UserRole,
): Promise<{ session: AuthSession; message: string }> {
  const response = await fetch(AUTH_ENDPOINTS.verifyOtp, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
  });

  const payload = (await response.json().catch(() => null)) as VerifyOtpResponse | null;
  if (!response.ok || !payload?.status) {
    throw new Error(parseApiError(payload, "Invalid or expired verification code."));
  }

  if (!payload.token || !payload.refresh_token || !payload.user) {
    throw new Error("Invalid response from authentication service.");
  }

  const session = toAuthSession(
    payload.token,
    payload.refresh_token,
    payload.user.email,
    payload.user.id,
    payload.user.role,
    requestedRole,
  );

  return { session, message: payload.message };
}

/** @deprecated Use sendOtp */
export const sendPatientOtp = async (email: string) => {
  await sendOtp(email);
};

/** @deprecated Use verifyOtp — returns session on success */
export const verifyPatientOtp = async (
  email: string,
  otp: string,
  role: UserRole = "patient",
) => {
  await verifyOtp(email, otp, role);
};

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
