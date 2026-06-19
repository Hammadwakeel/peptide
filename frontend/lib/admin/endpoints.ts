import { IDENTITY_API_URL } from "@/lib/auth/endpoints";

export const ADMIN_ENDPOINTS = {
  applications: `${IDENTITY_API_URL}/admin/applications`,
  applicationReview: (applicationId: string) =>
    `${IDENTITY_API_URL}/admin/applications/${applicationId}`,
  clinics: `${IDENTITY_API_URL}/admin/clinics`,
  patientsByClinic: `${IDENTITY_API_URL}/admin/patients/by-clinic`,
  clinicPatients: (clinicId: string) =>
    `${IDENTITY_API_URL}/admin/clinics/${clinicId}/patients`,
  affiliates: `${IDENTITY_API_URL}/admin/affiliates`,
  affiliateProfitMargin: (affiliateId: string) =>
    `${IDENTITY_API_URL}/admin/affiliates/${affiliateId}/profit-margin`,
  affiliateSubAffiliateLimit: (affiliateId: string) =>
    `${IDENTITY_API_URL}/admin/affiliates/${affiliateId}/sub-affiliate-limit`,
  settings: `${IDENTITY_API_URL}/admin/settings`,
  deleteUser: (userId: string) => `${IDENTITY_API_URL}/admin/users/${userId}`,
  changePatientPassword: (patientId: string) =>
    `${IDENTITY_API_URL}/admin/patients/${patientId}/password`,
} as const;
