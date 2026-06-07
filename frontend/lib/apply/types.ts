export type ApplicationDocumentKey =
  | "deaLicense"
  | "npiCertificate"
  | "stateLicense"
  | "businessRegistration"
  | "clinicLogo";

export type UploadedFileMeta = {
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "idle" | "uploading" | "complete" | "error";
  error?: string;
  file?: File;
};

export type PracticeInfo = {
  clinicName: string;
  npi: string;
  dea: string;
  stateLicense: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  contactName: string;
  email: string;
  password: string;
  confirmPassword: string;
  affiliateCode: string;
};

export type ApplicationDocuments = Record<ApplicationDocumentKey, UploadedFileMeta | null>;

export type BankingInfo = {
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  accountType: "checking" | "savings";
};

export type ApplicationWizardState = {
  practice: PracticeInfo;
  documents: ApplicationDocuments;
  banking: BankingInfo;
  eSignCompleted: boolean;
};

export const INITIAL_PRACTICE: PracticeInfo = {
  clinicName: "",
  npi: "",
  dea: "",
  stateLicense: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  country: "US",
  phone: "",
  contactName: "",
  email: "",
  password: "",
  confirmPassword: "",
  affiliateCode: "",
};

export const INITIAL_DOCUMENTS: ApplicationDocuments = {
  deaLicense: null,
  npiCertificate: null,
  stateLicense: null,
  businessRegistration: null,
  clinicLogo: null,
};

export const INITIAL_BANKING: BankingInfo = {
  bankName: "",
  routingNumber: "",
  accountNumber: "",
  accountType: "checking",
};

export const WIZARD_STEPS = [
  { id: 1, label: "Practice Info", short: "Practice" },
  { id: 2, label: "Licenses & Documents", short: "Documents" },
  { id: 3, label: "Banking Info", short: "Banking" },
  { id: 4, label: "E-Sign & Submit", short: "E-Sign" },
] as const;

export type OrgUserRole = "admin" | "staff" | "associate_provider";

export type OrgUserStatus = "active" | "pending";

export type OrgUser = {
  id: string;
  name: string;
  email: string;
  role: OrgUserRole;
  status: OrgUserStatus;
  accessEnabled: boolean;
};

export type ClinicApplicationSummary = {
  id: string;
  clinic_name: string;
  email: string;
  primary_contact_name: string;
  application_status: string;
};

export type ApplyClinicResponse = {
  status: boolean;
  message: string;
  application: ClinicApplicationSummary;
};

export type UploadedClinicDocument = {
  id: string;
  document_type: string;
  file_url: string;
  status: string;
};

export type UploadDocumentsResponse = {
  status: boolean;
  message: string;
  application: {
    id: string;
    application_status: string;
    logo_url: string | null;
  };
  documents: UploadedClinicDocument[];
};

export const ORG_ROLE_LABELS: Record<OrgUserRole, string> = {
  admin: "Admin",
  staff: "Staff",
  associate_provider: "Associate Provider",
};
