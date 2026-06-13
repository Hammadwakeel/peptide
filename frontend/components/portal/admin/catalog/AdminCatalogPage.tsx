"use client";

import Link from "next/link";
import { PackagePlus, Upload, Warehouse } from "lucide-react";
import { AdminCategoriesPanel } from "@/components/portal/admin/catalog/AdminCategoriesPanel";
import { AdminProductList } from "@/components/portal/admin/products/AdminProductList";

const CATALOG_ACTIONS = [
  {
    href: "/portal/admin/products/new",
    label: "Add Product",
    icon: PackagePlus,
    primary: true,
  },
  {
    href: "/portal/admin/products/import",
    label: "Bulk Import",
    icon: Upload,
    primary: false,
  },
  {
    href: "/portal/admin/catalog/stock",
    label: "Stock Management",
    icon: Warehouse,
    primary: false,
  },
] as const;

export function AdminCatalogPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-2xl border border-deep-teal/20 bg-pure-white px-4 py-2.5 shadow-[0_2px_12px_rgba(1,26,36,0.08)] sm:px-5">
        <h1 className="shrink-0 font-sans text-xl font-light text-deep-teal sm:text-2xl">Catalog</h1>
        <div className="min-w-4 flex-1" aria-hidden="true" />
        <div className="flex flex-wrap items-center justify-end gap-2">
          {CATALOG_ACTIONS.map(({ href, label, icon: Icon, primary }) => (
            <Link
              key={href}
              href={href}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-light transition-colors ${
                primary
                  ? "bg-deep-teal text-pure-white hover:opacity-90"
                  : "border border-deep-teal/25 text-deep-teal hover:bg-deep-teal/5"
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <AdminCategoriesPanel />
        <AdminProductList />
      </div>
    </div>
  );
}
