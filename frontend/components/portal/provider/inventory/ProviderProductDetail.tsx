"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { authInputClassName, authLabelClassName } from "@/components/auth/AuthShell";
import { getProductById } from "@/lib/products/mock-data";
import { toast } from "@/lib/toast";

type ProviderProductDetailProps = {
  productId: string;
};

export function ProviderProductDetail({ productId }: ProviderProductDetailProps) {
  const product = getProductById(productId);
  const [selectedVariantId, setSelectedVariantId] = useState(product?.variants[0]?.id ?? "");
  const [mainImage, setMainImage] = useState(product?.images[0] ?? "");
  const [retailPrice, setRetailPrice] = useState(String(product?.clinicPrice ?? ""));

  if (!product) {
    return <p className="text-sm text-deep-teal/60">Product not found.</p>;
  }

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];
  const variantImages = product.variants.map((v) => v.imageUrl);

  function handleSaveRetailPrice() {
    toast.success("Retail price saved.");
  }

  return (
    <div className="space-y-6">
      <Link href="/portal/doctor/inventory" className="inline-flex text-sm text-pacific-teal hover:underline">
        Back to Inventory
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex gap-4">
          <div className="flex flex-col gap-2">
            {variantImages.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setMainImage(src)}
                className={`relative size-16 overflow-hidden rounded-lg border ${
                  mainImage === src ? "border-pacific-teal ring-2 ring-pacific-teal/25" : "border-deep-teal/10"
                }`}
              >
                <Image src={src} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
          <div className="relative min-h-[320px] flex-1 overflow-hidden rounded-2xl border border-deep-teal/10">
            <Image src={mainImage || product.images[0]} alt="" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" priority />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-deep-teal/45">{product.category}</p>
            <h2 className="mt-1 font-serif text-3xl font-light text-deep-teal">{product.name}</h2>
            <p className="mt-2 text-sm text-deep-teal/65">{product.shortDescription}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-deep-teal">Variant</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => {
                    setSelectedVariantId(variant.id);
                    setMainImage(variant.imageUrl);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    selectedVariantId === variant.id
                      ? "border-pacific-teal bg-pacific-teal/10 text-deep-teal"
                      : "border-deep-teal/15 text-deep-teal/65"
                  }`}
                >
                  {variant.size} · {variant.strength}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-deep-teal/10 p-4 sm:grid-cols-2">
            {[
              ["Form", product.form],
              ["Strength", selectedVariant?.strength ?? product.strength],
              ["Best use within", product.bestUseWithin],
              ["DEA schedule", product.deaSchedule],
              ["Product type", product.productTypeLabel],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[11px] uppercase tracking-wide text-deep-teal/45">{label}</p>
                <p className="mt-1 text-sm text-deep-teal">{value}</p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-deep-teal/10">
            <table className="min-w-full text-sm">
              <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase text-deep-teal/45">
                <tr>
                  <th className="px-4 py-3 text-left">Min qty</th>
                  <th className="px-4 py-3 text-left">Max qty</th>
                  <th className="px-4 py-3 text-left">Unit price</th>
                </tr>
              </thead>
              <tbody>
                {product.pricingTiers.map((tier) => (
                  <tr key={tier.id} className="border-b border-deep-teal/5">
                    <td className="px-4 py-3">{tier.minQty}</td>
                    <td className="px-4 py-3">{tier.maxQty ?? "∞"}</td>
                    <td className="px-4 py-3">${tier.unitPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {product.coaFileName ? (
            <button
              type="button"
              onClick={() => toast.info(`Downloading ${product.coaFileName}…`)}
              className="text-sm font-medium text-pacific-teal hover:underline"
            >
              Download COA ({product.coaFileName})
            </button>
          ) : null}

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1">
              <label className={authLabelClassName}>Set retail price ($)</label>
              <input
                type="number"
                min="0"
                value={retailPrice}
                onChange={(e) => setRetailPrice(e.target.value)}
                className={authInputClassName}
              />
            </div>
            <button
              type="button"
              onClick={handleSaveRetailPrice}
              className="rounded-full bg-deep-teal px-5 py-3 text-sm font-medium text-pure-white hover:bg-pacific-teal"
            >
              Save
            </button>
          </div>

          <div className="rounded-2xl border border-deep-teal/10 bg-deep-teal/[0.02] p-4">
            <p className="text-sm font-medium text-deep-teal">Directions / dosing</p>
            <p className="mt-2 text-sm leading-relaxed text-deep-teal/65">{product.directions}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
