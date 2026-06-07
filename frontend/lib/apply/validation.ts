const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

export function validateApplicationFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "File must be PDF, PNG, or JPEG.";
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
  if (!practice.clinicName.trim()) return "Clinic name is required.";
  if (!practice.npi.trim()) return "NPI number is required.";
  if (!practice.dea.trim()) return "DEA number is required.";
  if (!practice.stateLicense.trim()) return "State license number is required.";
  if (!practice.businessAddress.trim()) return "Business address is required.";
  if (!practice.phone.trim()) return "Phone is required.";
  if (!practice.contactName.trim()) return "Primary contact name is required.";
  if (!practice.email.includes("@")) return "Enter a valid email address.";
  if (getPasswordStrength(practice.password).score < 2) {
    return "Choose a stronger password.";
  }
  if (practice.password !== practice.confirmPassword) {
    return "Passwords do not match.";
  }
  return null;
}

export function validateDocumentsStep(
  documents: import("@/lib/apply/types").ApplicationDocuments,
): string | null {
  const missing = Object.entries(documents).filter(([, file]) => !file || file.status !== "complete");
  if (missing.length > 0) {
    return "Upload all required documents before continuing.";
  }
  return null;
}

export function validateBankingStep(
  banking: import("@/lib/apply/types").BankingInfo,
): string | null {
  if (!banking.plaidConnected) {
    if (!banking.bankName.trim()) return "Bank name is required.";
    if (!/^\d{9}$/.test(banking.routingNumber)) {
      return "Routing number must be 9 digits.";
    }
    if (banking.accountNumber.length < 4) {
      return "Enter a valid account number.";
    }
  }
  return null;
}
