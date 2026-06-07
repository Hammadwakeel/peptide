import { IDENTITY_API_URL } from "@/lib/auth/endpoints";

export const ONBOARDING_ENDPOINTS = {
  apply: `${IDENTITY_API_URL}/onboarding/apply`,
  documents: `${IDENTITY_API_URL}/onboarding/documents`,
} as const;
