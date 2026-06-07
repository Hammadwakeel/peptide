import { adminFetch } from "@/lib/admin/client";
import { DOCTOR_ENDPOINTS } from "@/lib/doctor/endpoints";
import type {
  DoctorPatientsResponse,
  InvitePatientPayload,
  InvitePatientResponse,
} from "@/lib/doctor/types";

type ListPatientsParams = {
  page?: number;
  limit?: number;
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function listDoctorPatients(
  params: ListPatientsParams = {},
): Promise<DoctorPatientsResponse> {
  return adminFetch<DoctorPatientsResponse>(
    `${DOCTOR_ENDPOINTS.patients}${buildQuery(params)}`,
  );
}

export async function invitePatient(
  payload: InvitePatientPayload,
): Promise<InvitePatientResponse> {
  return adminFetch<InvitePatientResponse>(DOCTOR_ENDPOINTS.invitePatient, {
    method: "POST",
    body: JSON.stringify({
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      phone: payload.phone || null,
      dob: payload.dob || null,
    }),
  });
}
