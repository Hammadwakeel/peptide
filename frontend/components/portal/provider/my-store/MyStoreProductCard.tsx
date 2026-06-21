"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Tooltip } from "@/components/ui/Tippy";
import {
  ProductCardNameRow,
  ProductCardStatsRow,
  productCardBodyClass,
  productStatValue,
} from "@/components/portal/shared/ProductCardLayout";
import type { StoreProduct } from "@/lib/products/catalog-types";

type MyStoreProductCardProps = {
  product: StoreProduct;
  onRetailPriceChange: (price: number) => void;
  onVisibilityChange: (isVisible: boolean) => void;
  onRemove: () => void;
  isUpdating?: boolean;
  visibilityTourId?: string;
};

export function MyStoreProductCard({
  product,
  onRetailPriceChange,
  onVisibilityChange,
  onRemove,
  isUpdating = false,
  visibilityTourId,
}: MyStoreProductCardProps) {
  const [draftPrice, setDraftPrice] = useState(String(product.retail_price));
  const [priceDirty, setPriceDirty] = useState(false);

  useEffect(() => {
    setDraftPrice(String(product.retail_price));
    setPriceDirty(false);
  }, [product.retail_price]);

  function commitPrice() {
    const parsed = Number(draftPrice);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setDraftPrice(String(product.retail_price));
      setPriceDirty(false);
      return;
    }
    if (parsed !== product.retail_price) {
      onRetailPriceChange(parsed);
    }
    setPriceDirty(false);
  }

  const imageUrl = product.image_url ?? "/brand/product-vial-2x-blend-hero.png";

  return (
    <article className="relative flex flex-col overflow-hidden rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
      <Tooltip content={`Remove ${product.name} from My Store`}>
        <button
          type="button"
          onClick={onRemove}
          disabled={isUpdating}
          aria-label={`Remove ${product.name} from My Store`}
          className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-pure-white/95 text-lg leading-none text-deep-teal/60 shadow-sm transition-colors hover:bg-coral-blush hover:text-deep-teal disabled:opacity-50"
        >
          ×
        </button>
      </Tooltip>
      {!product.is_visible ? (
        <Tooltip content="Hidden from your patient storefront">
          <span className="absolute left-3 top-3 z-10 cursor-help rounded-full bg-deep-teal/80 px-2 py-0.5 text-[10px] font-light text-pure-white">
            Hidden
          </span>
        </Tooltip>
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

      <div className={productCardBodyClass()}>
        <ProductCardNameRow
          name={product.name}
          category={product.category.name ?? "Uncategorized"}
        />

        <ProductCardStatsRow
          left={
            <>
              Stock: {productStatValue(product.stock_count ?? 0)}
            </>
          }
          right={
            <>
              Clinic price:{" "}
              {productStatValue(
                product.clinic_cost != null ? `$${product.clinic_cost.toFixed(2)}` : "—",
              )}
            </>
          }
        />

        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2.5">
          <span className="text-xs font-light uppercase tracking-wide text-deep-teal/65">
            Retail price
          </span>
          <div className="flex items-center justify-end gap-2">
            <div className="flex w-full max-w-[7.5rem] items-center rounded-xl border border-deep-teal/20 bg-surface-muted/30 px-3 py-2 focus-within:border-pacific-teal">
              <span className="text-sm font-light text-deep-teal/70">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={draftPrice}
                disabled={isUpdating}
                onChange={(e) => {
                  setDraftPrice(e.target.value);
                  setPriceDirty(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitPrice();
                }}
                className="w-full bg-transparent pl-1 text-sm font-light text-deep-teal outline-none disabled:opacity-60"
              />
            </div>
            {priceDirty ? (
              <button
                type="button"
                disabled={isUpdating}
                onClick={commitPrice}
                className="shrink-0 rounded-full bg-deep-teal px-3 py-1.5 text-xs font-light text-pure-white hover:bg-pacific-teal disabled:opacity-60"
              >
                Save
              </button>
            ) : null}
          </div>

          <span className="text-sm text-deep-teal/65">Visible to customers</span>
          <label className="flex items-center justify-end gap-2">
            <input
              type="checkbox"
              checked={product.is_visible}
              disabled={isUpdating}
              onChange={(e) => onVisibilityChange(e.target.checked)}
              data-tour={visibilityTourId}
              className="size-4 rounded border-deep-teal/25 text-deep-teal disabled:opacity-50"
            />
          </label>
        </div>
      </div>
    </article>
  );
}
