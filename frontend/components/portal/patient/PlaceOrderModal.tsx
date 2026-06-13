"use client";

import { useMemo, useState } from "react";
import { authInputClassName, authLabelClassName } from "@/components/auth/AuthShell";
import { usePatientPortal } from "@/context/PatientPortalProvider";
import type { BrowseProduct } from "@/lib/patient-portal/types";
import { showError, toast } from "@/lib/toast";

type PlaceOrderModalProps = {
  product: BrowseProduct | null;
  open: boolean;
  onClose: () => void;
};

export function PlaceOrderModal({ product, open, onClose }: PlaceOrderModalProps) {
  const { profile, placeOrder } = usePatientPortal();
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultAddress = useMemo(
    () => profile.shippingAddresses.find((address) => address.isDefault) ?? profile.shippingAddresses[0],
    [profile.shippingAddresses],
  );

  if (!open || !product) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!defaultAddress) {
      toast.error("Add a shipping address in Account Settings before placing an order.");
      return;
    }

    setIsSubmitting(true);
    try {
      await placeOrder({
        items: [{ store_id: product!.id, qty }],
        shipping_address_id: defaultAddress.id,
        notes: notes.trim() || undefined,
      });
      toast.success("Order submitted for physician review.");
      setQty(1);
      setNotes("");
      onClose();
    } catch (error) {
      showError(error, "Unable to place order.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-deep-teal/40 p-4 sm:items-center">
      <button type="button" aria-label="Close" className="absolute inset-0" onClick={onClose} />
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-[1.5rem] border border-deep-teal/10 bg-pure-white shadow-xl"
      >
        <div className="border-b border-deep-teal/10 px-6 py-4">
          <h2 className="font-sans text-xl font-light text-deep-teal">Place order</h2>
          <p className="mt-1 text-sm text-deep-teal/60">{product.name}</p>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className={authLabelClassName}>Quantity</label>
            <input
              type="number"
              min={1}
              max={99}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className={authInputClassName}
            />
          </div>
          <div>
            <label className={authLabelClassName}>Ship to</label>
            {defaultAddress ? (
              <p className="rounded-xl border border-deep-teal/10 bg-deep-teal/[0.02] px-3 py-2 text-sm text-deep-teal/75">
                {defaultAddress.label}: {defaultAddress.line1}, {defaultAddress.city},{" "}
                {defaultAddress.state} {defaultAddress.zip}
              </p>
            ) : (
              <p className="text-sm text-coral-blush">
                No shipping address on file. Add one under Account Settings.
              </p>
            )}
          </div>
          <div>
            <label className={authLabelClassName}>Notes for your physician (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={authInputClassName}
              placeholder="Any instructions or questions…"
            />
          </div>
          <p className="text-sm font-light text-deep-teal">
            Estimated total: ${(product.price * qty).toFixed(2)}
          </p>
        </div>
        <div className="flex gap-2 border-t border-deep-teal/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-deep-teal/15 px-4 py-2 text-sm text-deep-teal"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !defaultAddress || product.stockStatus === "out_of_stock"}
            className="flex-1 rounded-full bg-deep-teal px-4 py-2 text-sm font-light text-pure-white hover:bg-pacific-teal disabled:opacity-60"
          >
            {isSubmitting ? "Submitting…" : "Submit order"}
          </button>
        </div>
      </form>
    </div>
  );
}
