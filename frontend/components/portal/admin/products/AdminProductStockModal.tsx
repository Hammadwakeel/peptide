"use client";

import { useEffect, useState } from "react";
import { authInputClassName, authLabelClassName } from "@/components/auth/AuthShell";
import { getProduct, updateProductStock } from "@/lib/admin/inventory/api";
import type { InventoryProduct } from "@/lib/admin/inventory/types";
import { STOCK_STATUS_LABELS } from "@/lib/admin/inventory/types";
import { showError, toast } from "@/lib/toast";

export function AdminProductStockModal({
  productId,
  onClose,
  onSaved,
}: {
  productId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [product, setProduct] = useState<InventoryProduct | null>(null);
  const [quantity, setQuantity] = useState("0");
  const [threshold, setThreshold] = useState("10");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      try {
        const response = await getProduct(productId);
        setProduct(response.product);
        setQuantity(String(response.product.stock_count));
        setThreshold(String(response.product.low_stock_threshold));
      } catch (error) {
        showError(error, "Unable to load product stock.");
        onClose();
      } finally {
        setIsLoading(false);
      }
    }

    void loadProduct();
  }, [productId, onClose]);

  async function handleSave() {
    setIsSaving(true);
    try {
      const response = await updateProductStock(productId, {
        stock_count: Number(quantity),
        low_stock_threshold: Number(threshold),
      });
      setProduct(response.product);
      toast.success(response.message ?? "Stock updated.");
      onSaved();
      onClose();
    } catch (error) {
      showError(error, "Unable to update stock.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-deep-teal/40 p-4 sm:items-center">
      <button type="button" aria-label="Close" className="absolute inset-0" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-2xl border border-deep-teal/10 bg-pure-white p-6 shadow-xl"
      >
        <h2 className="font-serif text-xl font-light text-deep-teal">Update stock</h2>
        {isLoading ? (
          <p className="mt-4 text-sm text-deep-teal/60">Loading…</p>
        ) : product ? (
          <>
            <p className="mt-2 text-sm text-deep-teal/60">
              {product.name} · {product.sku}
            </p>
            <p className="mt-1 text-xs text-deep-teal/45">
              Current: {STOCK_STATUS_LABELS[product.stock_status]}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className={authLabelClassName}>Stock count</label>
                <input
                  type="number"
                  min={0}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={authInputClassName}
                />
              </div>
              <div>
                <label className={authLabelClassName}>Low-stock threshold</label>
                <input
                  type="number"
                  min={0}
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className={authInputClassName}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm text-deep-teal"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => void handleSave()}
                className="rounded-full bg-deep-teal px-4 py-2 text-sm text-pure-white disabled:opacity-60"
              >
                {isSaving ? "Saving…" : "Save stock"}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
