export type ApplicationDocumentKey = "resellerPermit" | "clinicLogo";

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
  firstName: string;
  lastName: string;
  clinicName: string;
  website: string;
  taxId: string;
  resellerPermitNumber: string;
  npi: string;
  dea: string;
  stateLicense: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  affiliateCode: string;
};

export type ApplicationDocuments = Record<ApplicationDocumentKey, UploadedFileMeta | null>;

export type BankingInfo = {
  bankName: string;
  accountNumber: string;
  accountType: "checking" | "savings";
};

export type ApplicationWizardState = {
  practice: PracticeInfo;
  documents: ApplicationDocuments;
  banking: BankingInfo;
};

export const INITIAL_PRACTICE: PracticeInfo = {
  firstName: "",
  lastName: "",
  clinicName: "",
  website: "",
  taxId: "",
  resellerPermitNumber: "",
  npi: "",
  dea: "",
  stateLicense: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  email: "",
  affiliateCode: "",
};

export const INITIAL_DOCUMENTS: ApplicationDocuments = {
  resellerPermit: null,
  clinicLogo: null,
};

export const INITIAL_BANKING: BankingInfo = {
  bankName: "",
  accountNumber: "",
  accountType: "checking",
};

export const WIZARD_STEPS = [
  { id: 1, label: "Practice Info", short: "Practice" },
  { id: 2, label: "Documents", short: "Documents" },
  { id: 3, label: "Banking & Submit", short: "Banking" },
] as const;

export type ClinicApplicationSummary = {
  id: string;
  clinic_name: string;
  email: string;
  first_name: string;
  last_name: string;
  application_status: string;
};

export type ApplyClinicResponse = {
  status: boolean;
  message: string;
  application: ClinicApplicationSummary;
  affiliate_referral?: {
    referring_affiliate_id: string;
    main_affiliate_id: string;
    referral_code: string;
    status: string;
  };
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

export function formatApplicantName(application: Pick<ClinicApplicationSummary, "first_name" | "last_name">) {
  return [application.first_name, application.last_name].filter(Boolean).join(" ");
}
