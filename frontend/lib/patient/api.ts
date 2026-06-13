import { adminFetch } from "@/lib/admin/client";
import { PATIENT_ENDPOINTS } from "@/lib/patient/endpoints";
import type {
  AcceptInvitationPayload,
  AcceptInvitationResponse,
  PatientAddressInput,
  PatientPaymentMethodInput,
  PatientSettingsResponse,
} from "@/lib/patient/types";

export type { AcceptInvitationPayload, AcceptInvitationResponse } from "@/lib/patient/types";
import type { PatientPaymentMethod, PatientProfile, PatientShippingAddress } from "@/lib/patient-portal/types";

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

export function mapAddress(address: {
  id: string;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  zip: string;
  is_default: boolean;
}): PatientShippingAddress {
  return {
    id: address.id,
    label: address.label,
    line1: address.line1,
    line2: address.line2 ?? undefined,
    city: address.city,
    state: address.state,
    zip: address.zip,
    isDefault: address.is_default,
  };
}

export function mapPaymentMethod(method: {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}): PatientPaymentMethod {
  return {
    id: method.id,
    brand: method.brand,
    last4: method.last4,
    expMonth: method.exp_month,
    expYear: method.exp_year,
    isDefault: method.is_default,
  };
}

export function mapSettingsToProfile(
  settings: PatientSettingsResponse["settings"],
): PatientProfile {
  return {
    id: settings.id,
    name: settings.name,
    email: settings.email ?? "",
    phone: settings.phone,
    dateOfBirth: settings.date_of_birth ?? "",
    shippingAddresses: settings.shipping_addresses.map(mapAddress),
    paymentMethods: settings.payment_methods.map(mapPaymentMethod),
    subscriptions: [],
  };
}

export async function acceptInvitation(payload: AcceptInvitationPayload) {
  const response = await fetch(PATIENT_ENDPOINTS.acceptInvitation, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email.trim().toLowerCase(),
      token: payload.token,
      doctor_id: payload.doctor_id,
    }),
  });

  const data = (await response.json().catch(() => null)) as AcceptInvitationResponse | null;
  if (!response.ok || !data?.status) {
    throw new Error(parseApiError(data, "Unable to accept invitation."));
  }
  return data;
}

export async function getPatientSettings() {
  return adminFetch<PatientSettingsResponse>(PATIENT_ENDPOINTS.settings);
}

export async function updatePatientProfile(body: {
  first_name?: string;
  last_name?: string;
  phone?: string;
  dob?: string;
}) {
  return adminFetch<PatientSettingsResponse>(PATIENT_ENDPOINTS.profile, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function listPatientAddresses() {
  return adminFetch<{ status: boolean; addresses: Parameters<typeof mapAddress>[0][] }>(
    PATIENT_ENDPOINTS.addresses,
  );
}

export async function createPatientAddress(body: PatientAddressInput) {
  return adminFetch<{ status: boolean; address: Parameters<typeof mapAddress>[0] }>(
    PATIENT_ENDPOINTS.addresses,
    { method: "POST", body: JSON.stringify(body) },
  );
}

export async function updatePatientAddress(
  addressId: string,
  body: Partial<PatientAddressInput>,
) {
  return adminFetch<{ status: boolean; address: Parameters<typeof mapAddress>[0] }>(
    PATIENT_ENDPOINTS.address(addressId),
    { method: "PUT", body: JSON.stringify(body) },
  );
}

export async function deletePatientAddress(addressId: string) {
  return adminFetch<{ status: boolean; message: string }>(
    PATIENT_ENDPOINTS.address(addressId),
    { method: "DELETE" },
  );
}

export async function setDefaultPatientAddress(addressId: string) {
  return adminFetch<{ status: boolean; address: Parameters<typeof mapAddress>[0] }>(
    PATIENT_ENDPOINTS.addressDefault(addressId),
    { method: "PATCH" },
  );
}

export async function addPatientPaymentMethod(body: PatientPaymentMethodInput) {
  return adminFetch<{
    status: boolean;
    payment_method: Parameters<typeof mapPaymentMethod>[0];
  }>(PATIENT_ENDPOINTS.paymentMethods, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function deletePatientPaymentMethod(paymentMethodId: string) {
  return adminFetch<{ status: boolean; message: string }>(
    PATIENT_ENDPOINTS.paymentMethod(paymentMethodId),
    { method: "DELETE" },
  );
}

export async function setDefaultPatientPaymentMethod(paymentMethodId: string) {
  return adminFetch<{
    status: boolean;
    payment_method: Parameters<typeof mapPaymentMethod>[0];
  }>(PATIENT_ENDPOINTS.paymentMethodDefault(paymentMethodId), {
    method: "PATCH",
  });
}
