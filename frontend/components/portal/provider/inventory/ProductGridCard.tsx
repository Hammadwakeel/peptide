"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product, StockStatus } from "@/lib/products/types";
import { STOCK_STATUS_LABELS } from "@/lib/products/types";

type ProductGridCardProps = {
  product: Product;
  isFavorite: boolean;
  inMyStore: boolean;
  onToggleFavorite: () => void;
  onToggleStore: () => void;
  view: "grid" | "list";
};

function StockBadge({ status }: { status: StockStatus }) {
  const styles = {
    in_stock: "bg-pacific-teal/10 text-pacific-teal",
    low_stock: "bg-coral-blush text-deep-teal/70",
    out_of_stock: "bg-deep-teal/10 text-deep-teal/45",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${styles[status]}`}>
      {STOCK_STATUS_LABELS[status]}
    </span>
  );
}

export function ProductGridCard({
  product,
  isFavorite,
  inMyStore,
  onToggleFavorite,
  onToggleStore,
  view,
}: ProductGridCardProps) {
  const stockStatus =
    product.stock <= 0
      ? "out_of_stock"
      : product.stock <= product.lowStockThreshold
        ? "low_stock"
        : "in_stock";

  if (view === "list") {
    return (
      <article className="flex gap-4 rounded-2xl border border-deep-teal/10 bg-pure-white p-4 shadow-sm">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
          <Image src={product.images[0]} alt="" fill className="object-cover" sizes="80px" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link href={`/portal/doctor/inventory/${product.id}`} className="font-medium text-deep-teal hover:text-pacific-teal">
                {product.name}
              </Link>
              <p className="mt-1 text-xs text-deep-teal/50">{product.category}</p>
            </div>
            <div className="flex items-center gap-2">
              <StockBadge status={stockStatus} />
              <button type="button" onClick={onToggleFavorite} aria-label="Toggle favorite" className="text-lg leading-none">
                {isFavorite ? "★" : "☆"}
              </button>
            </div>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-deep-teal/60">{product.shortDescription}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-deep-teal">${product.clinicPrice}</p>
            <label className="flex items-center gap-2 text-xs text-deep-teal/70">
              <input type="checkbox" checked={inMyStore} onChange={onToggleStore} className="size-4 rounded" />
              Add to My Store
            </label>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm overflow-hidden">
      <div className="relative aspect-[4/3]">
        <Image src={product.images[0]} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
        <button
          type="button"
          onClick={onToggleFavorite}
          className="absolute right-3 top-3 rounded-full bg-pure-white/90 px-2 py-1 text-sm"
          aria-label="Toggle favorite"
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-full bg-deep-teal/5 px-2 py-0.5 text-[10px] font-medium text-deep-teal/60">
            {product.category}
          </span>
          <StockBadge status={stockStatus} />
        </div>
        <Link href={`/portal/doctor/inventory/${product.id}`} className="mt-2 font-medium text-deep-teal hover:text-pacific-teal">
          {product.name}
        </Link>
        <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-deep-teal/60">
          {product.shortDescription}
        </p>
        <p className="mt-3 text-sm font-medium text-deep-teal">${product.clinicPrice}</p>
        <label className="mt-3 flex items-center gap-2 text-xs text-deep-teal/70">
          <input type="checkbox" checked={inMyStore} onChange={onToggleStore} className="size-4 rounded" />
          Add to My Store
        </label>
      </div>
    </article>
  );
}
