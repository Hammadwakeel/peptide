"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/products/types";

type MyStoreProductCardProps = {
  product: Product;
  retailPrice: number;
  onRetailPriceChange: (price: number) => void;
  onRemove: () => void;
};

export function MyStoreProductCard({
  product,
  retailPrice,
  onRetailPriceChange,
  onRemove,
}: MyStoreProductCardProps) {
  const [draftPrice, setDraftPrice] = useState(String(retailPrice));

  useEffect(() => {
    setDraftPrice(String(retailPrice));
  }, [retailPrice]);

  function commitPrice() {
    const parsed = Number(draftPrice);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setDraftPrice(String(retailPrice));
      return;
    }
    onRetailPriceChange(parsed);
  }

  return (
    <article className="relative flex flex-col overflow-hidden rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${product.name} from My Store`}
        className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-pure-white/95 text-lg leading-none text-deep-teal/60 shadow-sm transition-colors hover:bg-coral-blush hover:text-deep-teal"
      >
        ×
      </button>
      <div className="relative aspect-[4/3]">
        <Image
          src={product.images[0]}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="w-fit rounded-full bg-deep-teal/5 px-2 py-0.5 text-[10px] font-medium text-deep-teal/60">
          {product.category}
        </span>
        <h3 className="mt-2 font-medium text-deep-teal">{product.name}</h3>
        <p className="mt-2 text-xs text-deep-teal/50">
          Stock: <span className="font-medium text-deep-teal">{product.stock}</span>
        </p>
        <p className="mt-1 text-xs text-deep-teal/50">
          Clinic price:{" "}
          <span className="font-medium text-deep-teal">${product.clinicPrice}</span>
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
              onChange={(e) => setDraftPrice(e.target.value)}
              onBlur={commitPrice}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                }
              }}
              className="w-full bg-transparent pl-1 text-sm text-deep-teal outline-none"
            />
          </div>
        </label>
      </div>
    </article>
  );
}
