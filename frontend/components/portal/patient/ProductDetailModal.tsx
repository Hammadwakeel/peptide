"use client";

import Image from "next/image";
import type { BrowseProduct } from "@/lib/patient-portal/types";

type ProductDetailModalProps = {
  product: BrowseProduct | null;
  open: boolean;
  onClose: () => void;
  onRequest: () => void;
  onOrder: () => void;
};

export function ProductDetailModal({ product, open, onClose, onRequest, onOrder }: ProductDetailModalProps) {
  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-deep-teal/40 p-4 sm:items-center">
      <button type="button" aria-label="Close" className="absolute inset-0" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-[1.5rem] border border-deep-teal/10 bg-pure-white shadow-xl"
      >
        <div className="relative aspect-[4/3]">
          <Image
            src={product.image}
            alt=""
            fill
            className="object-cover"
            sizes="512px"
            unoptimized={product.image.startsWith("http")}
          />
        </div>
        <div className="p-6">
          <span className="rounded-full bg-deep-teal/5 px-2 py-0.5 text-[10px] font-light text-deep-teal/60">
            {product.category}
          </span>
          <h2 className="mt-2 font-sans text-2xl font-light text-deep-teal">{product.name}</h2>
          <p className="mt-1 text-lg font-light text-deep-teal">${product.price}</p>
          <p className="mt-4 text-sm leading-relaxed text-deep-teal/70">{product.description}</p>
          <div className="mt-4 rounded-xl bg-deep-teal/[0.03] px-4 py-3">
            <p className="text-[10px] font-light uppercase tracking-wide text-deep-teal/45">Dosing / directions</p>
            <p className="mt-1 text-sm text-deep-teal/70">{product.directions}</p>
          </div>
          <div className="mt-6 flex gap-2">
            <button type="button" onClick={onClose} className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm text-deep-teal">
              Close
            </button>
            <button
              type="button"
              disabled={product.stockStatus === "out_of_stock"}
              onClick={() => {
                onClose();
                onOrder();
              }}
              className="rounded-full bg-deep-teal px-4 py-2 text-sm font-light text-pure-white hover:bg-pacific-teal disabled:opacity-50"
            >
              Place order
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequest();
              }}
              className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm text-deep-teal"
            >
              Request from Doctor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
