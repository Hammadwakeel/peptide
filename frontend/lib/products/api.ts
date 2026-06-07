import { adminFetch } from "@/lib/admin/client";
import { PROVIDER_INVENTORY_ENDPOINTS } from "@/lib/products/endpoints";
import type {
  CatalogProductResponse,
  CatalogProductType,
  CatalogStockStatus,
  PaginatedCatalogResponse,
  PaginatedStoreResponse,
} from "@/lib/products/catalog-types";

type ListCatalogParams = {
  page?: number;
  limit?: number;
  product_type?: CatalogProductType;
  category_id?: string;
  search?: string;
  stock_status?: CatalogStockStatus;
};

type ListStoreParams = {
  page?: number;
  limit?: number;
  search?: string;
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

export async function listCatalog(
  params: ListCatalogParams = {},
): Promise<PaginatedCatalogResponse> {
  return adminFetch<PaginatedCatalogResponse>(
    `${PROVIDER_INVENTORY_ENDPOINTS.catalog}${buildQuery(params)}`,
  );
}

export async function getCatalogProduct(slugOrId: string): Promise<CatalogProductResponse> {
  try {
    return await adminFetch<CatalogProductResponse>(
      PROVIDER_INVENTORY_ENDPOINTS.catalogProduct(slugOrId),
    );
  } catch {
    const response = await listCatalog({ page: 1, limit: 100 });
    const match = response.products.find(
      (product) => product.id === slugOrId || product.slug === slugOrId,
    );
    if (!match?.slug) {
      throw new Error("Product not found.");
    }
    return adminFetch<CatalogProductResponse>(
      PROVIDER_INVENTORY_ENDPOINTS.catalogProduct(match.slug),
    );
  }
}

export async function setCatalogRetailPrice(productId: string, retailPrice: number) {
  return adminFetch<{
    status: boolean;
    message: string;
    product_id: string;
    retail_price: number;
    store_id: string;
  }>(PROVIDER_INVENTORY_ENDPOINTS.setRetailPrice(productId), {
    method: "PATCH",
    body: JSON.stringify({ retail_price: retailPrice }),
  });
}

export async function listMyStore(
  params: ListStoreParams = {},
): Promise<PaginatedStoreResponse> {
  return adminFetch<PaginatedStoreResponse>(
    `${PROVIDER_INVENTORY_ENDPOINTS.storeProducts}${buildQuery(params)}`,
  );
}

export async function addToMyStore(productId: string, retailPrice: number, variantId?: string) {
  return adminFetch<{
    status: boolean;
    message: string;
    store_item: { store_id: string; product_id: string; retail_price: number };
  }>(PROVIDER_INVENTORY_ENDPOINTS.storeProducts, {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      retail_price: retailPrice,
      variant_id: variantId ?? null,
    }),
  });
}

export async function updateStoreProductPrice(
  storeId: string,
  retailPrice: number,
  active?: boolean,
) {
  return adminFetch<{
    status: boolean;
    message: string;
    store_item: { store_id: string; retail_price: number; active: boolean };
  }>(PROVIDER_INVENTORY_ENDPOINTS.storeProduct(storeId), {
    method: "PUT",
    body: JSON.stringify({
      retail_price: retailPrice,
      ...(active !== undefined ? { active } : {}),
    }),
  });
}

export async function removeFromStore(storeId: string) {
  return adminFetch<{ status: boolean; message: string }>(
    PROVIDER_INVENTORY_ENDPOINTS.storeProduct(storeId),
    { method: "DELETE" },
  );
}

export async function removeAllFromStore() {
  return adminFetch<{ status: boolean; message: string; removed_count: number }>(
    PROVIDER_INVENTORY_ENDPOINTS.storeProductsAll,
    { method: "DELETE" },
  );
}
