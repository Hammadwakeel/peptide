"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ProductGridCard } from "@/components/portal/provider/inventory/ProductGridCard";
import { useProviderPortal } from "@/context/ProviderPortalProvider";
import { listCatalog } from "@/lib/products/api";
import type { CatalogProduct, CatalogProductType } from "@/lib/products/catalog-types";
import {
  CATALOG_PRODUCT_TYPE_LABELS,
  defaultRetailPrice,
} from "@/lib/products/catalog-types";
import { showError, toast } from "@/lib/toast";

type InventoryFilter = "all" | "category" | "favorites" | "stock";
type InventoryView = "grid" | "list";

export function ProviderInventoryBrowser() {
  const { isInMyStore, addToMyStore, removeFromMyStoreByProductId } = useProviderPortal();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [tab, setTab] = useState<CatalogProductType>("ruo");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<InventoryFilter>("all");
  const [view, setView] = useState<InventoryView>("grid");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await listCatalog({
        page: 1,
        limit: 100,
        product_type: tab,
        search: search.trim() || undefined,
      });
      setProducts(response.products);
    } catch (error) {
      showError(error, "Unable to load catalog.");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [tab, search]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(products.map((product) => product.category.name).filter(Boolean) as string[]),
      ).sort(),
    [products],
  );

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (filter === "favorites") {
      list = list.filter((product) => favorites.has(product.id));
    }
    if (filter === "stock") {
      list = list.filter((product) => product.stock_status !== "in_stock");
    }
    if (filter === "category" && category !== "all") {
      list = list.filter((product) => product.category.name === category);
    }
    return list;
  }, [products, filter, favorites, category]);

  async function handleToggleStore(product: CatalogProduct) {
    if (updatingProductId) return;
    setUpdatingProductId(product.id);
    try {
      if (isInMyStore(product.id)) {
        await removeFromMyStoreByProductId(product.id);
        toast.success(`${product.name} removed from My Store.`);
      } else {
        await addToMyStore([
          { productId: product.id, retailPrice: defaultRetailPrice(product.clinic_cost) },
        ]);
        toast.success(`${product.name} added to My Store.`);
      }
    } catch (error) {
      showError(error, "Unable to update My Store.");
    } finally {
      setUpdatingProductId(null);
    }
  }

  function handleExport() {
    const header = ["Name", "SKU", "Category", "Type", "Clinic Cost", "Stock", "Status"];
    const rows = filteredProducts.map((product) => [
      product.name,
      product.sku,
      product.category.name ?? "",
      product.product_type,
      product.clinic_cost ?? "",
      product.stock_count,
      product.stock_status,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `inventory-${tab}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Inventory exported as CSV.");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["ruo", "pharmacy"] as CatalogProductType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTab(type)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                tab === type
                  ? "bg-deep-teal text-pure-white"
                  : "border border-deep-teal/15 text-deep-teal/70"
              }`}
            >
              {CATALOG_PRODUCT_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm font-medium text-deep-teal hover:border-pacific-teal"
        >
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search inventory…"
          className="min-w-[220px] flex-1 rounded-xl border border-deep-teal/15 px-3 py-2 text-sm outline-none focus:border-pacific-teal"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as InventoryFilter)}
          className="rounded-xl border border-deep-teal/15 px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="category">By Category</option>
          <option value="favorites">Favorites</option>
          <option value="stock">Stock Status</option>
        </select>
        {filter === "category" ? (
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-deep-teal/15 px-3 py-2 text-sm">
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        ) : null}
        <div className="flex rounded-xl border border-deep-teal/15 p-1">
          {(["grid", "list"] as InventoryView[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${
                view === mode ? "bg-deep-teal text-pure-white" : "text-deep-teal/60"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => void loadCatalog()}
          className="rounded-xl border border-deep-teal/15 px-3 py-2 text-sm text-deep-teal hover:border-pacific-teal"
        >
          Refresh
        </button>
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-deep-teal/50">Loading catalog…</p>
      ) : filteredProducts.length === 0 ? (
        <p className="py-12 text-center text-sm text-deep-teal/50">No products found.</p>
      ) : (
        <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
          {filteredProducts.map((product) => (
            <ProductGridCard
              key={product.id}
              product={product}
              view={view}
              isFavorite={favorites.has(product.id)}
              inMyStore={isInMyStore(product.id)}
              isStoreUpdating={updatingProductId === product.id}
              onToggleFavorite={() =>
                setFavorites((current) => {
                  const next = new Set(current);
                  if (next.has(product.id)) next.delete(product.id);
                  else next.add(product.id);
                  return next;
                })
              }
              onToggleStore={() => void handleToggleStore(product)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
