const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];
const AFFILIATE_CODE_PATTERN = /^[A-Za-z0-9\-_!@#$*]{8}$/;

const PASSWORD_STRENGTH_LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong"] as const;

export function getPasswordStrength(password: string) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length - 1;

  return {
    score: Math.max(0, Math.min(4, score)),
    label: PASSWORD_STRENGTH_LABELS[Math.max(0, Math.min(4, score))],
    checks,
  };
}

export function validateApplicationFile(file: File, imagesOnly = false): string | null {
  const allowedTypes = imagesOnly
    ? ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    : ALLOWED_DOCUMENT_TYPES;
  if (!allowedTypes.includes(file.type)) {
    return imagesOnly
      ? "Logo must be PNG, JPEG, or WebP."
      : "File must be PDF, PNG, JPEG, or WebP.";
  }
  if (file.size > MAX_FILE_BYTES) {
    return "File must be 10 MB or smaller.";
  }
  return null;
}

export function validatePracticeStep(
  practice: import("@/lib/apply/types").PracticeInfo,
): string | null {
  if (!practice.firstName.trim()) return "First name is required.";
  if (!practice.lastName.trim()) return "Last name is required.";
  if (practice.clinicName.trim().length < 2) {
    return "Clinic name must be at least 2 characters.";
  }
  if (!practice.website.trim()) return "Website is required.";
  if (!practice.taxId.trim()) return "Tax ID is required.";
  if (!practice.resellerPermitNumber.trim()) {
    return "Reseller permit number is required.";
  }
  if (!practice.address1.trim()) return "Street address is required.";
  if (!practice.city.trim()) return "City is required.";
  if (!practice.state.trim()) return "State is required.";
  if (!/^\d{5}(-\d{4})?$/.test(practice.zip.trim())) {
    return "Enter a valid ZIP code.";
  }
  if (!practice.phone.trim()) return "Phone is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(practice.email.trim())) {
    return "Enter a valid email address.";
  }
  if (practice.affiliateCode.trim() && !AFFILIATE_CODE_PATTERN.test(practice.affiliateCode.trim())) {
    return "Affiliate code must be exactly 8 characters.";
  }
  return null;
}

export function validateDocumentsStep(
  documents: import("@/lib/apply/types").ApplicationDocuments,
): string | null {
  const permit = documents.resellerPermit;
  if (!permit || permit.status !== "complete" || !permit.file) {
    return "Upload your reseller permit document before continuing.";
  }
  return null;
}

export function validateBankingStep(
  banking: import("@/lib/apply/types").BankingInfo,
): string | null {
  if (!banking.bankName.trim()) return "Bank name is required.";
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
    validateBankingStep(state.banking)
  );
}
