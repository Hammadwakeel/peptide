import { IDENTITY_API_URL } from "@/lib/auth/endpoints";

export const ACCEPT_INVITATION_URL = `${IDENTITY_API_URL}/patient/accept-invitation`;

export type AcceptInvitationPayload = {
  email: string;
  token: string;
  doctor_id: string;
};

export type AcceptInvitationResponse = {
  status: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    clinic_name: string;
  };
};

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

export async function acceptInvitation(
  payload: AcceptInvitationPayload,
): Promise<AcceptInvitationResponse> {
  const response = await fetch(ACCEPT_INVITATION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email.trim().toLowerCase(),
      token: payload.token,
      doctor_id: payload.doctor_id,
    }),
  });

  const data = (await response.json().catch(() => null)) as
    | AcceptInvitationResponse
    | null;

  if (!response.ok || !data?.status) {
    throw new Error(parseApiError(data, "Unable to accept invitation."));
  }

  return data;
}
