export type ApprovalStatus = "pending" | "approved" | "rejected" | "more_info";

export type AdminPagination = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
};

export type AdminApplicationDocument = {
  id: string;
  document_type: string;
  file_url: string;
  status: string;
  uploaded_at: string;
};

export type AdminApplication = {
  id: string;
  clinic_name: string;
  email: string;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  npi_number: string | null;
  dea_number: string | null;
  state_license_number: string | null;
  status: string | null;
  application_status: string;
  rejection_reason: string | null;
  admin_note: string | null;
  address: {
    address1: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country: string | null;
  };
  banking: {
    bank_name: string;
    account_type: string;
    routing_last4: string;
    account_last4: string;
  } | null;
  logo_url: string | null;
  documents: AdminApplicationDocument[];
  affiliate: {
    id: string | null;
    affiliate_code: string | null;
    affiliate_type: string | null;
  } | null;
  created_at: string;
};

export type AdminClinic = {
  id: string;
  clinic_name: string;
  email: string;
  phone: string | null;
  npi_number: string | null;
  dea_number: string | null;
  status: string;
  patient_count: number;
  staff_count: number;
  affiliate: {
    id: string | null;
    affiliate_code: string | null;
    affiliate_type: string | null;
  } | null;
  created_at: string;
};

export type AdminClinicPatient = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  status: string;
  has_account: boolean;
  user_id: string | null;
};

export type AdminAffiliate = {
  id: string;
  email: string;
  affiliate_code: string;
  affiliate_type: string;
  status: string;
  profit_margin_percent: number;
  max_sub_affiliates: number | null;
  sub_affiliate_count: number;
  parent_affiliate_code: string | null;
  clinic_referral_count: number;
  created_at: string;
};

export type ReviewApplicationPayload = {
  action: "approve" | "reject" | "request_more_info";
  rejection_reason?: string;
  admin_note?: string;
};

export type CreateAffiliatePayload = {
  email: string;
};

export type UpdateAffiliateProfitMarginPayload = {
  profit_margin_percent: number;
};

export type UpdateAffiliateSubAffiliateLimitPayload = {
  max_sub_affiliates: number | null;
};

export type ChangePatientPasswordPayload = {
  new_password?: string;
  auto_generate?: boolean;
};

export type PaginatedApplicationsResponse = {
  status: boolean;
  applications: AdminApplication[];
  pagination: AdminPagination;
};

export type PaginatedClinicsResponse = {
  status: boolean;
  clinics: AdminClinic[];
  pagination: AdminPagination;
};

export type PaginatedPatientsResponse = {
  status: boolean;
  patients: AdminClinicPatient[];
  clinic: {
    id: string;
    clinic_name: string;
    email: string;
    status: string;
  };
  pagination: AdminPagination;
};

export type PaginatedAffiliatesResponse = {
  status: boolean;
  affiliates: AdminAffiliate[];
  pagination: AdminPagination;
};

export type ReviewApplicationResponse = {
  status: boolean;
  message: string;
  application_id: string;
  application_status: string;
  email_sent_to?: string;
};

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  dea_license: "DEA License",
  npi_certificate: "NPI Certificate",
  state_license: "State License",
  business_registration: "Business Registration",
};

export const REVIEWABLE_APPLICATION_STATUSES = [
  "submitted",
  "docs_signed",
  "pending_review",
  "more_info_requested",
] as const;

export function mapApplicationStatus(status: string): ApprovalStatus {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "more_info_requested") return "more_info";
  return "pending";
}

export function isReviewableApplication(application: AdminApplication) {
  return REVIEWABLE_APPLICATION_STATUSES.includes(
    application.application_status as (typeof REVIEWABLE_APPLICATION_STATUSES)[number],
  );
}

export function formatPrimaryContactName(application: AdminApplication): string | null {
  const parts = [application.first_name, application.last_name].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : null;
}

export type PendingApplication = {
  id: string;
  clinicName: string;
  npi: string;
  dea: string;
  applicantName: string;
  applicantEmail: string;
  affiliateAttribution: string;
  documents: { label: string; url: string }[];
  submittedAt: string;
  status: ApprovalStatus;
  adminNote?: string;
};

export type AdminUserRole = "admin" | "provider" | "patient" | "affiliate" | "staff";

export type AdminUserStatus = "active" | "suspended" | "pending";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  signUpDate: string;
  lastLogin: string;
  phone: string;
  linkedClinics: string[];
  documentStatus: "verified" | "pending" | "expired";
};

export type ComplianceStatus = "verified" | "pending" | "expired" | "missing";

export type ClinicCompliance = {
  id: string;
  clinicName: string;
  npiStatus: ComplianceStatus;
  deaStatus: ComplianceStatus;
  stateLicenseStatus: ComplianceStatus;
  providerAgreementStatus: ComplianceStatus;
  lastVerified: string;
};

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entity: string;
  before: string;
  after: string;
};

export type StaffRole = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  memberCount: number;
};

export const ADMIN_USER_ROLE_LABELS: Record<AdminUserRole, string> = {
  admin: "Admin",
  provider: "Provider",
  patient: "Patient",
  affiliate: "Affiliate",
  staff: "Staff",
};

export const ADMIN_USER_STATUS_LABELS: Record<AdminUserStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  pending: "Pending",
};

export const COMPLIANCE_STATUS_LABELS: Record<ComplianceStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  expired: "Expired",
  missing: "Missing",
};

export const ALL_PERMISSIONS = [
  "approval_queue",
  "user_management",
  "catalog_edit",
  "orders_refund",
  "payouts_trigger",
  "reports_view",
  "compliance_edit",
  "settings_edit",
  "audit_view",
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

export const SETTINGS_TABS = ["Commission & Fees"] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number];

export type PlatformSettings = {
  default_profit_margin_percent: number;
  platform_commission_percent: number;
  affiliate_referral_fee_percent: number;
  payout_frequency: "weekly" | "biweekly" | "monthly";
  minimum_payout_threshold: number;
  default_shipping_rate: number;
  tax_calculation: "auto" | "manual";
  updated_at: string;
};

export type UpdatePlatformSettingsPayload = Partial<
  Pick<
    PlatformSettings,
    | "default_profit_margin_percent"
    | "platform_commission_percent"
    | "affiliate_referral_fee_percent"
    | "payout_frequency"
    | "minimum_payout_threshold"
    | "default_shipping_rate"
    | "tax_calculation"
  >
>;

export type PlatformSettingsResponse = {
  status: boolean;
  settings: PlatformSettings;
};

export type UpdatePlatformSettingsResponse = {
  status: boolean;
  message: string;
  settings: PlatformSettings;
};
