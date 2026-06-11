"use client";

import Image from "next/image";
import Link from "next/link";
import { Tooltip } from "@/components/ui/Tippy";
import type { CatalogProduct, CatalogStockStatus } from "@/lib/products/catalog-types";
import { CATALOG_STOCK_STATUS_LABELS, getPrimaryImage } from "@/lib/products/catalog-types";

const STOCK_TIPS: Record<CatalogStockStatus, string> = {
  in_stock: "Available to order from the catalog.",
  low: "Limited inventory — order soon.",
  out_of_stock: "Currently unavailable.",
};

type ProductGridCardProps = {
  product: CatalogProduct;
  isFavorite: boolean;
  inMyStore: boolean;
  onToggleFavorite: () => void;
  onToggleStore: () => void;
  view: "grid" | "list";
  isStoreUpdating?: boolean;
};

function StockBadge({ status }: { status: CatalogStockStatus }) {
  const styles = {
    in_stock: "bg-pacific-teal/10 text-pacific-teal",
    low: "bg-coral-blush text-deep-teal/70",
    out_of_stock: "bg-deep-teal/10 text-deep-teal/45",
  };
  return (
    <Tooltip content={STOCK_TIPS[status]}>
      <span className={`cursor-help rounded-full px-2 py-0.5 text-[10px] font-medium ${styles[status]}`}>
        {CATALOG_STOCK_STATUS_LABELS[status]}
      </span>
    </Tooltip>
  );
}

export function ProductGridCard({
  product,
  isFavorite,
  inMyStore,
  onToggleFavorite,
  onToggleStore,
  view,
  isStoreUpdating = false,
}: ProductGridCardProps) {
  const imageUrl = getPrimaryImage(product) ?? "/brand/product-vial-2x-blend-hero.png";
  const detailHref = `/portal/doctor/inventory/${product.slug ?? product.id}`;

  if (view === "list") {
    return (
      <article className="flex gap-4 rounded-2xl border border-deep-teal/10 bg-pure-white p-4 shadow-sm">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
          <Image src={imageUrl} alt="" fill className="object-cover" sizes="80px" unoptimized={imageUrl.startsWith("http")} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <Link href={detailHref} className="font-medium text-deep-teal hover:text-pacific-teal">
                {product.name}
              </Link>
              <p className="mt-1 text-xs text-deep-teal/50">{product.category.name ?? "Uncategorized"}</p>
            </div>
            <div className="flex items-center gap-2">
              <StockBadge status={product.stock_status} />
              <Tooltip content={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                <button type="button" onClick={onToggleFavorite} aria-label="Toggle favorite" className="text-lg leading-none">
                  {isFavorite ? "★" : "☆"}
                </button>
              </Tooltip>
            </div>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-deep-teal/60">
            {product.description ?? "—"}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-deep-teal">
              {product.clinic_cost != null ? `$${product.clinic_cost.toFixed(2)}` : "—"}
            </p>
            <label className="flex items-center gap-2 text-xs text-deep-teal/70">
              <input
                type="checkbox"
                checked={inMyStore}
                disabled={isStoreUpdating}
                onChange={onToggleStore}
                className="size-4 rounded"
              />
              Add to My Store
            </label>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
      <div className="relative aspect-[4/3]">
        <Image src={imageUrl} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" unoptimized={imageUrl.startsWith("http")} />
        <Tooltip content={isFavorite ? "Remove from favorites" : "Add to favorites"}>
          <button
            type="button"
            onClick={onToggleFavorite}
            className="absolute right-3 top-3 rounded-full bg-pure-white/90 px-2 py-1 text-sm"
            aria-label="Toggle favorite"
          >
            {isFavorite ? "★" : "☆"}
          </button>
        </Tooltip>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-full bg-deep-teal/5 px-2 py-0.5 text-[10px] font-medium text-deep-teal/60">
            {product.category.name ?? "Uncategorized"}
          </span>
          <StockBadge status={product.stock_status} />
        </div>
        <Link href={detailHref} className="mt-2 font-medium text-deep-teal hover:text-pacific-teal">
          {product.name}
        </Link>
        <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-deep-teal/60">
          {product.description ?? "—"}
        </p>
        <p className="mt-3 text-sm font-medium text-deep-teal">
          {product.clinic_cost != null ? `$${product.clinic_cost.toFixed(2)}` : "—"}
        </p>
        <label className="mt-3 flex items-center gap-2 text-xs text-deep-teal/70">
          <input
            type="checkbox"
            checked={inMyStore}
            disabled={isStoreUpdating}
            onChange={onToggleStore}
            className="size-4 rounded"
          />
          Add to My Store
        </label>
      </div>
    </article>
  );
}
