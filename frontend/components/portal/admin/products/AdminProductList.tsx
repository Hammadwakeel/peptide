"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminProductStockModal } from "@/components/portal/admin/products/AdminProductStockModal";
import { deleteProduct, listCategories, listProducts } from "@/lib/admin/inventory/api";
import {
  PRODUCT_TYPE_LABELS,
  STOCK_STATUS_LABELS,
  type InventoryCategory,
  type InventoryProduct,
  type ProductType,
  type StockStatus,
} from "@/lib/admin/inventory/types";
import { showError, toast } from "@/lib/toast";

export function AdminProductList() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | ProductType>("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<"" | StockStatus>("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [stockProductId, setStockProductId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        listProducts({
          page: 1,
          limit: 100,
          search: search.trim() || undefined,
          product_type: typeFilter || undefined,
          category_id: categoryFilter || undefined,
          stock_status: stockFilter || undefined,
        }),
        listCategories(),
      ]);
      setProducts(productsResponse.products);
      setCategories(categoriesResponse.categories);
    } catch (error) {
      showError(error, "Unable to load products.");
    } finally {
      setIsLoading(false);
    }
  }, [search, typeFilter, categoryFilter, stockFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products],
  );

  async function handleDelete(product: InventoryProduct) {
    if (!window.confirm(`Deactivate ${product.name}?`)) return;

    setDeletingId(product.id);
    try {
      const result = await deleteProduct(product.id);
      toast.success(result.message);
      await loadData();
    } catch (error) {
      showError(error, "Unable to delete product.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full max-w-sm rounded-xl border border-deep-teal/15 px-3 py-2 text-sm outline-none focus:border-pacific-teal"
        />
        <Link
          href="/portal/admin/products/new"
          className="rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white hover:bg-pacific-teal"
        >
          Add product
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          className="rounded-lg border border-deep-teal/15 px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          <option value="peptides">Peptides</option>
          <option value="pharmacy">Pharmacy</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-deep-teal/15 px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as typeof stockFilter)}
          className="rounded-lg border border-deep-teal/15 px-3 py-2 text-sm"
        >
          <option value="">All stock levels</option>
          <option value="in_stock">In stock</option>
          <option value="low">Low stock</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
        <button
          type="button"
          onClick={() => void loadData()}
          className="rounded-lg border border-deep-teal/15 px-3 py-2 text-sm text-deep-teal hover:border-pacific-teal"
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
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Clinic cost</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-deep-teal/50">
                  Loading products…
                </td>
              </tr>
            ) : sortedProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-deep-teal/50">
                  No products found.
                </td>
              </tr>
            ) : (
              sortedProducts.map((product) => (
                <tr key={product.id} className="border-b border-deep-teal/5 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.images[0]?.url ? (
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-deep-teal/10">
                          <Image
                            src={product.images[0].url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="size-10 shrink-0 rounded-lg bg-deep-teal/5" />
                      )}
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{product.sku}</td>
                  <td className="px-4 py-3">{product.category.name ?? "—"}</td>
                  <td className="px-4 py-3">{PRODUCT_TYPE_LABELS[product.product_type]}</td>
                  <td className="px-4 py-3">
                    {product.stock_count} · {STOCK_STATUS_LABELS[product.stock_status]}
                  </td>
                  <td className="px-4 py-3">{product.status}</td>
                  <td className="px-4 py-3">
                    {product.clinic_cost != null ? `$${product.clinic_cost.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/portal/admin/products/${product.id}/edit`}
                        className="text-xs font-medium text-pacific-teal hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setStockProductId(product.id)}
                        className="text-xs font-medium text-deep-teal/60 hover:underline"
                      >
                        Stock
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === product.id}
                        onClick={() => void handleDelete(product)}
                        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                      >
                        {deletingId === product.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {stockProductId ? (
        <AdminProductStockModal
          productId={stockProductId}
          onClose={() => setStockProductId(null)}
          onSaved={() => void loadData()}
        />
      ) : null}
    </div>
  );
}
