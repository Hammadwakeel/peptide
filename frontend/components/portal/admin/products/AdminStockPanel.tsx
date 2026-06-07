"use client";

import Link from "next/link";
import { useState } from "react";
import { authInputClassName, authLabelClassName } from "@/components/auth/AuthShell";
import { getProductById } from "@/lib/products/mock-data";
import { toast } from "@/lib/toast";

type AdminStockPanelProps = {
  productId: string;
};

export function AdminStockPanel({ productId }: AdminStockPanelProps) {
  const product = getProductById(productId);
  const [quantity, setQuantity] = useState(String(product?.stock ?? 0));
  const [threshold, setThreshold] = useState(String(product?.lowStockThreshold ?? 0));

  if (!product) {
    return <p className="text-sm text-deep-teal/60">Product not found.</p>;
  }

  function handleSave() {
    toast.success("Stock settings updated.");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-deep-teal/10 bg-pure-white p-6 shadow-sm">
        <p className="font-medium text-deep-teal">{product.name}</p>
        <p className="mt-1 font-mono text-xs text-deep-teal/50">{product.sku}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={authLabelClassName}>Current quantity</label>
            <input type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} className={authInputClassName} />
          </div>
          <div>
            <label className={authLabelClassName}>Low-stock threshold</label>
            <input type="number" min="0" value={threshold} onChange={(e) => setThreshold(e.target.value)} className={authInputClassName} />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="mt-4 rounded-full bg-deep-teal px-5 py-2.5 text-sm font-medium text-pure-white hover:bg-pacific-teal"
        >
          Save stock settings
        </button>
      </div>

      <div className="rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
        <div className="border-b border-deep-teal/10 px-6 py-4">
          <h3 className="text-sm font-medium text-deep-teal">Stock history</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-deep-teal/10 text-xs uppercase text-deep-teal/45">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Change</th>
                <th className="px-4 py-3 text-left">Quantity</th>
                <th className="px-4 py-3 text-left">Note</th>
              </tr>
            </thead>
            <tbody>
              {product.stockHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-deep-teal/45">
                    No stock history yet.
                  </td>
                </tr>
              ) : (
                product.stockHistory.map((entry) => (
                  <tr key={entry.id} className="border-b border-deep-teal/5">
                    <td className="px-4 py-3">{entry.date}</td>
                    <td className={`px-4 py-3 ${entry.change < 0 ? "text-red-600" : "text-pacific-teal"}`}>
                      {entry.change > 0 ? `+${entry.change}` : entry.change}
                    </td>
                    <td className="px-4 py-3">{entry.quantity}</td>
                    <td className="px-4 py-3 text-deep-teal/65">{entry.note}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Link href="/portal/admin/catalog" className="text-sm text-pacific-teal hover:underline">
        Back to products
      </Link>
    </div>
  );
}
