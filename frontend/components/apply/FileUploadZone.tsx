"use client";

import { useCallback, useState } from "react";
import type { UploadedFileMeta } from "@/lib/apply/types";
import { validateApplicationFile } from "@/lib/apply/validation";
import { mockUploadFile } from "@/lib/apply/mock-submit";

type FileUploadZoneProps = {
  id: string;
  label: string;
  description: string;
  value: UploadedFileMeta | null;
  onChange: (file: UploadedFileMeta | null) => void;
};

export function FileUploadZone({
  id,
  label,
  description,
  value,
  onChange,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      const error = validateApplicationFile(file);
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

      const meta: UploadedFileMeta = {
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: "uploading",
      };
      onChange(meta);

      await mockUploadFile((progress) => {
        onChange({ ...meta, progress, status: progress >= 100 ? "complete" : "uploading" });
      });

      onChange({ ...meta, progress: 100, status: "complete" });
    },
    [onChange],
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
          accept=".pdf,.png,.jpg,.jpeg,.webp"
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
          {value.status === "uploading" ? (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-deep-teal/10">
              <div
                className="h-full rounded-full bg-pacific-teal transition-all"
                style={{ width: `${value.progress}%` }}
              />
            </div>
          ) : null}
          {value.status === "error" ? (
            <p className="mt-1 text-[11px] text-red-600">{value.error}</p>
          ) : null}
          {value.status === "complete" ? (
            <p className="mt-1 text-[11px] text-pacific-teal">Upload complete</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
