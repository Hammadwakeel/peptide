"use client";

import { useCallback, useEffect, useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { createCategory, listCategories } from "@/lib/admin/inventory/api";
import type { InventoryCategory } from "@/lib/admin/inventory/types";
import { showError, toast } from "@/lib/toast";

export function AdminCategoriesPanel() {
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await listCategories();
      setCategories(response.categories);
    } catch (error) {
      showError(error, "Unable to load categories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

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
        description: description.trim() || undefined,
        sort_order: Number(sortOrder) || 0,
      });
      toast.success(result.message);
      setName("");
      setDescription("");
      setSortOrder("0");
      await loadCategories();
    } catch (error) {
      showError(error, "Unable to create category.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-light text-deep-teal">Categories</h2>
          <p className="mt-1 text-sm text-deep-teal/55">Manage catalog categories used by products</p>
        </div>
        <button
          type="button"
          onClick={() => void loadCategories()}
          className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm text-deep-teal hover:border-pacific-teal"
        >
          Refresh
        </button>
      </div>

      <form onSubmit={(event) => void handleCreate(event)} className="mt-5 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="category-name" className={authLabelClassName}>Category name</label>
          <input
            id="category-name"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={authInputClassName}
          />
        </div>
        <div>
          <label htmlFor="category-sort" className={authLabelClassName}>Sort order</label>
          <input
            id="category-sort"
            type="number"
            min="0"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className={authInputClassName}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="category-description" className={authLabelClassName}>Description (optional)</label>
          <input
            id="category-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={authInputClassName}
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isCreating}
            className="rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white hover:bg-pacific-teal disabled:opacity-60"
          >
            {isCreating ? "Creating…" : "Create category"}
          </button>
        </div>
      </form>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-deep-teal/10 text-xs uppercase tracking-wide text-deep-teal/45">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Slug</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={2} className="px-3 py-6 text-center text-deep-teal/50">
                  Loading categories…
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-3 py-6 text-center text-deep-teal/50">
                  No categories yet.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="border-b border-deep-teal/5">
                  <td className="px-3 py-2 font-medium text-deep-teal">{category.name}</td>
                  <td className="px-3 py-2 text-deep-teal/60">{category.slug ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
