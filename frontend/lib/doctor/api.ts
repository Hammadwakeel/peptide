import { adminFetch } from "@/lib/admin/client";
import { DOCTOR_ENDPOINTS } from "@/lib/doctor/endpoints";
import type {
  ClinicMembersResponse,
  ClinicProfileResponse,
  InviteClinicMemberPayload,
  UpdateClinicAddressPayload,
  UpdateClinicBankingPayload,
  UpdateClinicBrandingPayload,
  UpdateClinicMemberPayload,
  UpdateClinicProfilePayload,
  UpdateClinicSettingsPayload,
} from "@/lib/doctor/clinic-types";
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

export async function getClinicProfile(): Promise<ClinicProfileResponse> {
  return adminFetch<ClinicProfileResponse>(DOCTOR_ENDPOINTS.clinicProfile);
}

export async function updateClinicProfile(
  payload: UpdateClinicProfilePayload,
): Promise<ClinicProfileResponse> {
  return adminFetch<ClinicProfileResponse>(DOCTOR_ENDPOINTS.clinicProfile, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateClinicAddress(
  payload: UpdateClinicAddressPayload,
): Promise<ClinicProfileResponse> {
  return adminFetch<ClinicProfileResponse>(DOCTOR_ENDPOINTS.clinicAddress, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateClinicBranding(
  payload: UpdateClinicBrandingPayload,
): Promise<ClinicProfileResponse> {
  return adminFetch<ClinicProfileResponse>(DOCTOR_ENDPOINTS.clinicBranding, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function uploadClinicLogo(file: File): Promise<ClinicProfileResponse> {
  const formData = new FormData();
  formData.append("logo", file);
  return adminFetch<ClinicProfileResponse>(DOCTOR_ENDPOINTS.clinicLogo, {
    method: "POST",
    body: formData,
  });
}

export async function updateClinicBanking(
  payload: UpdateClinicBankingPayload,
): Promise<ClinicProfileResponse> {
  return adminFetch<ClinicProfileResponse>(DOCTOR_ENDPOINTS.clinicBanking, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function updateClinicSettings(
  payload: UpdateClinicSettingsPayload,
): Promise<ClinicProfileResponse> {
  return adminFetch<ClinicProfileResponse>(DOCTOR_ENDPOINTS.clinicSettings, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function listClinicMembers(): Promise<ClinicMembersResponse> {
  return adminFetch<ClinicMembersResponse>(DOCTOR_ENDPOINTS.clinicMembers);
}

export async function inviteClinicMember(
  payload: InviteClinicMemberPayload,
): Promise<{ status: boolean; message: string }> {
  return adminFetch(DOCTOR_ENDPOINTS.inviteClinicMember, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateClinicMember(
  memberId: string,
  payload: UpdateClinicMemberPayload,
): Promise<{ status: boolean; message: string }> {
  return adminFetch(DOCTOR_ENDPOINTS.clinicMember(memberId), {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function removeClinicMember(
  memberId: string,
): Promise<{ status: boolean; message: string }> {
  return adminFetch(DOCTOR_ENDPOINTS.clinicMember(memberId), {
    method: "DELETE",
  });
}

export async function cancelClinicInvitation(
  invitationId: string,
): Promise<{ status: boolean; message: string }> {
  return adminFetch(DOCTOR_ENDPOINTS.clinicInvitation(invitationId), {
    method: "DELETE",
  });
}

export async function listDoctorPatients(
  params: ListPatientsParams = {},
): Promise<DoctorPatientsResponse> {
  return adminFetch<DoctorPatientsResponse>(
    `${DOCTOR_ENDPOINTS.patients}${buildQuery(params)}`,
  );
}

export async function fetchAllDoctorPatients() {
  const limit = 100;
  let page = 1;
  const patients: DoctorPatientsResponse["patients"] = [];

  while (true) {
    const response = await listDoctorPatients({ page, limit });
    patients.push(...response.patients);
    if (!response.pagination.has_next) break;
    page += 1;
  }

  return patients;
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
