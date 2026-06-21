"use client";

import Image from "next/image";
import Link from "next/link";
import { Tooltip } from "@/components/ui/Tippy";
import {
  ProductCardActionRow,
  ProductCardNameRow,
  ProductCardStatsRow,
  productCardBodyClass,
  productStatValue,
} from "@/components/portal/shared/ProductCardLayout";
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
  storeTourId?: string;
};

function StockBadge({ status }: { status: CatalogStockStatus }) {
  const styles = {
    in_stock: "bg-pacific-teal/10 text-pacific-teal",
    low: "bg-coral-blush text-deep-teal/70",
    out_of_stock: "bg-deep-teal/10 text-deep-teal/45",
  };
  return (
    <Tooltip content={STOCK_TIPS[status]}>
      <span className={`cursor-help rounded-full px-2 py-0.5 text-[10px] font-light ${styles[status]}`}>
        {CATALOG_STOCK_STATUS_LABELS[status]}
      </span>
    </Tooltip>
  );
}

function formatClinicPrice(clinicCost: number | null) {
  return clinicCost != null ? `$${clinicCost.toFixed(2)}` : "—";
}

export function ProductGridCard({
  product,
  isFavorite,
  inMyStore,
  onToggleFavorite,
  onToggleStore,
  view,
  isStoreUpdating = false,
  storeTourId,
}: ProductGridCardProps) {
  const imageUrl = getPrimaryImage(product) ?? "/brand/product-vial-2x-blend-hero.png";
  const detailHref = `/portal/doctor/inventory/${product.slug ?? product.id}`;
  const category = product.category.name ?? "Uncategorized";

  const nameNode = (
    <Link href={detailHref} className="hover:text-pacific-teal">
      {product.name}
    </Link>
  );

  const statsLeft = (
    <>
      Stock: {productStatValue(product.stock_count)}
    </>
  );

  const statsRight = (
    <>
      Clinic price: {productStatValue(formatClinicPrice(product.clinic_cost))}
    </>
  );

  const storeToggle = (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={inMyStore}
        disabled={isStoreUpdating}
        onChange={onToggleStore}
        data-tour={storeTourId}
        className="size-4 rounded border-deep-teal/25 text-deep-teal disabled:opacity-50"
      />
    </label>
  );

  if (view === "list") {
    return (
      <article className="flex gap-4 rounded-2xl border border-deep-teal/10 bg-pure-white p-4 shadow-sm">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
          <Image src={imageUrl} alt="" fill className="object-cover" sizes="80px" unoptimized={imageUrl.startsWith("http")} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <ProductCardNameRow name={nameNode} category={category} />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <StockBadge status={product.stock_status} />
              <Tooltip content={isFavorite ? "Remove from favorites" : "Add to favorites"}>
                <button type="button" onClick={onToggleFavorite} aria-label="Toggle favorite" className="text-lg leading-none">
                  {isFavorite ? "★" : "☆"}
                </button>
              </Tooltip>
            </div>
          </div>

          <ProductCardStatsRow left={statsLeft} right={statsRight} />

          {product.description ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-deep-teal/60">{product.description}</p>
          ) : null}

          <ProductCardActionRow label="Add to My Store">{storeToggle}</ProductCardActionRow>
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
      <div className="relative aspect-[4/3]">
        <Image src={imageUrl} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" unoptimized={imageUrl.startsWith("http")} />
        <div className="absolute left-3 top-3">
          <StockBadge status={product.stock_status} />
        </div>
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

      <div className={productCardBodyClass()}>
        <ProductCardNameRow name={nameNode} category={category} />
        <ProductCardStatsRow left={statsLeft} right={statsRight} />

        {product.description ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-deep-teal/60">{product.description}</p>
        ) : null}

        <ProductCardActionRow label="Add to My Store">{storeToggle}</ProductCardActionRow>
      </div>
    </article>
  );
}
