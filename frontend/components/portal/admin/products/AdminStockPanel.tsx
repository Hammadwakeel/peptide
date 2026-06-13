"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authInputClassName, authLabelClassName } from "@/components/auth/AuthShell";
import { getProduct, updateProductStock } from "@/lib/admin/inventory/api";
import type { InventoryProduct } from "@/lib/admin/inventory/types";
import { STOCK_STATUS_LABELS } from "@/lib/admin/inventory/types";
import { showError, toast } from "@/lib/toast";

type AdminStockPanelProps = {
  productId: string;
};

export function AdminStockPanel({ productId }: AdminStockPanelProps) {
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
        showError(error, "Unable to load product.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProduct();
  }, [productId]);

  async function handleSave() {
    if (!product) return;

    setIsSaving(true);
    try {
      const response = await updateProductStock(productId, {
        stock_count: Number(quantity),
        low_stock_threshold: Number(threshold),
      });
      setProduct(response.product);
      toast.success(response.message ?? "Stock updated.");
    } catch (error) {
      showError(error, "Unable to update stock.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-deep-teal/60">Loading stock settings…</p>;
  }

  if (!product) {
    return <p className="text-sm text-deep-teal/60">Product not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-deep-teal/10 bg-pure-white p-6 shadow-sm">
        <p className="font-light text-deep-teal">{product.name}</p>
        <p className="mt-1 font-mono text-xs text-deep-teal/50">{product.sku}</p>
        <p className="mt-2 text-sm text-deep-teal/60">
          Current status: {STOCK_STATUS_LABELS[product.stock_status]}
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={authLabelClassName}>Current quantity</label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={authInputClassName}
            />
          </div>
          <div>
            <label className={authLabelClassName}>Low-stock threshold</label>
            <input
              type="number"
              min="0"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className={authInputClassName}
            />
          </div>
        </div>

        <button
          type="button"
          disabled={isSaving}
          onClick={() => void handleSave()}
          className="mt-4 rounded-full bg-deep-teal px-5 py-2.5 text-sm font-light text-pure-white hover:bg-pacific-teal disabled:opacity-60"
        >
          {isSaving ? "Saving…" : "Save stock settings"}
        </button>
      </div>

      <Link href="/portal/admin/catalog" className="text-sm text-pacific-teal hover:underline">
        Back to products
      </Link>
    </div>
  );
}
