"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import {
  createProduct,
  getProduct,
  listCategories,
  updateProduct,
  uploadProductImages,
} from "@/lib/admin/inventory/api";
import type { InventoryCategory, ProductType } from "@/lib/admin/inventory/types";
import { showError, toast } from "@/lib/toast";

type ProductFormProps = {
  productId?: string;
};

export function AdminProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(productId);

  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  const [sku, setSku] = useState("");
  const [productName, setProductName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productType, setProductType] = useState<ProductType>("peptides");
  const [active, setActive] = useState(true);
  const [clinicCost, setClinicCost] = useState("");
  const [stockCount, setStockCount] = useState("0");
  const [lowStockThreshold, setLowStockThreshold] = useState("10");
  const [description, setDescription] = useState("");
  const [directions, setDirections] = useState("");
  const [strength, setStrength] = useState("");
  const [form, setForm] = useState("");
  const [bestUseWithin, setBestUseWithin] = useState("");
  const [deaSchedule, setDeaSchedule] = useState("");
  const [primaryImage, setPrimaryImage] = useState<File | null>(null);
  const [extraImages, setExtraImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{ url: string; is_primary?: boolean }[]>([]);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) {
        setIsLoading(false);
        return;
      }

      try {
        const productResponse = await getProduct(productId);
        const product = productResponse.product;
        setSku(product.sku);
        setProductName(product.name);
        setCategoryId(product.category.id ?? "");
        setProductType(product.product_type);
        setActive(product.status === "ACTIVE");
        setClinicCost(product.clinic_cost != null ? String(product.clinic_cost) : "");
        setStockCount(String(product.stock_count));
        setLowStockThreshold(String(product.low_stock_threshold));
        setDescription(product.description ?? "");
        setDirections(product.directions ?? "");
        setStrength(product.strength ?? "");
        setForm(product.form ?? "");
        setBestUseWithin(product.best_use_within ?? "");
        setDeaSchedule(product.dea_schedule ?? "");
        setExistingImages(product.images);
      } catch (error) {
        showError(error, "Unable to load product.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProduct();
  }, [productId]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const categoriesResponse = await listCategories(productType);
        setCategories(categoriesResponse.categories);
      } catch (error) {
        showError(error, "Unable to load categories.");
      }
    }

    void loadCategories();
  }, [productType]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();

    if (!productName.trim() || !sku.trim()) {
      toast.error("Name and SKU are required.");
      return;
    }

    if (!clinicCost || Number(clinicCost) < 0) {
      toast.error("Enter a valid clinic cost.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading(isEditing ? "Updating product…" : "Creating product…");

    try {
      if (isEditing && productId) {
        await updateProduct(
          productId,
          {
            product_name: productName.trim(),
            category_id: categoryId || undefined,
            description: description.trim() || undefined,
            directions: directions.trim() || undefined,
            stock_count: Number(stockCount),
            low_stock_threshold: Number(lowStockThreshold),
            clinic_cost: Number(clinicCost),
            active,
            strength: strength.trim() || undefined,
            form: form.trim() || undefined,
            best_use_within: bestUseWithin.trim() || undefined,
            dea_schedule: deaSchedule.trim() || undefined,
          },
          primaryImage,
        );

        if (extraImages.length > 0) {
          await uploadProductImages(productId, extraImages);
        }

        toast.dismiss(toastId);
        toast.success("Product updated.");
      } else {
        const createResponse = await createProduct(
          {
            sku: sku.trim(),
            product_name: productName.trim(),
            category_id: categoryId || undefined,
            product_type: productType,
            description: description.trim() || undefined,
            directions: directions.trim() || undefined,
            stock_count: Number(stockCount),
            low_stock_threshold: Number(lowStockThreshold),
            clinic_cost: Number(clinicCost),
            strength: strength.trim() || undefined,
            form: form.trim() || undefined,
            best_use_within: bestUseWithin.trim() || undefined,
            dea_schedule: deaSchedule.trim() || undefined,
          },
          primaryImage,
        );

        if (extraImages.length > 0) {
          await uploadProductImages(createResponse.product.id, extraImages);
        }

        toast.dismiss(toastId);
        toast.success(createResponse.message ?? "Product created.");
      }

      router.push("/portal/admin/catalog");
    } catch (error) {
      toast.dismiss(toastId);
      showError(error, "Unable to save product.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-deep-teal/60">Loading product…</p>;
  }

  return (
    <form onSubmit={(event) => void handleSave(event)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={authLabelClassName}>Product name</label>
          <input required value={productName} onChange={(e) => setProductName(e.target.value)} className={authInputClassName} />
        </div>
        <div>
          <label className={authLabelClassName}>SKU</label>
          <input required value={sku} onChange={(e) => setSku(e.target.value)} disabled={isEditing} className={authInputClassName} />
        </div>
        <div>
          <label className={authLabelClassName}>Product type</label>
          <select
            value={productType}
            onChange={(e) => {
              setProductType(e.target.value as ProductType);
              setCategoryId("");
            }}
            disabled={isEditing}
            className={authInputClassName}
          >
            <option value="peptides">Peptides</option>
            <option value="pharmacy">Pharmacy</option>
          </select>
        </div>
        <div>
          <label className={authLabelClassName}>Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={authInputClassName}>
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
        {isEditing ? (
          <div>
            <label className={authLabelClassName}>Active</label>
            <select
              value={active ? "true" : "false"}
              onChange={(e) => setActive(e.target.value === "true")}
              className={authInputClassName}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        ) : null}
        <div>
          <label className={authLabelClassName}>Clinic cost ($)</label>
          <input required type="number" min="0" step="0.01" value={clinicCost} onChange={(e) => setClinicCost(e.target.value)} className={authInputClassName} />
        </div>
        <div>
          <label className={authLabelClassName}>Stock count</label>
          <input type="number" min="0" value={stockCount} onChange={(e) => setStockCount(e.target.value)} className={authInputClassName} />
        </div>
        <div>
          <label className={authLabelClassName}>Low stock threshold</label>
          <input type="number" min="0" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} className={authInputClassName} />
        </div>
        {productType === "peptides" ? (
          <>
            <div>
              <label className={authLabelClassName}>Strength</label>
              <input value={strength} onChange={(e) => setStrength(e.target.value)} className={authInputClassName} />
            </div>
            <div>
              <label className={authLabelClassName}>Form</label>
              <input value={form} onChange={(e) => setForm(e.target.value)} className={authInputClassName} />
            </div>
            <div>
              <label className={authLabelClassName}>Best use within</label>
              <input value={bestUseWithin} onChange={(e) => setBestUseWithin(e.target.value)} className={authInputClassName} />
            </div>
          </>
        ) : (
          <div>
            <label className={authLabelClassName}>DEA schedule</label>
            <input value={deaSchedule} onChange={(e) => setDeaSchedule(e.target.value)} className={authInputClassName} />
          </div>
        )}
      </div>

      <div>
        <label className={authLabelClassName}>Description</label>
        <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className={`${authInputClassName} resize-none`} />
      </div>

      <div>
        <label className={authLabelClassName}>Directions</label>
        <textarea rows={3} value={directions} onChange={(e) => setDirections(e.target.value)} className={`${authInputClassName} resize-none`} />
      </div>

      <div>
        <label className={authLabelClassName}>{isEditing ? "Replace primary image" : "Primary image"}</label>
        <input type="file" accept="image/*" onChange={(e) => setPrimaryImage(e.target.files?.[0] ?? null)} className="text-sm" />
      </div>

      <div>
        <label className={authLabelClassName}>Additional images</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setExtraImages(Array.from(e.target.files ?? []))}
          className="text-sm"
        />
      </div>

      {existingImages.length > 0 ? (
        <div>
          <p className={authLabelClassName}>Current images</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {existingImages.map((image) => (
              <div key={image.url} className="relative size-20 overflow-hidden rounded-lg border border-deep-teal/10">
                <Image src={image.url} alt="" fill className="object-cover" sizes="80px" unoptimized />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-deep-teal px-5 py-2.5 text-sm font-light text-pure-white hover:bg-pacific-teal disabled:opacity-60"
        >
          {isSaving ? "Saving…" : isEditing ? "Update product" : "Create product"}
        </button>
        <Link href="/portal/admin/catalog" className="rounded-full border border-deep-teal/15 px-5 py-2.5 text-sm text-deep-teal">
          Cancel
        </Link>
      </div>
    </form>
  );
}
