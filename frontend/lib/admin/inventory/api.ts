import { adminFetch } from "@/lib/admin/client";
import { INVENTORY_ADMIN_ENDPOINTS } from "@/lib/admin/inventory/endpoints";
import type {
  CategoriesResponse,
  CreateCategoryPayload,
  CreateProductPayload,
  PaginatedProductsResponse,
  ProductResponse,
  ProductType,
  StockStatus,
  UpdateProductPayload,
  UpdateStockPayload,
} from "@/lib/admin/inventory/types";

type ListProductsParams = {
  page?: number;
  limit?: number;
  product_type?: ProductType;
  category_id?: string;
  search?: string;
  stock_status?: StockStatus;
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

function appendOptional(formData: FormData, key: string, value: string | number | boolean | undefined | null) {
  if (value === undefined || value === null || value === "") return;
  formData.append(key, String(value));
}

function buildCreateProductFormData(payload: CreateProductPayload, image?: File | null) {
  const formData = new FormData();
  formData.append("sku", payload.sku.trim());
  formData.append("product_name", payload.product_name.trim());
  formData.append("product_type", payload.product_type ?? "peptides");
  appendOptional(formData, "category_id", payload.category_id);
  formData.append("clinic_cost", String(payload.clinic_cost));
  formData.append("stock_count", String(payload.stock_count ?? 0));
  formData.append("low_stock_threshold", String(payload.low_stock_threshold ?? 10));
  appendOptional(formData, "description", payload.description?.trim());
  appendOptional(formData, "directions", payload.directions?.trim());
  appendOptional(formData, "strength", payload.strength?.trim());
  appendOptional(formData, "form", payload.form?.trim());
  appendOptional(formData, "best_use_within", payload.best_use_within?.trim());
  appendOptional(formData, "dea_schedule", payload.dea_schedule?.trim());
  if (image) formData.append("image", image, image.name);
  return formData;
}

function buildUpdateProductFormData(payload: UpdateProductPayload, image?: File | null) {
  const formData = new FormData();
  appendOptional(formData, "product_name", payload.product_name?.trim());
  appendOptional(formData, "category_id", payload.category_id);
  appendOptional(formData, "description", payload.description?.trim());
  appendOptional(formData, "directions", payload.directions?.trim());
  appendOptional(formData, "stock_count", payload.stock_count);
  appendOptional(formData, "low_stock_threshold", payload.low_stock_threshold);
  appendOptional(formData, "clinic_cost", payload.clinic_cost);
  if (payload.active !== undefined) formData.append("active", String(payload.active));
  appendOptional(formData, "strength", payload.strength?.trim());
  appendOptional(formData, "form", payload.form?.trim());
  appendOptional(formData, "best_use_within", payload.best_use_within?.trim());
  appendOptional(formData, "dea_schedule", payload.dea_schedule?.trim());
  if (image) formData.append("image", image, image.name);
  return formData;
}

export async function listProducts(
  params: ListProductsParams = {},
): Promise<PaginatedProductsResponse> {
  return adminFetch<PaginatedProductsResponse>(
    `${INVENTORY_ADMIN_ENDPOINTS.products}${buildQuery(params)}`,
  );
}

export async function getProduct(productId: string): Promise<ProductResponse> {
  return adminFetch<ProductResponse>(INVENTORY_ADMIN_ENDPOINTS.product(productId));
}

export async function createProduct(payload: CreateProductPayload, image?: File | null) {
  return adminFetch<ProductResponse & { message: string }>(INVENTORY_ADMIN_ENDPOINTS.products, {
    method: "POST",
    body: buildCreateProductFormData(payload, image),
  });
}

export async function updateProduct(
  productId: string,
  payload: UpdateProductPayload,
  image?: File | null,
) {
  return adminFetch<ProductResponse>(INVENTORY_ADMIN_ENDPOINTS.product(productId), {
    method: "PUT",
    body: buildUpdateProductFormData(payload, image),
  });
}

export async function deleteProduct(productId: string) {
  return adminFetch<{ status: boolean; message: string; product_id: string }>(
    INVENTORY_ADMIN_ENDPOINTS.product(productId),
    { method: "DELETE" },
  );
}

export async function updateProductStock(productId: string, payload: UpdateStockPayload) {
  return adminFetch<ProductResponse>(INVENTORY_ADMIN_ENDPOINTS.productStock(productId), {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function uploadProductImages(productId: string, images: File[]) {
  const formData = new FormData();
  images.forEach((file) => formData.append("images", file, file.name));
  return adminFetch<{ status: boolean; message: string; images: { id: string; url: string; is_primary: boolean }[] }>(
    INVENTORY_ADMIN_ENDPOINTS.productImages(productId),
    {
      method: "POST",
      body: formData,
    },
  );
}

export async function listCategories(productType?: ProductType): Promise<CategoriesResponse> {
  return adminFetch<CategoriesResponse>(
    `${INVENTORY_ADMIN_ENDPOINTS.categories}${buildQuery({ product_type: productType })}`,
  );
}

export async function createCategory(payload: CreateCategoryPayload) {
  return adminFetch<{ status: boolean; message: string; category: CategoriesResponse["categories"][number] }>(
    INVENTORY_ADMIN_ENDPOINTS.categories,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
