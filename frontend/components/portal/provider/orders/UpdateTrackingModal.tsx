"use client";

import { useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { useOrders } from "@/context/OrdersProvider";
import { CARRIER_OPTIONS, type Carrier } from "@/lib/orders/types";
import { toast } from "@/lib/toast";

type UpdateTrackingModalProps = {
  open: boolean;
  orderId: string;
  onClose: () => void;
};

export function UpdateTrackingModal({ open, orderId, onClose }: UpdateTrackingModalProps) {
  const { updateTracking } = useOrders();
  const [carrier, setCarrier] = useState<Carrier>("FedEx");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippedDate, setShippedDate] = useState(new Date().toISOString().slice(0, 10));

  if (!open) return null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!trackingNumber.trim()) {
      toast.error("Enter a tracking number.");
      return;
    }
    updateTracking(orderId, { carrier, trackingNumber: trackingNumber.trim(), shippedDate });
    toast.success("Tracking updated.");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-teal/40 p-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl border border-deep-teal/10 bg-pure-white p-6 shadow-xl">
        <h2 className="font-sans text-xl font-light text-deep-teal">Update tracking</h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="tracking-carrier" className={authLabelClassName}>Carrier</label>
            <select
              id="tracking-carrier"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value as Carrier)}
              className={authInputClassName}
            >
              {CARRIER_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tracking-number" className={authLabelClassName}>Tracking number</label>
            <input
              id="tracking-number"
              required
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className={authInputClassName}
            />
          </div>
          <div>
            <label htmlFor="shipped-date" className={authLabelClassName}>Shipped date</label>
            <input
              id="shipped-date"
              type="date"
              required
              value={shippedDate}
              onChange={(e) => setShippedDate(e.target.value)}
              className={authInputClassName}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm text-deep-teal">
              Cancel
            </button>
            <button type="submit" className="rounded-full bg-deep-teal px-4 py-2 text-sm font-light text-pure-white hover:bg-pacific-teal">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
