export type ApprovalStatus = "pending" | "approved" | "rejected" | "more_info";

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

export const SETTINGS_TABS = [
  "Commission & Fees",
  "Payout Schedule",
  "Shipping & Tax",
  "Email Templates",
  "Staff Roles & Permissions",
] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number];
