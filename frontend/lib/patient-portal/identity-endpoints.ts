import { IDENTITY_API_URL } from "@/lib/auth/endpoints";

export const PATIENT_IDENTITY_ENDPOINTS = {
  settings: `${IDENTITY_API_URL}/patient/settings`,
  profile: `${IDENTITY_API_URL}/patient/settings/profile`,
  addresses: `${IDENTITY_API_URL}/patient/settings/addresses`,
  address: (addressId: string) =>
    `${IDENTITY_API_URL}/patient/settings/addresses/${addressId}`,
  addressDefault: (addressId: string) =>
    `${IDENTITY_API_URL}/patient/settings/addresses/${addressId}/default`,
} as const;
