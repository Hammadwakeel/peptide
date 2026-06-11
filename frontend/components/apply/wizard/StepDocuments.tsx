"use client";

import { FileUploadZone } from "@/components/apply/FileUploadZone";
import type { ApplicationDocumentKey, ApplicationDocuments } from "@/lib/apply/types";

const DOCUMENT_FIELDS: {
  key: ApplicationDocumentKey;
  label: string;
  description: string;
  required?: boolean;
}[] = [
  {
    key: "resellerPermit",
    label: "Reseller permit",
    description: "Required for compliance review. PDF or high-quality image.",
    required: true,
  },
  {
    key: "clinicLogo",
    label: "Clinic logo",
    description: "Optional branding for your patient storefront.",
  },
];

type StepDocumentsProps = {
  value: ApplicationDocuments;
  onChange: (value: ApplicationDocuments) => void;
};

export function StepDocuments({ value, onChange }: StepDocumentsProps) {
  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-2">
      {DOCUMENT_FIELDS.map((field) => (
        <FileUploadZone
          key={field.key}
          id={field.key}
          label={field.label}
          description={field.description}
          required={field.required}
          accept={
            field.key === "clinicLogo"
              ? ".png,.jpg,.jpeg,.webp"
              : ".pdf,.png,.jpg,.jpeg,.webp"
          }
          imagesOnly={field.key === "clinicLogo"}
          value={value[field.key]}
          onChange={(file) => onChange({ ...value, [field.key]: file })}
        />
      ))}
    </div>
  );
}
