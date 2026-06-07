"use client";

import { useMemo, useState } from "react";
import { ProductGridCard } from "@/components/portal/provider/inventory/ProductGridCard";
import { useProviderPortal } from "@/context/ProviderPortalProvider";
import { MOCK_PRODUCTS, productsToCsv } from "@/lib/products/mock-data";
import {
  getStockStatus,
  PRODUCT_TYPE_LABELS,
  type InventoryFilter,
  type InventoryView,
  type ProductType,
} from "@/lib/products/types";
import { toast } from "@/lib/toast";

export function ProviderInventoryBrowser() {
  const { isInMyStore, addToMyStore, removeFromMyStore } = useProviderPortal();
  const [tab, setTab] = useState<ProductType>("research");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<InventoryFilter>("all");
  const [view, setView] = useState<InventoryView>("grid");
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["prod-001"]));

  const categories = useMemo(
    () => Array.from(new Set(MOCK_PRODUCTS.filter((p) => p.type === tab).map((p) => p.category))),
    [tab],
  );
  const [category, setCategory] = useState("all");

  const products = useMemo(() => {
    let list = MOCK_PRODUCTS.filter((p) => p.type === tab);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    if (filter === "favorites") list = list.filter((p) => favorites.has(p.id));
    if (filter === "stock") {
      list = list.filter((p) => getStockStatus(p) !== "in_stock");
    }
    if (filter === "category" && category !== "all") {
      list = list.filter((p) => p.category === category);
    }
    return list;
  }, [tab, search, filter, favorites, category]);

  function handleExport() {
    const csv = productsToCsv(products);
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
          {(["research", "pharmacy"] as ProductType[]).map((type) => (
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
              {PRODUCT_TYPE_LABELS[type]}
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
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
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
      </div>

      <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
        {products.map((product) => (
          <ProductGridCard
            key={product.id}
            product={product}
            view={view}
            isFavorite={favorites.has(product.id)}
            inMyStore={isInMyStore(product.id)}
            onToggleFavorite={() =>
              setFavorites((current) => {
                const next = new Set(current);
                if (next.has(product.id)) next.delete(product.id);
                else next.add(product.id);
                return next;
              })
            }
            onToggleStore={() => {
              if (isInMyStore(product.id)) {
                removeFromMyStore(product.id);
              } else {
                addToMyStore([product.id]);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
