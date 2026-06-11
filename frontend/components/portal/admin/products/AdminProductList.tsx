"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MoreHorizontal, Package, RefreshCw, Search } from "lucide-react";
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

const STOCK_BADGE_STYLES: Record<StockStatus, string> = {
  in_stock: "bg-deep-teal/10 text-deep-teal",
  low: "bg-coral-blush/80 text-deep-teal",
  out_of_stock: "bg-coral-blush text-deep-teal",
};

const TYPE_BADGE_STYLES: Record<ProductType, string> = {
  peptides: "bg-deep-teal/10 text-deep-teal",
  pharmacy: "bg-coral-blush/70 text-deep-teal",
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "text-deep-teal",
  INACTIVE: "text-deep-teal/40",
};

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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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
    setOpenMenuId(null);
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

  const filterClass =
    "rounded-xl border border-deep-teal/15 bg-pure-white px-3 py-2 text-sm text-deep-teal outline-none focus:border-deep-teal";

  return (
    <section className="overflow-hidden rounded-2xl border border-deep-teal/25 bg-pure-white shadow-[0_4px_24px_rgba(1,26,36,0.12)]">
      <div className="bg-deep-teal px-5 py-4 text-pure-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-pure-white/15"
              aria-hidden="true"
            >
              <Package className="size-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-light">Products</h2>
              <p className="text-xs text-pure-white/75">
                {isLoading ? "Loading…" : `${sortedProducts.length} shown`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-full bg-pure-white/15 px-3 py-1.5 text-xs font-medium hover:bg-pure-white/25 disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      <div className="border-b border-deep-teal/10 bg-surface-muted/50 px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-deep-teal/40"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-xl border border-deep-teal/15 bg-pure-white py-2.5 pl-9 pr-3 text-sm text-deep-teal outline-none focus:border-deep-teal"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className={filterClass}
            >
              <option value="">All types</option>
              <option value="peptides">Peptides</option>
              <option value="pharmacy">Pharmacy</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={filterClass}
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
              className={filterClass}
            >
              <option value="">All stock</option>
              <option value="in_stock">In stock</option>
              <option value="low">Low stock</option>
              <option value="out_of_stock">Out of stock</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <p className="px-5 py-16 text-center text-sm text-deep-teal/50">Loading products…</p>
        ) : sortedProducts.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm font-medium text-deep-teal/70">No products found</p>
            <p className="mt-1 text-xs text-deep-teal/45">Try adjusting your filters.</p>
            <Link
              href="/portal/admin/products/new"
              className="mt-4 inline-flex rounded-full bg-deep-teal px-4 py-2 text-xs font-medium text-pure-white hover:opacity-90"
            >
              Add product
            </Link>
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-deep-teal/10 text-[10px] uppercase tracking-[0.18em] text-deep-teal/60">
              <tr>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">SKU</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Category</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Cost</th>
                <th className="px-5 py-3 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-deep-teal/8">
              {sortedProducts.map((product) => (
                <tr key={product.id} className="group transition-colors hover:bg-deep-teal/[0.03]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {product.images[0]?.url ? (
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-deep-teal/15">
                          <Image
                            src={product.images[0].url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="48px"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-deep-teal text-sm font-medium text-pure-white">
                          {product.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-deep-teal">{product.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-medium uppercase tracking-wide ${STATUS_STYLES[product.status] ?? "text-deep-teal/50"}`}
                          >
                            {product.status}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${TYPE_BADGE_STYLES[product.product_type]}`}
                          >
                            {PRODUCT_TYPE_LABELS[product.product_type]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-4 font-mono text-xs text-deep-teal/55 sm:table-cell">
                    {product.sku}
                  </td>
                  <td className="hidden px-4 py-4 text-deep-teal/65 lg:table-cell">
                    {product.category.name ?? "—"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium text-deep-teal">
                        {product.stock_count}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STOCK_BADGE_STYLES[product.stock_status]}`}
                      >
                        {STOCK_STATUS_LABELS[product.stock_status]}
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-4 font-medium text-deep-teal/70 md:table-cell">
                    {product.clinic_cost != null ? `$${product.clinic_cost.toFixed(2)}` : "—"}
                  </td>
                  <td className="relative px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                      className="inline-flex size-8 items-center justify-center rounded-lg text-deep-teal/50 transition-colors hover:bg-deep-teal/10 hover:text-deep-teal"
                      aria-label={`Actions for ${product.name}`}
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                    {openMenuId === product.id ? (
                      <>
                        <button
                          type="button"
                          aria-label="Close menu"
                          className="fixed inset-0 z-10"
                          onClick={() => setOpenMenuId(null)}
                        />
                        <div className="absolute right-5 top-full z-20 mt-1 min-w-[140px] overflow-hidden rounded-xl border border-deep-teal/15 bg-pure-white py-1 shadow-lg">
                          <Link
                            href={`/portal/admin/products/${product.id}/edit`}
                            className="block px-4 py-2 text-left text-sm text-deep-teal hover:bg-deep-teal/5"
                            onClick={() => setOpenMenuId(null)}
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setStockProductId(product.id);
                              setOpenMenuId(null);
                            }}
                            className="block w-full px-4 py-2 text-left text-sm text-deep-teal hover:bg-deep-teal/5"
                          >
                            Stock
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === product.id}
                            onClick={() => void handleDelete(product)}
                            className="block w-full px-4 py-2 text-left text-sm text-deep-teal/60 hover:bg-coral-blush/40 disabled:opacity-50"
                          >
                            {deletingId === product.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {stockProductId ? (
        <AdminProductStockModal
          productId={stockProductId}
          onClose={() => setStockProductId(null)}
          onSaved={() => void loadData()}
        />
      ) : null}
    </section>
  );
}
