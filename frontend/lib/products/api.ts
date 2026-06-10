import { adminFetch } from "@/lib/admin/client";
import { PROVIDER_INVENTORY_ENDPOINTS } from "@/lib/products/endpoints";
import type {
  CatalogProduct,
  CatalogProductResponse,
  CatalogProductType,
  CatalogStockStatus,
  PaginatedCatalogResponse,
  PaginatedStoreResponse,
  StoreProduct,
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

export function normalizeStoreProduct(item: StoreProduct): StoreProduct {
  return {
    ...item,
    category: item.category ?? {
      id: null,
      name: (item as StoreProduct & { category_name?: string }).category_name ?? null,
      slug: null,
    },
  };
}

export async function listCatalog(
  params: ListCatalogParams = {},
): Promise<PaginatedCatalogResponse> {
  return adminFetch<PaginatedCatalogResponse>(
    `${PROVIDER_INVENTORY_ENDPOINTS.catalog}${buildQuery(params)}`,
  );
}

export async function fetchAllCatalog(
  params: Omit<ListCatalogParams, "page" | "limit"> = {},
): Promise<CatalogProduct[]> {
  const limit = 500;
  let page = 1;
  const products: CatalogProduct[] = [];

  while (true) {
    const response = await listCatalog({ ...params, page, limit });
    products.push(...response.products);
    if (!response.pagination.has_next) break;
    page += 1;
  }

  return products;
}

export async function getCatalogProduct(slugOrId: string): Promise<CatalogProductResponse> {
  return adminFetch<CatalogProductResponse>(
    PROVIDER_INVENTORY_ENDPOINTS.catalogProduct(slugOrId),
  );
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
  const response = await adminFetch<PaginatedStoreResponse>(
    `${PROVIDER_INVENTORY_ENDPOINTS.storeProducts}${buildQuery(params)}`,
  );
  return {
    ...response,
    products: response.products.map(normalizeStoreProduct),
  };
}

export async function fetchAllMyStore(search?: string): Promise<StoreProduct[]> {
  const limit = 500;
  let page = 1;
  const products: StoreProduct[] = [];

  while (true) {
    const response = await listMyStore({ page, limit, search });
    products.push(...response.products);
    if (!response.pagination.has_next) break;
    page += 1;
  }

  return products;
}

export async function addToMyStore(productId: string, retailPrice: number, variantId?: string) {
  const response = await adminFetch<{
    status: boolean;
    message: string;
    store_item: StoreProduct;
  }>(PROVIDER_INVENTORY_ENDPOINTS.storeProducts, {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      retail_price: retailPrice,
      variant_id: variantId ?? null,
    }),
  });
  return {
    ...response,
    store_item: normalizeStoreProduct(response.store_item),
  };
}

export async function batchAddToMyStore(
  items: { product_id: string; retail_price: number; variant_id?: string }[],
) {
  const response = await adminFetch<{
    status: boolean;
    message: string;
    store_items: { store_id: string; product_id: string; retail_price: number }[];
  }>(PROVIDER_INVENTORY_ENDPOINTS.storeProductsBatch, {
    method: "POST",
    body: JSON.stringify({ items }),
  });
  return response;
}

export async function updateStoreProductPrice(storeId: string, retailPrice: number) {
  const response = await adminFetch<{
    status: boolean;
    message: string;
    store_item: StoreProduct;
  }>(PROVIDER_INVENTORY_ENDPOINTS.storeProduct(storeId), {
    method: "PUT",
    body: JSON.stringify({ retail_price: retailPrice }),
  });
  return {
    ...response,
    store_item: normalizeStoreProduct(response.store_item),
  };
}

export async function updateStoreProductVisibility(storeId: string, isVisible: boolean) {
  const response = await adminFetch<{
    status: boolean;
    message: string;
    store_item: StoreProduct;
  }>(PROVIDER_INVENTORY_ENDPOINTS.storeProductVisibility(storeId), {
    method: "PATCH",
    body: JSON.stringify({ is_visible: isVisible }),
  });
  return {
    ...response,
    store_item: normalizeStoreProduct(response.store_item),
  };
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
