"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { StoreProduct } from "@/lib/products/catalog-types";

type MyStoreProductCardProps = {
  product: StoreProduct;
  onRetailPriceChange: (price: number) => void;
  onVisibilityChange: (isVisible: boolean) => void;
  onRemove: () => void;
  isUpdating?: boolean;
};

export function MyStoreProductCard({
  product,
  onRetailPriceChange,
  onVisibilityChange,
  onRemove,
  isUpdating = false,
}: MyStoreProductCardProps) {
  const [draftPrice, setDraftPrice] = useState(String(product.retail_price));

  useEffect(() => {
    setDraftPrice(String(product.retail_price));
  }, [product.retail_price]);

  function commitPrice() {
    const parsed = Number(draftPrice);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setDraftPrice(String(product.retail_price));
      return;
    }
    onRetailPriceChange(parsed);
  }

  const imageUrl = product.image_url ?? "/brand/product-vial-2x-blend-hero.png";

  return (
    <article className="relative flex flex-col overflow-hidden rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
      <button
        type="button"
        onClick={onRemove}
        disabled={isUpdating}
        aria-label={`Remove ${product.name} from My Store`}
        className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-pure-white/95 text-lg leading-none text-deep-teal/60 shadow-sm transition-colors hover:bg-coral-blush hover:text-deep-teal disabled:opacity-50"
      >
        ×
      </button>
      {!product.is_visible ? (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-deep-teal/80 px-2 py-0.5 text-[10px] font-medium text-pure-white">
          Hidden
        </span>
      ) : null}
      <div className={`relative aspect-[4/3] ${product.is_visible ? "" : "opacity-50"}`}>
        <Image
          src={imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 33vw"
          unoptimized={imageUrl.startsWith("http")}
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="w-fit rounded-full bg-deep-teal/5 px-2 py-0.5 text-[10px] font-medium text-deep-teal/60">
          {product.category_name ?? "Uncategorized"}
        </span>
        <h3 className="mt-2 font-medium text-deep-teal">{product.name}</h3>
        <p className="mt-2 text-xs text-deep-teal/50">
          Stock:{" "}
          <span className="font-medium text-deep-teal">{product.stock_count ?? 0}</span>
        </p>
        <p className="mt-1 text-xs text-deep-teal/50">
          Clinic price:{" "}
          <span className="font-medium text-deep-teal">
            {product.clinic_cost != null ? `$${product.clinic_cost.toFixed(2)}` : "—"}
          </span>
        </p>
        <label className="mt-4 block">
          <span className="text-[10px] font-medium uppercase tracking-wide text-deep-teal/45">
            Retail price
          </span>
          <div className="mt-1 flex items-center rounded-xl border border-deep-teal/15 px-3 py-2 focus-within:border-pacific-teal">
            <span className="text-sm text-deep-teal/50">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={draftPrice}
              disabled={isUpdating}
              onChange={(e) => setDraftPrice(e.target.value)}
              onBlur={commitPrice}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              className="w-full bg-transparent pl-1 text-sm text-deep-teal outline-none disabled:opacity-60"
            />
          </div>
        </label>
        <label className="mt-4 flex items-center justify-between gap-2 text-xs text-deep-teal/70">
          <span>Visible to customers</span>
          <input
            type="checkbox"
            checked={product.is_visible}
            disabled={isUpdating}
            onChange={(e) => onVisibilityChange(e.target.checked)}
            className="size-4 rounded disabled:opacity-50"
          />
        </label>
      </div>
    </article>
  );
}
