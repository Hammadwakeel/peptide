export const IDENTITY_API_URL =
  process.env.NEXT_PUBLIC_IDENTITY_API_URL ??
  process.env.NEXT_PUBLIC_API_IDENTITY_URL ??
  "http://127.0.0.1:8000";

export const AUTH_ENDPOINTS = {
  createAdmin: `${IDENTITY_API_URL}/auth/create-admin`,
  login: `${IDENTITY_API_URL}/auth/login`,
  sendOtp: `${IDENTITY_API_URL}/auth/send-otp`,
  verifyOtp: `${IDENTITY_API_URL}/auth/verify-otp`,
  refreshToken: `${IDENTITY_API_URL}/auth/refresh-token`,
} as const;
