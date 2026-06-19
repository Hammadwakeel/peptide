import { adminFetch } from "@/lib/admin/client";
import { ADMIN_ENDPOINTS } from "@/lib/admin/endpoints";
import type {
  AdminAffiliate,
  AdminApplication,
  AdminClinic,
  AdminClinicPatient,
  AdminPagination,
  ChangePatientPasswordPayload,
  CreateAffiliatePayload,
  UpdateAffiliateProfitMarginPayload,
  UpdateAffiliateSubAffiliateLimitPayload,
  PaginatedAffiliatesResponse,
  PaginatedApplicationsResponse,
  PaginatedClinicsResponse,
  PaginatedPatientsResponse,
  PlatformSettingsResponse,
  ReviewApplicationPayload,
  ReviewApplicationResponse,
  UpdatePlatformSettingsPayload,
  UpdatePlatformSettingsResponse,
} from "@/lib/admin/types";

type ListParams = {
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

export async function listApplications(
  params: ListParams & { status?: string } = {},
): Promise<PaginatedApplicationsResponse> {
  return adminFetch<PaginatedApplicationsResponse>(
    `${ADMIN_ENDPOINTS.applications}${buildQuery(params)}`,
  );
}

export async function reviewApplication(
  applicationId: string,
  body: ReviewApplicationPayload,
): Promise<ReviewApplicationResponse> {
  return adminFetch<ReviewApplicationResponse>(
    ADMIN_ENDPOINTS.applicationReview(applicationId),
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
  );
}

export async function listClinics(
  params: ListParams = {},
): Promise<PaginatedClinicsResponse> {
  return adminFetch<PaginatedClinicsResponse>(
    `${ADMIN_ENDPOINTS.clinics}${buildQuery(params)}`,
  );
}

export async function listClinicPatients(
  clinicId: string,
  params: ListParams = {},
): Promise<PaginatedPatientsResponse> {
  return adminFetch<PaginatedPatientsResponse>(
    `${ADMIN_ENDPOINTS.clinicPatients(clinicId)}${buildQuery(params)}`,
  );
}

export async function listPatientsByClinicBulk(limitPerClinic = 100): Promise<{
  status: boolean;
  patients_by_clinic: Record<string, AdminClinicPatient[]>;
  clinic_count: number;
  total_patients: number;
  limit_per_clinic: number;
}> {
  return adminFetch(
    `${ADMIN_ENDPOINTS.patientsByClinic}${buildQuery({ limit_per_clinic: limitPerClinic })}`,
  );
}

export async function listAffiliates(
  params: ListParams = {},
): Promise<PaginatedAffiliatesResponse> {
  return adminFetch<PaginatedAffiliatesResponse>(
    `${ADMIN_ENDPOINTS.affiliates}${buildQuery(params)}`,
  );
}

export async function createAffiliate(body: CreateAffiliatePayload) {
  return adminFetch<{
    status: boolean;
    message: string;
    affiliate: Pick<
      AdminAffiliate,
      "id" | "email" | "affiliate_code" | "affiliate_type"
    >;
    email_sent_to: string;
  }>(ADMIN_ENDPOINTS.affiliates, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAffiliateProfitMargin(
  affiliateId: string,
  body: UpdateAffiliateProfitMarginPayload,
) {
  return adminFetch<{
    status: boolean;
    message: string;
    affiliate: Pick<
      AdminAffiliate,
      | "id"
      | "email"
      | "affiliate_code"
      | "affiliate_type"
      | "profit_margin_percent"
      | "status"
    >;
    sub_affiliates_updated: number;
  }>(ADMIN_ENDPOINTS.affiliateProfitMargin(affiliateId), {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function updateAffiliateSubAffiliateLimit(
  affiliateId: string,
  body: UpdateAffiliateSubAffiliateLimitPayload,
) {
  return adminFetch<{
    status: boolean;
    message: string;
    affiliate: Pick<
      AdminAffiliate,
      | "id"
      | "email"
      | "affiliate_code"
      | "affiliate_type"
      | "max_sub_affiliates"
      | "status"
    >;
  }>(ADMIN_ENDPOINTS.affiliateSubAffiliateLimit(affiliateId), {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function getPlatformSettings() {
  return adminFetch<PlatformSettingsResponse>(ADMIN_ENDPOINTS.settings);
}

export async function updatePlatformSettings(body: UpdatePlatformSettingsPayload) {
  return adminFetch<UpdatePlatformSettingsResponse>(ADMIN_ENDPOINTS.settings, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteUser(userId: string) {
  return adminFetch<{ status: boolean; message: string; user_id: string }>(
    ADMIN_ENDPOINTS.deleteUser(userId),
    { method: "DELETE" },
  );
}

export async function changePatientPassword(
  patientId: string,
  body: ChangePatientPasswordPayload,
) {
  return adminFetch<{
    status: boolean;
    message: string;
    patient_id: string;
    email: string;
  }>(ADMIN_ENDPOINTS.changePatientPassword(patientId), {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export type { AdminPagination };
