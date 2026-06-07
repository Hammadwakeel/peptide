"use client";

import { FileUploadZone } from "@/components/apply/FileUploadZone";
import type { ApplicationDocumentKey, ApplicationDocuments } from "@/lib/apply/types";

const DOCUMENT_FIELDS: {
  key: ApplicationDocumentKey;
  label: string;
  description: string;
}[] = [
  { key: "deaLicense", label: "DEA license", description: "Current DEA registration certificate." },
  { key: "npiCertificate", label: "NPI certificate", description: "NPI verification or CMS documentation." },
  { key: "stateLicense", label: "State license", description: "Active state medical or pharmacy license." },
  { key: "businessRegistration", label: "Business registration", description: "Articles of incorporation or business filing." },
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
          value={value[field.key]}
          onChange={(file) => onChange({ ...value, [field.key]: file })}
        />
      ))}
    </div>
  );
}
