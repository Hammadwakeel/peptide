"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { listProducts } from "@/lib/admin/inventory/api";
import type { InventoryProduct } from "@/lib/admin/inventory/types";
import { STOCK_STATUS_LABELS } from "@/lib/admin/inventory/types";
import { showError } from "@/lib/toast";

export function AdminStockOverview() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await listProducts({ page: 1, limit: 100 });
      setProducts(response.products);
    } catch (error) {
      showError(error, "Unable to load stock overview.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-light text-deep-teal">Stock Management</h1>
          <p className="mt-1 text-sm text-deep-teal/55">Adjust inventory levels across the catalog</p>
        </div>
        <button
          type="button"
          onClick={() => void loadProducts()}
          className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm text-deep-teal hover:border-pacific-teal"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase tracking-wide text-deep-teal/45">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Current stock</th>
              <th className="px-4 py-3">Threshold</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-deep-teal/50">
                  Loading stock data…
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-deep-teal/50">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-deep-teal/5">
                  <td className="px-4 py-3 font-medium text-deep-teal">{product.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{product.sku}</td>
                  <td className="px-4 py-3">{product.stock_count}</td>
                  <td className="px-4 py-3">{product.low_stock_threshold}</td>
                  <td className="px-4 py-3">{STOCK_STATUS_LABELS[product.stock_status]}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/portal/admin/products/${product.id}/stock`}
                      className="text-xs text-pacific-teal hover:underline"
                    >
                      Manage stock
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Link href="/portal/admin/catalog" className="text-sm text-pacific-teal hover:underline">
        ← Back to catalog
      </Link>
    </div>
  );
}
