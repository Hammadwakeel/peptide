import type {
  AdminUser,
  AuditLogEntry,
  ClinicCompliance,
  PendingApplication,
  StaffRole,
} from "@/lib/admin/types";

export const MOCK_PENDING_APPLICATIONS: PendingApplication[] = [
  {
    id: "app-001",
    clinicName: "Summit Regenerative Health",
    npi: "1847293012",
    dea: "FS8829103",
    applicantName: "Dr. Amanda Cole",
    applicantEmail: "a.cole@summitregen.com",
    affiliateAttribution: "Affiliate: Pacific Partners (REF-8821)",
    documents: [
      { label: "NPI verification", url: "#doc-npi-001" },
      { label: "DEA certificate", url: "#doc-dea-001" },
      { label: "State license", url: "#doc-license-001" },
    ],
    submittedAt: "2026-03-04",
    status: "pending",
  },
  {
    id: "app-002",
    clinicName: "Coastal Wellness Clinic",
    npi: "1293847561",
    dea: "BC4412098",
    applicantName: "Dr. James Ortiz",
    applicantEmail: "j.ortiz@coastalwell.com",
    affiliateAttribution: "Direct application",
    documents: [
      { label: "NPI verification", url: "#doc-npi-002" },
      { label: "Provider agreement", url: "#doc-agreement-002" },
    ],
    submittedAt: "2026-03-02",
    status: "pending",
  },
];

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: "usr-001",
    name: "Dr. Rivera",
    email: "doctor@demo.frontierbiomed.com",
    role: "provider",
    status: "active",
    signUpDate: "2025-08-12",
    lastLogin: "2026-03-06",
    phone: "(415) 555-0100",
    linkedClinics: ["Frontier Wellness Clinic"],
    documentStatus: "verified",
  },
  {
    id: "usr-002",
    name: "Sarah Chen",
    email: "patient@demo.frontierbiomed.com",
    role: "patient",
    status: "active",
    signUpDate: "2025-11-05",
    lastLogin: "2026-03-05",
    phone: "(415) 555-0182",
    linkedClinics: ["Frontier Wellness Clinic"],
    documentStatus: "verified",
  },
  {
    id: "usr-003",
    name: "Platform Admin",
    email: "admin@demo.frontierbiomed.com",
    role: "admin",
    status: "active",
    signUpDate: "2025-01-01",
    lastLogin: "2026-03-06",
    phone: "(800) 555-0100",
    linkedClinics: ["Frontier Biomed HQ"],
    documentStatus: "verified",
  },
  {
    id: "usr-004",
    name: "Marcus Webb",
    email: "marcus.webb@email.com",
    role: "patient",
    status: "suspended",
    signUpDate: "2026-01-18",
    lastLogin: "2026-02-20",
    phone: "(628) 555-0199",
    linkedClinics: ["Frontier Wellness Clinic"],
    documentStatus: "pending",
  },
];

export const MOCK_COMPLIANCE: ClinicCompliance[] = [
  {
    id: "clinic-001",
    clinicName: "Frontier Wellness Clinic",
    npiStatus: "verified",
    deaStatus: "verified",
    stateLicenseStatus: "verified",
    providerAgreementStatus: "verified",
    lastVerified: "2026-02-28",
  },
  {
    id: "clinic-002",
    clinicName: "Bay Area Regenerative",
    npiStatus: "verified",
    deaStatus: "pending",
    stateLicenseStatus: "verified",
    providerAgreementStatus: "verified",
    lastVerified: "2026-03-01",
  },
  {
    id: "clinic-003",
    clinicName: "Pacific Peptide Partners",
    npiStatus: "expired",
    deaStatus: "verified",
    stateLicenseStatus: "pending",
    providerAgreementStatus: "verified",
    lastVerified: "2025-12-15",
  },
];

export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: "audit-1",
    timestamp: "2026-03-06T14:22:00",
    actor: "admin@demo.frontierbiomed.com",
    action: "order.refund",
    entity: "ORD-8821",
    before: "paymentStatus: paid",
    after: "paymentStatus: refunded",
  },
  {
    id: "audit-2",
    timestamp: "2026-03-05T09:10:00",
    actor: "admin@demo.frontierbiomed.com",
    action: "user.suspend",
    entity: "usr-004",
    before: "status: active",
    after: "status: suspended",
  },
  {
    id: "audit-3",
    timestamp: "2026-03-04T16:45:00",
    actor: "admin@demo.frontierbiomed.com",
    action: "application.approve",
    entity: "app-historical-001",
    before: "status: pending",
    after: "status: approved",
  },
  {
    id: "audit-4",
    timestamp: "2026-03-03T11:30:00",
    actor: "admin@demo.frontierbiomed.com",
    action: "catalog.product_update",
    entity: "prod-002",
    before: "stock: 12",
    after: "stock: 18",
  },
];

export const MOCK_STAFF_ROLES: StaffRole[] = [
  {
    id: "role-1",
    name: "Super Admin",
    description: "Full platform access",
    permissions: ["approval_queue", "user_management", "catalog_edit", "orders_refund", "payouts_trigger", "reports_view", "compliance_edit", "settings_edit", "audit_view"],
    memberCount: 2,
  },
  {
    id: "role-2",
    name: "Operations",
    description: "Orders, payouts, and compliance",
    permissions: ["orders_refund", "payouts_trigger", "compliance_edit", "audit_view"],
    memberCount: 4,
  },
  {
    id: "role-3",
    name: "Support",
    description: "Read-only reports and user lookup",
    permissions: ["reports_view", "audit_view"],
    memberCount: 6,
  },
];

export const REPORTS_KPIS = {
  gmv: 89420,
  activeClinics: 42,
  totalOrders: 387,
  platformRevenue: 24180,
};

export const REVENUE_PROFIT_TREND = [
  { month: "Oct", revenue: 12400, profit: 3420 },
  { month: "Nov", revenue: 15800, profit: 4100 },
  { month: "Dec", revenue: 18200, profit: 4980 },
  { month: "Jan", revenue: 21400, profit: 5820 },
  { month: "Feb", revenue: 24800, profit: 6640 },
  { month: "Mar", revenue: 16820, profit: 4220 },
];

export const CHANNEL_SPLIT = [
  { name: "Provider clinics", value: 62 },
  { name: "Direct affiliate", value: 23 },
  { name: "Marketplace", value: 15 },
];

export const TOP_PRODUCTS_REPORT = [
  { name: "Semaglutide", profit: 8420 },
  { name: "BPC-157", profit: 5180 },
  { name: "TB-500", profit: 2940 },
  { name: "Cold Chain Kit", profit: 1820 },
];

export const REVENUE_BY_REGION = [
  { region: "California", revenue: 32400 },
  { region: "Texas", revenue: 18200 },
  { region: "Florida", revenue: 14800 },
  { region: "New York", revenue: 12400 },
  { region: "Other", revenue: 11620 },
];
