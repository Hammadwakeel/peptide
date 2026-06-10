"use client";

import Image from "next/image";
import type { BrowseProduct } from "@/lib/patient-portal/types";
import { STOCK_STATUS_LABELS } from "@/lib/products/types";

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
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${styles[status]}`}>
      {STOCK_STATUS_LABELS[status]}
    </span>
  );
}

function isRemoteImage(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}

export function PatientProductCard({ product, view, onRequest, onOrder, onInfo }: PatientProductCardProps) {
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
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-deep-teal">{product.name}</h3>
              <span className="mt-1 inline-block rounded-full bg-deep-teal/5 px-2 py-0.5 text-[10px] text-deep-teal/60">
                {product.category}
              </span>
            </div>
            <StockBadge product={product} />
          </div>
          <p className="mt-2 line-clamp-2 text-xs text-deep-teal/60">{product.shortDescription}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-deep-teal">${product.price}</p>
            <div className="flex gap-2">
              <button type="button" onClick={onInfo} aria-label="Product details" className="rounded-full border border-deep-teal/15 px-2 py-1 text-sm text-deep-teal/60">
                ℹ
              </button>
              <button
                type="button"
                disabled={product.stockStatus === "out_of_stock"}
                onClick={onOrder}
                className="rounded-full bg-deep-teal px-3 py-1.5 text-xs font-medium text-pure-white disabled:opacity-50"
              >
                Order
              </button>
              <button type="button" onClick={onRequest} className="rounded-full border border-deep-teal/15 px-3 py-1.5 text-xs text-deep-teal">
                Request
              </button>
            </div>
          </div>
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
        <button
          type="button"
          onClick={onInfo}
          aria-label="Product details"
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-pure-white/95 text-sm text-deep-teal/70 shadow-sm"
        >
          ℹ
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-full bg-deep-teal/5 px-2 py-0.5 text-[10px] font-medium text-deep-teal/60">
            {product.category}
          </span>
          <StockBadge product={product} />
        </div>
        <h3 className="mt-2 font-medium text-deep-teal">{product.name}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-xs text-deep-teal/60">{product.shortDescription}</p>
        <p className="mt-3 text-sm font-medium text-deep-teal">${product.price}</p>
        <button
          type="button"
          disabled={product.stockStatus === "out_of_stock"}
          onClick={onOrder}
          className="mt-3 w-full rounded-full bg-deep-teal py-2 text-xs font-medium text-pure-white hover:bg-pacific-teal disabled:opacity-50"
        >
          Order
        </button>
        <button
          type="button"
          onClick={onRequest}
          className="mt-2 w-full rounded-full border border-deep-teal/15 py-2 text-xs text-deep-teal hover:border-pacific-teal"
        >
          Request from Doctor
        </button>
      </div>
    </article>
  );
}
