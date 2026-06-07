"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { MOCK_PRODUCTS } from "@/lib/products/mock-data";
import {
  PRODUCT_TYPE_LABELS,
  type ProductType,
} from "@/lib/products/types";

type AddItemsModalProps = {
  open: boolean;
  onClose: () => void;
  excludedIds: Set<string>;
  onAddSelected: (productIds: string[]) => void;
};

export function AddItemsModal({ open, onClose, excludedIds, onAddSelected }: AddItemsModalProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ProductType>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const categories = useMemo(
    () => Array.from(new Set(MOCK_PRODUCTS.map((product) => product.category))).sort(),
    [],
  );

  const catalog = useMemo(() => {
    let list = MOCK_PRODUCTS.filter((product) => !excludedIds.has(product.id));
    const query = search.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query),
      );
    }
    if (typeFilter !== "all") {
      list = list.filter((product) => product.type === typeFilter);
    }
    if (categoryFilter !== "all") {
      list = list.filter((product) => product.category === categoryFilter);
    }
    return list;
  }, [search, typeFilter, categoryFilter, excludedIds]);

  if (!open) return null;

  function toggleSelection(productId: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  function handleAddSelected() {
    onAddSelected(Array.from(selected));
    setSelected(new Set());
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
          <h2 id="add-items-title" className="font-serif text-xl font-light text-deep-teal">
            Add items to My Store
          </h2>
          <p className="mt-1 text-sm text-deep-teal/55">
            Select products from the full catalog. Customers will only see retail prices.
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
            onChange={(e) => setTypeFilter(e.target.value as "all" | ProductType)}
            className="rounded-xl border border-deep-teal/15 px-3 py-2 text-sm"
          >
            <option value="all">All types</option>
            <option value="research">{PRODUCT_TYPE_LABELS.research}</option>
            <option value="pharmacy">{PRODUCT_TYPE_LABELS.pharmacy}</option>
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
          {catalog.length === 0 ? (
            <p className="py-8 text-center text-sm text-deep-teal/50">
              No products match your filters.
            </p>
          ) : (
            <ul className="space-y-2">
              {catalog.map((product) => (
                <li key={product.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-deep-teal/10 p-3 transition-colors hover:bg-deep-teal/[0.02]">
                    <input
                      type="checkbox"
                      checked={selected.has(product.id)}
                      onChange={() => toggleSelection(product.id)}
                      className="size-4 shrink-0 rounded border-deep-teal/20 text-pacific-teal"
                    />
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
                      <Image src={product.images[0]} alt="" fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-deep-teal">{product.name}</p>
                      <p className="text-xs text-deep-teal/50">
                        {product.category} · {PRODUCT_TYPE_LABELS[product.type]} · Clinic $
                        {product.clinicPrice}
                      </p>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-deep-teal/10 px-5 py-4 sm:px-6">
          <p className="text-sm text-deep-teal/55">{selected.size} selected</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm font-medium text-deep-teal"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={selected.size === 0}
              onClick={handleAddSelected}
              className="rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white hover:bg-pacific-teal disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
