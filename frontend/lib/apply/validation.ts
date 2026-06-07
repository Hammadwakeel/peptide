const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

export function validateApplicationFile(file: File, imagesOnly = false): string | null {
  const allowedTypes = imagesOnly
    ? ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    : ALLOWED_TYPES;
  if (!allowedTypes.includes(file.type)) {
    return imagesOnly
      ? "Logo must be PNG, JPEG, or WebP."
      : "File must be PDF, PNG, or JPEG.";
  }
  if (file.size > MAX_FILE_BYTES) {
    return "File must be 10 MB or smaller.";
  }
  return null;
}

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Weak" | "Fair" | "Good" | "Strong" | "Very strong";
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
};

export function getPasswordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const passed = Object.values(checks).filter(Boolean).length;

  if (passed <= 1) {
    return { score: 0, label: "Weak", checks };
  }
  if (passed === 2) {
    return { score: 1, label: "Fair", checks };
  }
  if (passed === 3) {
    return { score: 2, label: "Good", checks };
  }
  if (passed === 4) {
    return { score: 3, label: "Strong", checks };
  }
  return { score: 4, label: "Very strong", checks };
}

export function validatePracticeStep(
  practice: import("@/lib/apply/types").PracticeInfo,
): string | null {
  if (practice.clinicName.trim().length < 2) return "Clinic name must be at least 2 characters.";
  if (!practice.npi.trim()) return "NPI number is required.";
  if (!practice.dea.trim()) return "DEA number is required.";
  if (!practice.stateLicense.trim()) return "State license number is required.";
  if (!practice.address1.trim()) return "Street address is required.";
  if (!practice.city.trim()) return "City is required.";
  if (!practice.state.trim()) return "State is required.";
  if (!/^\d{5}(-\d{4})?$/.test(practice.zip.trim())) {
    return "Enter a valid ZIP code.";
  }
  if (!practice.phone.trim()) return "Phone is required.";
  if (!practice.contactName.trim()) return "Primary contact name is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(practice.email.trim())) {
    return "Enter a valid email address.";
  }
  if (practice.password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (getPasswordStrength(practice.password).score < 2) {
    return "Choose a stronger password.";
  }
  if (practice.password !== practice.confirmPassword) {
    return "Passwords do not match.";
  }
  return null;
}

const REQUIRED_DOCUMENTS: import("@/lib/apply/types").ApplicationDocumentKey[] = [
  "deaLicense",
  "npiCertificate",
  "stateLicense",
  "businessRegistration",
];

export function validateDocumentsStep(
  documents: import("@/lib/apply/types").ApplicationDocuments,
): string | null {
  for (const key of REQUIRED_DOCUMENTS) {
    const file = documents[key];
    if (!file || file.status !== "complete" || !file.file) {
      return "Upload all required documents before continuing.";
    }
  }
  return null;
}

export function validateBankingStep(
  banking: import("@/lib/apply/types").BankingInfo,
): string | null {
  if (!banking.bankName.trim()) return "Bank name is required.";
  if (!/^\d{9}$/.test(banking.routingNumber.trim())) {
    return "Routing number must be 9 digits.";
  }
  if (banking.accountNumber.trim().length < 4) {
    return "Enter a valid account number.";
  }
  if (banking.accountType !== "checking" && banking.accountType !== "savings") {
    return "Select a valid account type.";
  }
  return null;
}

export function validateApplicationState(
  state: import("@/lib/apply/types").ApplicationWizardState,
): string | null {
  return (
    validatePracticeStep(state.practice) ??
    validateDocumentsStep(state.documents) ??
    validateBankingStep(state.banking) ??
    (!state.eSignCompleted ? "Complete the e-signature before submitting." : null)
  );
}
