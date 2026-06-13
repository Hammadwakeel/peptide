"use client";

import { useState } from "react";
import { REQUEST_PLACEHOLDER } from "@/lib/patient-portal/types";
import type { BrowseProduct } from "@/lib/patient-portal/types";

type RequestFromDoctorModalProps = {
  product: BrowseProduct | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
};

export function RequestFromDoctorModal({
  product,
  open,
  onClose,
  onSubmit,
}: RequestFromDoctorModalProps) {
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!open || !product) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!reason.trim()) return;
    onSubmit(reason.trim());
    setSubmitted(true);
  }

  function handleClose() {
    setReason("");
    setSubmitted(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-deep-teal/40 p-4 sm:items-center">
      <button type="button" aria-label="Close" className="absolute inset-0" onClick={handleClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-lg rounded-[1.5rem] border border-deep-teal/10 bg-pure-white p-6 shadow-xl"
      >
        {submitted ? (
          <>
            <h2 className="font-sans text-xl font-light text-deep-teal">Request sent</h2>
            <p className="mt-3 text-sm leading-relaxed text-deep-teal/65">
              Your request for {product.name} was sent to your physician and is pending review.
              You&apos;ll be notified when it&apos;s approved.
            </p>
            <button type="button" onClick={handleClose} className="mt-6 rounded-full bg-deep-teal px-5 py-2.5 text-sm text-pure-white">
              Done
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="font-sans text-xl font-light text-deep-teal">Request from Doctor</h2>
            <p className="mt-1 text-sm text-deep-teal/55">{product.name}</p>
            <div className="mt-5">
              <label htmlFor="request-reason" className="mb-2 block text-sm font-light text-deep-teal">
                Reason of Request
              </label>
              <textarea
                id="request-reason"
                required
                rows={5}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={REQUEST_PLACEHOLDER}
                className="w-full resize-none rounded-xl border border-deep-teal/15 px-3 py-2 text-sm text-deep-teal outline-none focus:border-pacific-teal"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={handleClose} className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm text-deep-teal">
                Cancel
              </button>
              <button type="submit" className="rounded-full bg-deep-teal px-4 py-2 text-sm font-light text-pure-white hover:bg-pacific-teal">
                Send Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
