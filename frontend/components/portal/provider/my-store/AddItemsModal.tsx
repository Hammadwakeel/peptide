"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useProviderPortal } from "@/context/ProviderPortalProvider";
import type { CatalogProduct, CatalogProductType } from "@/lib/products/catalog-types";
import {
  CATALOG_PRODUCT_TYPE_LABELS,
  defaultRetailPrice,
  getPrimaryImage,
} from "@/lib/products/catalog-types";
import { TruncateTooltip } from "@/components/ui/Tippy";
import {
  ProductCardNameRow,
  ProductCardStatsRow,
  productStatValue,
} from "@/components/portal/shared/ProductCardLayout";
import { fuseSearch } from "@/lib/search/fuse";
import { CATALOG_PRODUCT_SEARCH_KEYS } from "@/lib/search/keys";

type AddItemsModalProps = {
  open: boolean;
  onClose: () => void;
  excludedIds: Set<string>;
  onAddSelected: (items: { productId: string; retailPrice: number }[]) => void;
};

export function AddItemsModal({ open, onClose, excludedIds, onAddSelected }: AddItemsModalProps) {
  const { fullCatalogProducts, isCatalogLoading } = useProviderPortal();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | CatalogProductType>("");
  const [selected, setSelected] = useState<Map<string, number>>(new Map());
  const [categoryFilter, setCategoryFilter] = useState("all");

  const catalog = useMemo(() => {
    const filtered = fullCatalogProducts.filter((product) => {
      if (excludedIds.has(product.id)) return false;
      if (typeFilter && product.product_type !== typeFilter) return false;
      if (categoryFilter !== "all" && product.category.name !== categoryFilter) return false;
      return true;
    });
    return fuseSearch(filtered, search, CATALOG_PRODUCT_SEARCH_KEYS);
  }, [fullCatalogProducts, excludedIds, search, typeFilter, categoryFilter]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(fullCatalogProducts.map((product) => product.category.name).filter(Boolean) as string[]),
      ).sort(),
    [fullCatalogProducts],
  );

  if (!open) return null;

  function toggleSelection(product: CatalogProduct) {
    setSelected((current) => {
      const next = new Map(current);
      if (next.has(product.id)) next.delete(product.id);
      else next.set(product.id, defaultRetailPrice(product.clinic_cost));
      return next;
    });
  }

  function handleAddSelected() {
    onAddSelected(
      Array.from(selected.entries()).map(([productId, retailPrice]) => ({
        productId,
        retailPrice,
      })),
    );
    setSelected(new Map());
    setSearch("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-deep-teal/40 p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close add items modal"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-items-title"
        className="relative z-10 flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-[1.5rem] border border-deep-teal/10 bg-pure-white shadow-xl"
      >
        <div className="border-b border-deep-teal/10 px-5 py-4 sm:px-6">
          <h2 id="add-items-title" className="font-sans text-xl font-light text-deep-teal">
            Add items to My Store
          </h2>
          <p className="mt-1 text-sm text-deep-teal/55">
            Select products from the master catalog. Default retail price uses a 35% markup on clinic cost.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 border-b border-deep-teal/10 px-5 py-4 sm:px-6">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog…"
            className="min-w-[200px] flex-1 rounded-xl border border-deep-teal/15 px-3 py-2 text-sm outline-none focus:border-pacific-teal"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "" | CatalogProductType)}
            className="rounded-xl border border-deep-teal/15 px-3 py-2 text-sm"
          >
            <option value="">All types</option>
            <option value="peptides">{CATALOG_PRODUCT_TYPE_LABELS.peptides}</option>
            <option value="pharmacy">{CATALOG_PRODUCT_TYPE_LABELS.pharmacy}</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-deep-teal/15 px-3 py-2 text-sm"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {isCatalogLoading && catalog.length === 0 ? (
            <p className="py-8 text-center text-sm text-deep-teal/50">Loading catalog…</p>
          ) : catalog.length === 0 ? (
            <p className="py-8 text-center text-sm text-deep-teal/50">
              No products match your filters.
            </p>
          ) : (
            <ul className="space-y-2">
              {catalog.map((product) => {
                const imageUrl = getPrimaryImage(product) ?? "/brand/product-vial-2x-blend-hero.png";
                const isSelected = selected.has(product.id);
                return (
                  <li key={product.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-deep-teal/10 p-3 transition-colors hover:bg-deep-teal/[0.02]">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(product)}
                        className="size-4 shrink-0 rounded border-deep-teal/20 text-pacific-teal"
                      />
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="48px"
                          unoptimized={imageUrl.startsWith("http")}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <ProductCardNameRow
                          name={
                            <TruncateTooltip content={product.name}>
                              <span className="block truncate">{product.name}</span>
                            </TruncateTooltip>
                          }
                          category={product.category.name ?? "Uncategorized"}
                        />
                        <div className="mt-2">
                          <ProductCardStatsRow
                            left={
                              <>
                                Type: {productStatValue(CATALOG_PRODUCT_TYPE_LABELS[product.product_type])}
                              </>
                            }
                            right={
                              <>
                                Clinic price:{" "}
                                {productStatValue(
                                  product.clinic_cost != null
                                    ? `$${product.clinic_cost.toFixed(2)}`
                                    : "—",
                                )}
                              </>
                            }
                          />
                        </div>
                        {isSelected ? (
                          <div className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3">
                            <span className="text-xs font-light uppercase tracking-wide text-deep-teal/65">
                              Retail price
                            </span>
                            <div className="flex justify-end">
                              <div className="flex w-full max-w-[7.5rem] items-center rounded-lg border border-deep-teal/20 bg-surface-muted/30 px-2 py-1">
                                <span className="text-xs font-light text-deep-teal/70">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={selected.get(product.id) ?? 0}
                                  onChange={(e) =>
                                    setSelected((current) => {
                                      const next = new Map(current);
                                      next.set(product.id, Number(e.target.value));
                                      return next;
                                    })
                                  }
                                  className="w-full bg-transparent pl-1 text-xs font-light text-deep-teal outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-deep-teal/10 px-5 py-4 sm:px-6">
          <p className="text-sm text-deep-teal/55">{selected.size} selected</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm font-light text-deep-teal"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selected.size === 0}
              onClick={handleAddSelected}
              className="rounded-full bg-deep-teal px-4 py-2 text-sm font-light text-pure-white hover:bg-pacific-teal disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
