export type ApplicationDocumentKey =
  | "deaLicense"
  | "npiCertificate"
  | "stateLicense"
  | "businessRegistration";

export type UploadedFileMeta = {
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "idle" | "uploading" | "complete" | "error";
  error?: string;
};

export type PracticeInfo = {
  clinicName: string;
  npi: string;
  dea: string;
  stateLicense: string;
  businessAddress: string;
  phone: string;
  contactName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type ApplicationDocuments = Record<ApplicationDocumentKey, UploadedFileMeta | null>;

export type BankingInfo = {
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  accountType: "checking" | "savings";
  plaidConnected: boolean;
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
  businessAddress: "",
  phone: "",
  contactName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const INITIAL_DOCUMENTS: ApplicationDocuments = {
  deaLicense: null,
  npiCertificate: null,
  stateLicense: null,
  businessRegistration: null,
};

export const INITIAL_BANKING: BankingInfo = {
  bankName: "",
  routingNumber: "",
  accountNumber: "",
  accountType: "checking",
  plaidConnected: false,
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

export const ORG_ROLE_LABELS: Record<OrgUserRole, string> = {
  admin: "Admin",
  staff: "Staff",
  associate_provider: "Associate Provider",
};
