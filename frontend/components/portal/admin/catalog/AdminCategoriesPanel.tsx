"use client";

import { useCallback, useState } from "react";
import { FolderTree, Plus, RefreshCw } from "lucide-react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { createCategory } from "@/lib/admin/inventory/api";
import type { ProductType } from "@/lib/admin/inventory/types";
import { useShallow } from "@/lib/hooks/zustand";
import { useAdminPortalStore } from "@/stores/admin-portal-store";
import { PRODUCT_TYPE_LABELS } from "@/lib/admin/inventory/types";
import { showError, toast } from "@/lib/toast";

const TYPE_BADGE_STYLES: Record<ProductType, string> = {
  peptides: "border-deep-teal/25 bg-deep-teal/10 text-deep-teal",
  pharmacy: "border-coral-blush bg-coral-blush/80 text-deep-teal",
};

export function AdminCategoriesPanel() {
  const { categories, isLoading, refreshCatalog } = useAdminPortalStore(
    useShallow((state) => ({
      categories: state.categories,
      isLoading: state.isLoading,
      refreshCatalog: state.refreshCatalog,
    })),
  );
  const [name, setName] = useState("");
  const [productType, setProductType] = useState<ProductType>("peptides");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadCategories = useCallback(async () => {
    await refreshCatalog(true);
  }, [refreshCatalog]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    if (name.trim().length < 2) {
      toast.error("Category name must be at least 2 characters.");
      return;
    }

    setIsCreating(true);
    try {
      const result = await createCategory({
        name: name.trim(),
        product_type: productType,
        description: description.trim() || undefined,
        sort_order: Number(sortOrder) || 0,
      });
      toast.success(result.message);
      setName("");
      setDescription("");
      setSortOrder("0");
      setShowForm(false);
      await loadCategories();
    } catch (error) {
      showError(error, "Unable to create category.");
    } finally {
      setIsCreating(false);
    }
  }

  const sortedCategories = [...categories].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.name.localeCompare(b.name),
  );

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-deep-teal/25 bg-pure-white shadow-[0_4px_24px_rgba(1,26,36,0.12)]">
      <div className="flex items-center justify-between gap-3 bg-deep-teal px-5 py-4 text-pure-white">
        <div className="flex items-center gap-3">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-pure-white/15"
            aria-hidden="true"
          >
            <FolderTree className="size-4" />
          </div>
          <div>
            <h2 className="font-sans text-lg font-semibold">Categories</h2>
            <p className="text-xs text-pure-white/75">
              {isLoading ? "Loading…" : `${categories.length} in catalog`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowForm((current) => !current)}
            className="inline-flex items-center gap-1.5 rounded-full bg-pure-white/15 px-3 py-1.5 text-xs font-medium hover:bg-pure-white/25"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            {showForm ? "Cancel" : "New"}
          </button>
          <button
            type="button"
            onClick={() => void loadCategories()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-full bg-pure-white/15 px-3 py-1.5 text-xs font-medium hover:bg-pure-white/25 disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {showForm ? (
        <form
          onSubmit={(event) => void handleCreate(event)}
          className="border-b border-deep-teal/10 bg-coral-blush/25 px-5 py-4"
        >
          <p className="font-sans text-[10px] font-medium text-deep-teal">
            New category
          </p>
          <div className="mt-3 grid gap-3">
            <div>
              <label htmlFor="category-name" className={authLabelClassName}>
                Name
              </label>
              <input
                id="category-name"
                required
                minLength={2}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={authInputClassName}
                placeholder="Recovery Peptides"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="category-type" className={authLabelClassName}>
                  Type
                </label>
                <select
                  id="category-type"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value as ProductType)}
                  className={authInputClassName}
                >
                  <option value="peptides">Peptides</option>
                  <option value="pharmacy">Pharmacy</option>
                </select>
              </div>
              <div>
                <label htmlFor="category-sort" className={authLabelClassName}>
                  Sort
                </label>
                <input
                  id="category-sort"
                  type="number"
                  min="0"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className={authInputClassName}
                />
              </div>
            </div>
            <div>
              <label htmlFor="category-description" className={authLabelClassName}>
                Description
              </label>
              <input
                id="category-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={authInputClassName}
                placeholder="Optional"
              />
            </div>
            <button
              type="submit"
              disabled={isCreating}
              className="w-full rounded-full bg-deep-teal py-2 text-sm font-medium text-pure-white hover:opacity-90 disabled:opacity-60"
            >
              {isCreating ? "Creating…" : "Create category"}
            </button>
          </div>
        </form>
      ) : null}

      <div className="max-h-[520px] flex-1 overflow-y-auto">
        {isLoading ? (
          <p className="px-5 py-10 text-center text-sm text-deep-teal/50">Loading categories…</p>
        ) : sortedCategories.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium text-deep-teal/70">No categories yet</p>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="mt-3 text-sm font-medium text-deep-teal hover:underline"
            >
              Create your first category
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-deep-teal/8 p-2">
            {sortedCategories.map((category) => (
              <li
                key={category.id}
                className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-deep-teal/5"
              >
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-deep-teal text-sm font-medium text-pure-white"
                  aria-hidden="true"
                >
                  {category.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium text-deep-teal">{category.name}</p>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${TYPE_BADGE_STYLES[category.product_type]}`}
                    >
                      {PRODUCT_TYPE_LABELS[category.product_type]}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate font-mono text-xs text-deep-teal/45">
                    {category.slug ?? "—"}
                  </p>
                </div>
                {category.sort_order != null ? (
                  <span className="shrink-0 font-mono text-[11px] text-deep-teal/60">
                    #{category.sort_order}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
