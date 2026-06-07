"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { getProductById } from "@/lib/products/mock-data";
import type { PricingTier, ProductVariant } from "@/lib/products/types";
import { toast } from "@/lib/toast";

type ProductFormProps = {
  productId?: string;
};

function emptyVariant(): ProductVariant {
  return {
    id: crypto.randomUUID(),
    size: "",
    strength: "",
    price: 0,
    imageUrl: "/brand/product-vial-2x-blend-hero.png",
  };
}

function emptyTier(): PricingTier {
  return { id: crypto.randomUUID(), minQty: 1, maxQty: null, unitPrice: 0 };
}

export function AdminProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const existing = productId ? getProductById(productId) : undefined;

  const [name, setName] = useState(existing?.name ?? "");
  const [sku, setSku] = useState(existing?.sku ?? "");
  const [category, setCategory] = useState(existing?.category ?? "");
  const [type, setType] = useState(existing?.type ?? "research");
  const [status, setStatus] = useState(existing?.status ?? "draft");
  const [price, setPrice] = useState(String(existing?.price ?? ""));
  const [description, setDescription] = useState(existing?.description.replace(/<[^>]+>/g, "") ?? "");
  const [images, setImages] = useState<string[]>(existing?.images ?? []);
  const [coaFileName, setCoaFileName] = useState(existing?.coaFileName ?? "");
  const [variants, setVariants] = useState<ProductVariant[]>(
    existing?.variants ?? [emptyVariant()],
  );
  const [tiers, setTiers] = useState<PricingTier[]>(
    existing?.pricingTiers ?? [emptyTier()],
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await new Promise((r) => setTimeout(r, 500));
    toast.success(productId ? "Product updated." : "Product created.");
    router.push("/portal/admin/catalog");
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setImages((current) => [
      ...current,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  }

  return (
    <form onSubmit={(e) => void handleSave(e)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={authLabelClassName}>Name</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={authInputClassName} />
        </div>
        <div>
          <label className={authLabelClassName}>SKU</label>
          <input required value={sku} onChange={(e) => setSku(e.target.value)} className={authInputClassName} />
        </div>
        <div>
          <label className={authLabelClassName}>Category</label>
          <input required value={category} onChange={(e) => setCategory(e.target.value)} className={authInputClassName} />
        </div>
        <div>
          <label className={authLabelClassName}>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className={authInputClassName}>
            <option value="research">Research</option>
            <option value="pharmacy">Pharmacy</option>
          </select>
        </div>
        <div>
          <label className={authLabelClassName}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={authInputClassName}>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div>
          <label className={authLabelClassName}>Base price ($)</label>
          <input required type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={authInputClassName} />
        </div>
      </div>

      <div>
        <label className={authLabelClassName}>Description (rich text editor scaffold)</label>
        <div className="mb-2 flex gap-2">
          {["Bold", "Italic", "List"].map((tool) => (
            <button key={tool} type="button" className="rounded-lg border border-deep-teal/15 px-2 py-1 text-xs text-deep-teal/70">
              {tool}
            </button>
          ))}
        </div>
        <textarea
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${authInputClassName} resize-none`}
        />
      </div>

      <div>
        <label className={authLabelClassName}>Product images</label>
        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="text-sm" />
        <div className="mt-3 flex flex-wrap gap-3">
          {images.map((src) => (
            <div key={src} className="relative size-20 overflow-hidden rounded-lg border border-deep-teal/10">
              <Image src={src} alt="" fill className="object-cover" sizes="80px" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className={authLabelClassName}>COA file</label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setCoaFileName(e.target.files?.[0]?.name ?? "")}
          className="text-sm"
        />
        {coaFileName ? <p className="mt-1 text-xs text-deep-teal/50">{coaFileName}</p> : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-deep-teal">Variants</h3>
          <button type="button" onClick={() => setVariants((v) => [...v, emptyVariant()])} className="text-xs text-pacific-teal hover:underline">
            Add variant row
          </button>
        </div>
        {variants.map((variant, index) => (
          <div key={variant.id} className="grid gap-2 rounded-xl border border-deep-teal/10 p-3 sm:grid-cols-4">
            <input placeholder="Size" value={variant.size} onChange={(e) => setVariants((rows) => rows.map((r, i) => i === index ? { ...r, size: e.target.value } : r))} className={authInputClassName} />
            <input placeholder="Strength" value={variant.strength} onChange={(e) => setVariants((rows) => rows.map((r, i) => i === index ? { ...r, strength: e.target.value } : r))} className={authInputClassName} />
            <input placeholder="Price" type="number" value={variant.price} onChange={(e) => setVariants((rows) => rows.map((r, i) => i === index ? { ...r, price: Number(e.target.value) } : r))} className={authInputClassName} />
            <input placeholder="Image URL" value={variant.imageUrl} onChange={(e) => setVariants((rows) => rows.map((r, i) => i === index ? { ...r, imageUrl: e.target.value } : r))} className={authInputClassName} />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-deep-teal">Tiered pricing</h3>
          <button type="button" onClick={() => setTiers((t) => [...t, emptyTier()])} className="text-xs text-pacific-teal hover:underline">
            Add tier
          </button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-deep-teal/10">
          <table className="min-w-full text-sm">
            <thead className="bg-deep-teal/[0.02] text-xs uppercase text-deep-teal/45">
              <tr>
                <th className="px-3 py-2 text-left">Min qty</th>
                <th className="px-3 py-2 text-left">Max qty</th>
                <th className="px-3 py-2 text-left">Unit price</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((tier, index) => (
                <tr key={tier.id} className="border-t border-deep-teal/5">
                  <td className="px-3 py-2">
                    <input type="number" value={tier.minQty} onChange={(e) => setTiers((rows) => rows.map((r, i) => i === index ? { ...r, minQty: Number(e.target.value) } : r))} className={authInputClassName} />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" placeholder="∞" value={tier.maxQty ?? ""} onChange={(e) => setTiers((rows) => rows.map((r, i) => i === index ? { ...r, maxQty: e.target.value ? Number(e.target.value) : null } : r))} className={authInputClassName} />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" value={tier.unitPrice} onChange={(e) => setTiers((rows) => rows.map((r, i) => i === index ? { ...r, unitPrice: Number(e.target.value) } : r))} className={authInputClassName} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="rounded-full bg-deep-teal px-5 py-2.5 text-sm font-medium text-pure-white hover:bg-pacific-teal">
          Save product
        </button>
        <Link href="/portal/admin/catalog" className="rounded-full border border-deep-teal/15 px-5 py-2.5 text-sm text-deep-teal">
          Cancel
        </Link>
      </div>
    </form>
  );
}
