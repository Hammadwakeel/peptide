"use client";

import { useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { useOrders } from "@/context/OrdersProvider";
import { toast } from "@/lib/toast";

type RefundModalProps = {
  open: boolean;
  orderId: string;
  orderTotal: number;
  onClose: () => void;
};

export function RefundModal({ open, orderId, orderTotal, onClose }: RefundModalProps) {
  const { applyRefund } = useOrders();
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [amount, setAmount] = useState(String(orderTotal));
  const [reason, setReason] = useState("");

  if (!open) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Enter a valid refund amount.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Enter a refund reason.");
      return;
    }
    applyRefund(orderId, parsed, reason.trim(), refundType === "full");
    toast.success("Refund processed.");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-teal/40 p-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl border border-deep-teal/10 bg-pure-white p-6 shadow-xl">
        <h2 className="font-sans text-xl font-light text-deep-teal">Issue refund</h2>
        <p className="mt-2 rounded-xl border border-coral-blush/50 bg-coral-blush/20 px-3 py-2 text-xs text-deep-teal/70">
          Refunds cannot be undone. Confirm the amount and reason before proceeding.
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <fieldset className="space-y-2">
            <legend className={authLabelClassName}>Refund type</legend>
            <label className="flex items-center gap-2 text-sm text-deep-teal">
              <input
                type="radio"
                name="refund-type"
                checked={refundType === "full"}
                onChange={() => {
                  setRefundType("full");
                  setAmount(String(orderTotal));
                }}
              />
              Full refund (${orderTotal})
            </label>
            <label className="flex items-center gap-2 text-sm text-deep-teal">
              <input
                type="radio"
                name="refund-type"
                checked={refundType === "partial"}
                onChange={() => setRefundType("partial")}
              />
              Partial refund
            </label>
          </fieldset>
          <div>
            <label htmlFor="refund-amount" className={authLabelClassName}>Amount</label>
            <input
              id="refund-amount"
              type="number"
              min="0"
              step="0.01"
              required
              disabled={refundType === "full"}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={authInputClassName}
            />
          </div>
          <div>
            <label htmlFor="refund-reason" className={authLabelClassName}>Reason</label>
            <textarea
              id="refund-reason"
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`${authInputClassName} resize-none`}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm text-deep-teal">
              Cancel
            </button>
            <button type="submit" className="rounded-full bg-coral-blush px-4 py-2 text-sm font-light text-deep-teal hover:bg-coral-blush/80">
              Confirm refund
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
