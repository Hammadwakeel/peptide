"use client";

import Image from "next/image";
import { Tooltip } from "@/components/ui/Tippy";
import {
  ProductCardNameRow,
  ProductCardStatsRow,
  productCardBodyClass,
  productStatValue,
} from "@/components/portal/shared/ProductCardLayout";
import type { BrowseProduct } from "@/lib/patient-portal/types";
import { STOCK_STATUS_LABELS, type StockStatus } from "@/lib/products/types";

const PATIENT_STOCK_TIPS: Record<StockStatus, string> = {
  in_stock: "Ready to order from your clinic.",
  low_stock: "Limited stock — order soon.",
  out_of_stock: "Currently unavailable to order.",
};

type PatientProductCardProps = {
  product: BrowseProduct;
  view: "grid" | "list";
  onRequest: () => void;
  onOrder: () => void;
  onInfo: () => void;
};

function StockBadge({ product }: { product: BrowseProduct }) {
  const status = product.stockStatus;
  const styles = {
    in_stock: "bg-pacific-teal/10 text-pacific-teal",
    low_stock: "bg-coral-blush text-deep-teal/70",
    out_of_stock: "bg-deep-teal/10 text-deep-teal/45",
  };
  return (
    <Tooltip content={PATIENT_STOCK_TIPS[status]}>
      <span className={`cursor-help rounded-full px-2 py-0.5 text-[10px] font-light ${styles[status]}`}>
        {STOCK_STATUS_LABELS[status]}
      </span>
    </Tooltip>
  );
}

function isRemoteImage(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}

export function PatientProductCard({ product, view, onRequest, onOrder, onInfo }: PatientProductCardProps) {
  const statsLeft = <>Price: {productStatValue(`$${product.price}`)}</>;
  const statsRight = (
    <span className="inline-flex items-center justify-end gap-1.5">
      Stock: <StockBadge product={product} />
    </span>
  );

  const actionButtons = (
    <>
      <Tooltip content="View product details">
        <button type="button" onClick={onInfo} aria-label="Product details" className="rounded-full border border-deep-teal/15 px-2 py-1 text-sm text-deep-teal/60">
          ℹ
        </button>
      </Tooltip>
      <button
        type="button"
        disabled={product.stockStatus === "out_of_stock"}
        onClick={onOrder}
        className="rounded-full bg-deep-teal px-3 py-1.5 text-xs font-light text-pure-white disabled:opacity-50"
      >
        Order
      </button>
      <button type="button" onClick={onRequest} className="rounded-full border border-deep-teal/15 px-3 py-1.5 text-xs text-deep-teal">
        Request
      </button>
    </>
  );

  if (view === "list") {
    return (
      <article className="flex gap-4 rounded-2xl border border-deep-teal/10 bg-pure-white p-4 shadow-sm">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
          <Image
            src={product.image}
            alt=""
            fill
            className="object-cover"
            sizes="80px"
            unoptimized={isRemoteImage(product.image)}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <ProductCardNameRow name={product.name} category={product.category} />
          <ProductCardStatsRow left={statsLeft} right={statsRight} />
          <p className="line-clamp-2 text-xs leading-relaxed text-deep-teal/60">{product.shortDescription}</p>
          <div className="flex flex-wrap items-center justify-end gap-2">{actionButtons}</div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
      <div className="relative aspect-[4/3]">
        <Image
          src={product.image}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width:768px) 50vw, 33vw"
          unoptimized={isRemoteImage(product.image)}
        />
        <Tooltip content="View product details">
          <button
            type="button"
            onClick={onInfo}
            aria-label="Product details"
            className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-pure-white/95 text-sm text-deep-teal/70 shadow-sm"
          >
            ℹ
          </button>
        </Tooltip>
      </div>

      <div className={productCardBodyClass()}>
        <ProductCardNameRow name={product.name} category={product.category} />
        <ProductCardStatsRow left={statsLeft} right={statsRight} />
        <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-deep-teal/60">{product.shortDescription}</p>
        <button
          type="button"
          disabled={product.stockStatus === "out_of_stock"}
          onClick={onOrder}
          className="w-full rounded-full bg-deep-teal py-2 text-xs font-light text-pure-white hover:bg-pacific-teal disabled:opacity-50"
        >
          Order
        </button>
        <button
          type="button"
          onClick={onRequest}
          className="w-full rounded-full border border-deep-teal/15 py-2 text-xs text-deep-teal hover:bg-pacific-teal/12"
        >
          Request from Doctor
        </button>
      </div>
    </article>
  );
}
