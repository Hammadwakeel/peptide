"use client";

import { FileUploadZone } from "@/components/apply/FileUploadZone";
import type { ApplicationDocumentKey, ApplicationDocuments } from "@/lib/apply/types";

const DOCUMENT_FIELDS: {
  key: ApplicationDocumentKey;
  label: string;
  description: string;
  required?: boolean;
}[] = [
  { key: "deaLicense", label: "DEA license", description: "Current DEA registration certificate.", required: true },
  { key: "npiCertificate", label: "NPI certificate", description: "NPI verification or CMS documentation.", required: true },
  { key: "stateLicense", label: "State license", description: "Active state medical or pharmacy license.", required: true },
  { key: "businessRegistration", label: "Business registration", description: "Articles of incorporation or business filing.", required: true },
  { key: "clinicLogo", label: "Clinic logo (optional)", description: "PNG, JPEG, or WebP logo for your storefront." },
];

type StepDocumentsProps = {
  value: ApplicationDocuments;
  onChange: (value: ApplicationDocuments) => void;
};

export function StepDocuments({ value, onChange }: StepDocumentsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {DOCUMENT_FIELDS.map((field) => (
        <FileUploadZone
          key={field.key}
          id={field.key}
          label={field.label}
          description={field.description}
          required={field.required}
          accept={field.key === "clinicLogo" ? ".png,.jpg,.jpeg,.webp" : ".pdf,.png,.jpg,.jpeg,.webp"}
          imagesOnly={field.key === "clinicLogo"}
          value={value[field.key]}
          onChange={(file) => onChange({ ...value, [field.key]: file })}
        />
      ))}
    </div>
  );
}
