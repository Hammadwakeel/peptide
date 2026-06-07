"use client";

import { useState } from "react";
import { mockESign } from "@/lib/apply/mock-submit";
import { toast } from "@/lib/toast";

type StepESignProps = {
  completed: boolean;
  onComplete: () => void;
  clinicName: string;
  contactName: string;
};

export function StepESign({ completed, onComplete, clinicName, contactName }: StepESignProps) {
  const [isSigning, setIsSigning] = useState(false);

  async function handleSign() {
    setIsSigning(true);
    const toastId = toast.loading("Opening e-signature…");
    try {
      await mockESign();
      toast.dismiss(toastId);
      toast.success("Document signed successfully.");
      onComplete();
    } catch {
      toast.dismiss(toastId);
      toast.error("E-signature failed. Try again.");
    } finally {
      setIsSigning(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-deep-teal/65">
        Review and sign the Frontier Biomed provider agreement for{" "}
        <span className="font-medium text-deep-teal">{clinicName || "your clinic"}</span>.
      </p>

      <div className="overflow-hidden rounded-xl border border-deep-teal/15 bg-deep-teal/[0.03]">
        <div className="border-b border-deep-teal/10 bg-pure-white px-4 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-pacific-teal">
            DocuSign — Provider Agreement
          </p>
        </div>
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-6 text-center">
          {completed ? (
            <>
              <div className="flex size-12 items-center justify-center rounded-full bg-pacific-teal/10 text-pacific-teal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m5 12 5 5L19 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm font-medium text-deep-teal">Signed by {contactName || "Primary contact"}</p>
              <p className="text-xs text-deep-teal/50">Agreement captured and ready for submission.</p>
            </>
          ) : (
            <>
              <p className="max-w-sm text-sm text-deep-teal/70">
                Embedded e-sign flow placeholder. In production this loads a DocuSign or HelloSign iframe or redirect.
              </p>
              <button
                type="button"
                onClick={() => void handleSign()}
                disabled={isSigning}
                className="rounded-full bg-deep-teal px-5 py-2.5 text-sm font-medium text-pure-white hover:bg-pacific-teal disabled:opacity-60"
              >
                {isSigning ? "Signing…" : "Review & sign document"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
