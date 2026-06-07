"use client";

import Link from "next/link";
import { MOCK_PRODUCTS } from "@/lib/products/mock-data";

export function AdminStockOverview() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-light text-deep-teal">Stock Management</h1>
        <p className="mt-1 text-sm text-deep-teal/55">Adjust inventory levels across the catalog</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase tracking-wide text-deep-teal/45">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Current stock</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PRODUCTS.map((product) => (
              <tr key={product.id} className="border-b border-deep-teal/5">
                <td className="px-4 py-3 font-medium text-deep-teal">{product.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{product.sku}</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">
                  <Link href={`/portal/admin/products/${product.id}/stock`} className="text-xs text-pacific-teal hover:underline">
                    Manage stock
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link href="/portal/admin/catalog" className="text-sm text-pacific-teal hover:underline">
        ← Back to catalog
      </Link>
    </div>
  );
}
