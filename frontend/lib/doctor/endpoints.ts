import { IDENTITY_API_URL } from "@/lib/auth/endpoints";

export const DOCTOR_ENDPOINTS = {
  patients: `${IDENTITY_API_URL}/doctor/patients`,
  invitePatient: `${IDENTITY_API_URL}/doctor/patients/invite`,
} as const;
