import { REFRESH_THRESHOLD_MS, SESSION_TTL_MS } from "@/lib/auth/constants";
import type {
  AuthSession,
  ForgotPasswordPayload,
  LoginCredentials,
  ResetPasswordPayload,
  UserRole,
} from "@/lib/auth/types";

const MOCK_DELAY_MS = 600;

function wait(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createToken(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function createSession(
  email: string,
  role: UserRole,
  rememberMe: boolean,
): AuthSession {
  const ttl = rememberMe ? 30 * 24 * 60 * 60 * 1000 : SESSION_TTL_MS;

  return {
    accessToken: createToken("access"),
    refreshToken: createToken("refresh"),
    expiresAt: Date.now() + ttl,
    role,
    email: email.trim().toLowerCase(),
  };
}

export async function mockLogin(credentials: LoginCredentials): Promise<AuthSession> {
  await wait();

  const email = credentials.email.trim();
  const password = credentials.password.trim();

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  if (!email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  return createSession(email, credentials.role, credentials.rememberMe);
}

export async function mockForgotPassword(
  payload: ForgotPasswordPayload,
): Promise<{ resetToken: string }> {
  await wait();

  const email = payload.email.trim();
  if (!email || !email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }

  return { resetToken: createToken("reset") };
}

export async function mockResetPassword(payload: ResetPasswordPayload): Promise<void> {
  await wait();

  if (!payload.token) {
    throw new Error("Reset link is invalid or expired.");
  }

  if (payload.password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  if (payload.password !== payload.confirmPassword) {
    throw new Error("Passwords do not match.");
  }
}

export function mockRefreshToken(session: AuthSession): AuthSession {
  return {
    ...session,
    accessToken: createToken("access"),
    refreshToken: createToken("refresh"),
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
}

export function shouldRefreshToken(expiresAt: number) {
  return expiresAt - Date.now() <= REFRESH_THRESHOLD_MS;
}
