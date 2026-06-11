import { ONBOARDING_ENDPOINTS } from "@/lib/onboarding/endpoints";
import type {
  AcceptClinicInvitationPayload,
  AcceptClinicInvitationResponse,
  CheckSetPasswordResponse,
  SetPasswordPayload,
  SetPasswordResponse,
} from "@/lib/onboarding/types";

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

export async function checkSetPasswordToken(token: string): Promise<CheckSetPasswordResponse> {
  const url = new URL(ONBOARDING_ENDPOINTS.checkSetPassword);
  url.searchParams.set("token", token);

  const response = await fetch(url.toString());
  const payload = (await response.json().catch(() => null)) as CheckSetPasswordResponse | null;

  if (!response.ok || !payload) {
    throw new Error(parseApiError(payload, "Unable to validate this link."));
  }

  return payload;
}

export async function setPassword(payload: SetPasswordPayload): Promise<SetPasswordResponse> {
  const response = await fetch(ONBOARDING_ENDPOINTS.setPassword, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => null)) as SetPasswordResponse | null;
  if (!response.ok || !body?.status) {
    throw new Error(parseApiError(body, "Unable to set password."));
  }

  return body;
}

export async function acceptClinicInvitation(
  payload: AcceptClinicInvitationPayload,
): Promise<AcceptClinicInvitationResponse> {
  const response = await fetch(ONBOARDING_ENDPOINTS.acceptClinicInvitation, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => null)) as AcceptClinicInvitationResponse | null;
  if (!response.ok || !body?.status) {
    throw new Error(parseApiError(body, "Unable to accept invitation."));
  }

  return body;
}
