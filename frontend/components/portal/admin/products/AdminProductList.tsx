"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MOCK_PRODUCTS } from "@/lib/products/mock-data";
import {
  PRODUCT_STATUS_LABELS,
  PRODUCT_TYPE_LABELS,
  type Product,
  type ProductStatus,
  type ProductType,
} from "@/lib/products/types";
import { toast } from "@/lib/toast";

type SortKey = "name" | "sku" | "category" | "type" | "stock" | "status" | "price";

export function AdminProductList() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ProductType>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ProductStatus>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products],
  );

  const filteredProducts = useMemo(() => {
    let list = [...products];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    if (typeFilter !== "all") list = list.filter((p) => p.type === typeFilter);
    if (categoryFilter !== "all") list = list.filter((p) => p.category === categoryFilter);
    if (statusFilter !== "all") list = list.filter((p) => p.status === statusFilter);

    list.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortAsc ? av - bv : bv - av;
      }
      return sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return list;
  }, [products, search, typeFilter, categoryFilter, statusFilter, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const SortHeader = ({ label, column }: { label: string; column: SortKey }) => (
    <button
      type="button"
      onClick={() => toggleSort(column)}
      className="inline-flex items-center gap-1 font-medium hover:text-deep-teal"
    >
      {label}
      {sortKey === column ? (sortAsc ? " ↑" : " ↓") : null}
    </button>
  );

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
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)} className="rounded-lg border border-deep-teal/15 px-3 py-2 text-sm">
          <option value="all">All types</option>
          <option value="research">Research</option>
          <option value="pharmacy">Pharmacy</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-lg border border-deep-teal/15 px-3 py-2 text-sm">
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="rounded-lg border border-deep-teal/15 px-3 py-2 text-sm">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase tracking-wide text-deep-teal/45">
            <tr>
              <th className="px-4 py-3"><SortHeader label="Name" column="name" /></th>
              <th className="px-4 py-3"><SortHeader label="SKU" column="sku" /></th>
              <th className="px-4 py-3"><SortHeader label="Category" column="category" /></th>
              <th className="px-4 py-3"><SortHeader label="Type" column="type" /></th>
              <th className="px-4 py-3"><SortHeader label="Stock" column="stock" /></th>
              <th className="px-4 py-3"><SortHeader label="Status" column="status" /></th>
              <th className="px-4 py-3"><SortHeader label="Price" column="price" /></th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-b border-deep-teal/5 last:border-0">
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{product.sku}</td>
                <td className="px-4 py-3">{product.category}</td>
                <td className="px-4 py-3">{PRODUCT_TYPE_LABELS[product.type]}</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">{PRODUCT_STATUS_LABELS[product.status]}</td>
                <td className="px-4 py-3">${product.price}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/portal/admin/products/${product.id}/edit`} className="text-xs font-medium text-pacific-teal hover:underline">Edit</Link>
                    <Link href={`/portal/admin/products/${product.id}/stock`} className="text-xs font-medium text-deep-teal/60 hover:underline">Stock</Link>
                    <button
                      type="button"
                      onClick={() => {
                        setProducts((current) => current.filter((p) => p.id !== product.id));
                        toast.success(`${product.name} removed from catalog.`);
                      }}
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
