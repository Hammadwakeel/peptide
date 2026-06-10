import { IDENTITY_API_URL } from "@/lib/auth/endpoints";

export const PATIENT_ENDPOINTS = {
  acceptInvitation: `${IDENTITY_API_URL}/patient/accept-invitation`,
  settings: `${IDENTITY_API_URL}/patient/settings`,
  profile: `${IDENTITY_API_URL}/patient/settings/profile`,
  addresses: `${IDENTITY_API_URL}/patient/settings/addresses`,
  address: (addressId: string) =>
    `${IDENTITY_API_URL}/patient/settings/addresses/${addressId}`,
  addressDefault: (addressId: string) =>
    `${IDENTITY_API_URL}/patient/settings/addresses/${addressId}/default`,
  paymentMethods: `${IDENTITY_API_URL}/patient/settings/payment-methods`,
  paymentMethod: (paymentMethodId: string) =>
    `${IDENTITY_API_URL}/patient/settings/payment-methods/${paymentMethodId}`,
  paymentMethodDefault: (paymentMethodId: string) =>
    `${IDENTITY_API_URL}/patient/settings/payment-methods/${paymentMethodId}/default`,
} as const;
