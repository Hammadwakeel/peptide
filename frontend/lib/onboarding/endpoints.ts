import { IDENTITY_API_URL } from "@/lib/auth/endpoints";

export const ONBOARDING_ENDPOINTS = {
  checkSetPassword: `${IDENTITY_API_URL}/auth/set-password`,
  setPassword: `${IDENTITY_API_URL}/auth/set-password`,
  acceptClinicInvitation: `${IDENTITY_API_URL}/auth/accept-clinic-invitation`,
} as const;
