"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { authInputClassName, authLabelClassName } from "@/components/auth/AuthShell";
import { useProviderPortal } from "@/context/ProviderPortalProvider";
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
  const {
    getCachedProduct,
    resolveProduct,
    getStoreProduct,
    isInMyStore,
    addToMyStore,
    updateRetailPrice,
    getStoreIdForProduct,
  } = useProviderPortal();

  const cached = getCachedProduct(productId);
  const [product, setProduct] = useState<CatalogProduct | null>(cached ?? null);
  const [isRefreshing, setIsRefreshing] = useState(!cached);
  const [isSaving, setIsSaving] = useState(false);
  const [mainImage, setMainImage] = useState(cached ? (getPrimaryImage(cached) ?? "") : "");
  const [retailPrice, setRetailPrice] = useState(() => {
    const storeEntry = getStoreProduct(cached?.id ?? productId);
    if (storeEntry) return String(storeEntry.retail_price);
    if (cached) return String(defaultRetailPrice(cached.clinic_cost));
    return "";
  });

  useEffect(() => {
    const initial = getCachedProduct(productId);
    if (initial) {
      setProduct(initial);
      setMainImage(getPrimaryImage(initial) ?? "");
      const storeEntry = getStoreProduct(initial.id);
      setRetailPrice(
        storeEntry
          ? String(storeEntry.retail_price)
          : String(defaultRetailPrice(initial.clinic_cost)),
      );
      setIsRefreshing(false);
    }

    let cancelled = false;
    async function refreshProduct() {
      if (!initial) setIsRefreshing(true);
      try {
        const resolved = await resolveProduct(productId);
        if (cancelled) return;
        setProduct(resolved);
        setMainImage(getPrimaryImage(resolved) ?? "");
        const storeEntry = getStoreProduct(resolved.id);
        setRetailPrice(
          storeEntry
            ? String(storeEntry.retail_price)
            : String(defaultRetailPrice(resolved.clinic_cost)),
        );
      } catch (error) {
        if (!cancelled && !initial) showError(error, "Unable to load product.");
      } finally {
        if (!cancelled) setIsRefreshing(false);
      }
    }

    void refreshProduct();
    return () => {
      cancelled = true;
    };
  }, [productId, getCachedProduct, resolveProduct, getStoreProduct]);

  async function handleSaveRetailPrice() {
    if (!product) return;

    const parsed = Number(retailPrice);
    if (!Number.isFinite(parsed) || parsed < 0) {
      toast.error("Enter a valid retail price.");
      return;
    }

    setIsSaving(true);
    try {
      if (isInMyStore(product.id)) {
        const storeId = getStoreIdForProduct(product.id);
        if (!storeId) throw new Error("Store entry not found.");
        await updateRetailPrice(storeId, parsed);
        toast.success("Retail price updated.");
      } else {
        await addToMyStore([{ productId: product.id, retailPrice: parsed }]);
        toast.success("Product added to My Store.");
      }
      setProduct({ ...product, in_my_store: true });
    } catch (error) {
      showError(error, "Unable to save retail price.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!product && isRefreshing) {
    return <p className="text-sm text-deep-teal/60">Loading product…</p>;
  }

  if (!product) {
    return <p className="text-sm text-deep-teal/60">Product not found.</p>;
  }

  const imageUrl = mainImage || getPrimaryImage(product) || "/brand/product-vial-2x-blend-hero.png";
  const inStore = product.in_my_store ?? isInMyStore(product.id);

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
                    mainImage === image.url
                      ? "border-pacific-teal ring-2 ring-pacific-teal/25"
                      : "border-deep-teal/10"
                  }`}
                >
                  <Image src={image.url} alt="" fill className="object-cover" sizes="64px" unoptimized />
                </button>
              ))}
            </div>
          ) : null}
          <div className="relative min-h-[320px] flex-1 overflow-hidden rounded-2xl border border-deep-teal/10">
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
              priority
              unoptimized={imageUrl.startsWith("http")}
            />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-deep-teal/45">
              {product.category.name ?? "Uncategorized"}
            </p>
            <h2 className="mt-1 font-serif text-3xl font-light text-deep-teal">{product.name}</h2>
            <p className="mt-2 text-sm text-deep-teal/65">{product.description ?? "—"}</p>
          </div>

          <div className="grid gap-3 rounded-2xl border border-deep-teal/10 p-4 sm:grid-cols-2">
            {[
              ["SKU", product.sku],
              ["Product type", CATALOG_PRODUCT_TYPE_LABELS[product.product_type]],
              ["Category", product.category.name ?? "—"],
              ["Stock", `${product.stock_count} · ${CATALOG_STOCK_STATUS_LABELS[product.stock_status]}`],
              ["Clinic cost", product.clinic_cost != null ? `$${product.clinic_cost.toFixed(2)}` : "—"],
              ...(product.product_type === "peptides"
                ? [
                    ["Strength", product.strength ?? "—"],
                    ["Form", product.form ?? "—"],
                    ["Best use within", product.best_use_within ?? "—"],
                  ]
                : [["DEA schedule", product.dea_schedule ?? "—"]]),
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[11px] uppercase tracking-wide text-deep-teal/45">{label}</p>
                <p className="mt-1 text-sm text-deep-teal">{value}</p>
              </div>
            ))}
          </div>

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
              {isSaving ? "Saving…" : inStore ? "Update My Store price" : "Add to My Store"}
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
