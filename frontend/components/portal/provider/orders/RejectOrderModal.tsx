"use client";

import { useState } from "react";
import { authInputClassName, authLabelClassName } from "@/components/auth/AuthShell";

type RejectOrderModalProps = {
  open: boolean;
  orderLabel: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
};

export function RejectOrderModal({ open, orderLabel, onClose, onConfirm }: RejectOrderModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (reason.trim().length < 3) return;
    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-deep-teal/40 p-4 sm:items-center">
      <button type="button" aria-label="Close" className="absolute inset-0" onClick={onClose} />
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="relative z-10 w-full max-w-md rounded-[1.5rem] border border-deep-teal/10 bg-pure-white p-6 shadow-xl"
      >
        <h2 className="font-sans text-xl font-light text-deep-teal">Reject order</h2>
        <p className="mt-1 text-sm text-deep-teal/60">{orderLabel}</p>
        <div className="mt-4">
          <label className={authLabelClassName}>Reason</label>
          <textarea
            required
            minLength={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className={authInputClassName}
            placeholder="Explain why this order cannot be approved…"
          />
        </div>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-deep-teal/15 px-4 py-2 text-sm text-deep-teal"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || reason.trim().length < 3}
            className="flex-1 rounded-full bg-coral-blush px-4 py-2 text-sm font-light text-deep-teal disabled:opacity-60"
          >
            {isSubmitting ? "Rejecting…" : "Reject order"}
          </button>
        </div>
      </form>
    </div>
  );
}
