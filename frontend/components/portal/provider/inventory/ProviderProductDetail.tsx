"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { authInputClassName, authLabelClassName } from "@/components/auth/AuthShell";
import { useProviderPortal } from "@/context/ProviderPortalProvider";
import { getCatalogProduct, setCatalogRetailPrice } from "@/lib/products/api";
import type { CatalogProduct } from "@/lib/products/catalog-types";
import {
  CATALOG_PRODUCT_TYPE_LABELS,
  CATALOG_STOCK_STATUS_LABELS,
  defaultRetailPrice,
  getPrimaryImage,
} from "@/lib/products/catalog-types";
import { showError, toast } from "@/lib/toast";

type ProviderProductDetailProps = {
  productId: string;
};

export function ProviderProductDetail({ productId }: ProviderProductDetailProps) {
  const { refreshMyStore } = useProviderPortal();
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mainImage, setMainImage] = useState("");
  const [retailPrice, setRetailPrice] = useState("");

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      try {
        const response = await getCatalogProduct(productId);
        setProduct(response.product);
        setMainImage(getPrimaryImage(response.product) ?? "");
        setRetailPrice(String(defaultRetailPrice(response.product.clinic_cost)));
      } catch (error) {
        showError(error, "Unable to load product.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProduct();
  }, [productId]);

  async function handleSaveRetailPrice() {
    if (!product) return;

    const parsed = Number(retailPrice);
    if (!Number.isFinite(parsed) || parsed < 0) {
      toast.error("Enter a valid retail price.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await setCatalogRetailPrice(product.id, parsed);
      toast.success(result.message);
      setProduct({ ...product, in_my_store: true });
      await refreshMyStore();
    } catch (error) {
      showError(error, "Unable to save retail price.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-deep-teal/60">Loading product…</p>;
  }

  if (!product) {
    return <p className="text-sm text-deep-teal/60">Product not found.</p>;
  }

  const imageUrl = mainImage || getPrimaryImage(product) || "/brand/product-vial-2x-blend-hero.png";

  return (
    <div className="space-y-6">
      <Link href="/portal/doctor/inventory" className="inline-flex text-sm text-pacific-teal hover:underline">
        Back to Inventory
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex gap-4">
          {product.images.length > 1 ? (
            <div className="flex flex-col gap-2">
              {product.images.map((image) => (
                <button
                  key={image.url}
                  type="button"
                  onClick={() => setMainImage(image.url)}
                  className={`relative size-16 overflow-hidden rounded-lg border ${
                    mainImage === image.url ? "border-pacific-teal ring-2 ring-pacific-teal/25" : "border-deep-teal/10"
                  }`}
                >
                  <Image src={image.url} alt="" fill className="object-cover" sizes="64px" unoptimized />
                </button>
              ))}
            </div>
          ) : null}
          <div className="relative min-h-[320px] flex-1 overflow-hidden rounded-2xl border border-deep-teal/10">
            <Image src={imageUrl} alt="" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" priority unoptimized={imageUrl.startsWith("http")} />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-deep-teal/45">
              {product.category.name ?? "Uncategorized"}
            </p>
            <h2 className="mt-1 font-serif text-3xl font-light text-deep-teal">{product.name}</h2>
            <p className="mt-2 text-sm text-deep-teal/65">
              {product.short_description ?? product.description ?? "—"}
            </p>
          </div>

          <div className="grid gap-3 rounded-2xl border border-deep-teal/10 p-4 sm:grid-cols-2">
            {[
              ["SKU", product.sku],
              ["Form", product.form ?? "—"],
              ["Strength", product.strength ?? "—"],
              ["Best use within", product.best_use_within ?? "—"],
              ["DEA schedule", product.dea_schedule ?? "—"],
              ["Product type", CATALOG_PRODUCT_TYPE_LABELS[product.product_type]],
              ["Stock", `${product.stock_count} · ${CATALOG_STOCK_STATUS_LABELS[product.stock_status]}`],
              ["Clinic cost", product.clinic_cost != null ? `$${product.clinic_cost.toFixed(2)}` : "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[11px] uppercase tracking-wide text-deep-teal/45">{label}</p>
                <p className="mt-1 text-sm text-deep-teal">{value}</p>
              </div>
            ))}
          </div>

          {product.coa_doc_url ? (
            <a
              href={product.coa_doc_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-pacific-teal hover:underline"
            >
              Download COA
            </a>
          ) : null}

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1">
              <label className={authLabelClassName}>Set retail price ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={retailPrice}
                onChange={(e) => setRetailPrice(e.target.value)}
                className={authInputClassName}
              />
            </div>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => void handleSaveRetailPrice()}
              className="rounded-full bg-deep-teal px-5 py-3 text-sm font-medium text-pure-white hover:bg-pacific-teal disabled:opacity-60"
            >
              {isSaving ? "Saving…" : product.in_my_store ? "Update My Store price" : "Add to My Store"}
            </button>
          </div>

          {product.directions ? (
            <div className="rounded-2xl border border-deep-teal/10 bg-deep-teal/[0.02] p-4">
              <p className="text-sm font-medium text-deep-teal">Directions / dosing</p>
              <p className="mt-2 text-sm leading-relaxed text-deep-teal/65">{product.directions}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
