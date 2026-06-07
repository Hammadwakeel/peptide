"use client";

import { useCallback, useState } from "react";
import type { UploadedFileMeta } from "@/lib/apply/types";
import { validateApplicationFile } from "@/lib/apply/validation";

type FileUploadZoneProps = {
  id: string;
  label: string;
  description: string;
  accept?: string;
  required?: boolean;
  imagesOnly?: boolean;
  value: UploadedFileMeta | null;
  onChange: (file: UploadedFileMeta | null) => void;
};

export function FileUploadZone({
  id,
  label,
  description,
  accept = ".pdf,.png,.jpg,.jpeg,.webp",
  required = false,
  imagesOnly = false,
  value,
  onChange,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      const error = validateApplicationFile(file, imagesOnly);
      if (error) {
        onChange({
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: "error",
          error,
        });
        return;
      }

      onChange({
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 100,
        status: "complete",
        file,
      });
    },
    [imagesOnly, onChange],
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void processFile(file);
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-medium text-deep-teal">
        {label}
        {required ? <span className="text-pacific-teal"> *</span> : null}
      </label>
      <p className="text-[11px] text-deep-teal/50">{description}</p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed px-4 py-5 transition-colors ${
          isDragging
            ? "border-pacific-teal bg-pacific-teal/5"
            : "border-deep-teal/15 bg-deep-teal/[0.02]"
        }`}
      >
        <input
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void processFile(file);
          }}
        />
        <label htmlFor={id} className="flex cursor-pointer flex-col items-center gap-2 text-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-pacific-teal">
            <path d="M12 16V8m0 0-3 3m3-3 3 3M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="text-sm font-medium text-deep-teal">
            Drag and drop or <span className="text-pacific-teal">browse</span>
          </span>
          <span className="text-[11px] text-deep-teal/45">PDF, PNG, JPEG — max 10 MB</span>
        </label>
      </div>

      {value ? (
        <div className="rounded-lg border border-deep-teal/10 bg-pure-white px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xs font-medium text-deep-teal">{value.name}</p>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-[11px] text-deep-teal/50 hover:text-deep-teal"
            >
              Remove
            </button>
          </div>
          {value.status === "error" ? (
            <p className="mt-1 text-[11px] text-red-600">{value.error}</p>
          ) : null}
          {value.status === "complete" ? (
            <p className="mt-1 text-[11px] text-pacific-teal">Ready to upload on submit</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
