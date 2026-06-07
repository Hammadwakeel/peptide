"use client";

import Link from "next/link";
import { AdminProductList } from "@/components/portal/admin/products/AdminProductList";

export function AdminCatalogPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light text-deep-teal">Catalog Management</h1>
          <p className="mt-1 text-sm text-deep-teal/55">Full product catalog with admin controls</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/portal/admin/products/new" className="rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white hover:bg-pacific-teal">Add Product</Link>
          <Link href="/portal/admin/products/import" className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm font-medium text-deep-teal">Bulk Import</Link>
          <Link href="/portal/admin/catalog/stock" className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm font-medium text-deep-teal">Stock Management</Link>
        </div>
      </div>
      <AdminProductList />
    </div>
  );
}
