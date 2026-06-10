export type CatalogProductType = "peptides" | "pharmacy";

export type CatalogStockStatus = "in_stock" | "low" | "out_of_stock";

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string | null;
  sku: string;
  product_type: CatalogProductType;
  description: string | null;
  directions: string | null;
  stock_status: CatalogStockStatus;
  stock_count: number;
  low_stock_threshold: number;
  status: "ACTIVE" | "INACTIVE";
  category: {
    id: string | null;
    name: string | null;
    slug: string | null;
  };
  images: { url: string; is_primary?: boolean }[];
  created_at: string;
  clinic_cost: number | null;
  in_my_store?: boolean;
  strength?: string | null;
  form?: string | null;
  best_use_within?: string | null;
  dea_schedule?: string | null;
};

export type StoreProduct = {
  store_id: string;
  product_id: string;
  name: string;
  sku: string;
  product_type: CatalogProductType | null;
  description: string | null;
  category: {
    id: string | null;
    name: string | null;
    slug: string | null;
  };
  stock_status: CatalogStockStatus | null;
  stock_count: number | null;
  clinic_cost: number | null;
  retail_price: number;
  image_url: string | null;
  is_visible: boolean;
  strength?: string | null;
  form?: string | null;
  dea_schedule?: string | null;
};

export type CatalogPagination = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
};

export type PaginatedCatalogResponse = {
  status: boolean;
  products: CatalogProduct[];
  pagination: CatalogPagination;
};

export type CatalogProductResponse = {
  status: boolean;
  product: CatalogProduct;
};

export type PaginatedStoreResponse = {
  status: boolean;
  products: StoreProduct[];
  pagination: CatalogPagination;
  clinic_id: string;
  clinic_name: string;
};

export const CATALOG_PRODUCT_TYPE_LABELS: Record<CatalogProductType, string> = {
  peptides: "Peptides",
  pharmacy: "Pharmacy",
};

export const CATALOG_STOCK_STATUS_LABELS: Record<CatalogStockStatus, string> = {
  in_stock: "In stock",
  low: "Low stock",
  out_of_stock: "Out of stock",
};

export function defaultRetailPrice(clinicCost: number | null | undefined) {
  if (clinicCost == null || clinicCost <= 0) return 0;
  return Math.ceil(clinicCost * 1.35 * 100) / 100;
}

export function getPrimaryImage(product: Pick<CatalogProduct, "images">) {
  return product.images.find((image) => image.is_primary)?.url ?? product.images[0]?.url ?? null;
}
