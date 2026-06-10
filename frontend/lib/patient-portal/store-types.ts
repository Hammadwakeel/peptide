import type { CatalogProductType, CatalogStockStatus } from "@/lib/products/catalog-types";

export type PatientStoreProduct = {
  store_id: string;
  product_id: string;
  name: string;
  sku: string;
  slug: string | null;
  product_type: CatalogProductType | null;
  description: string | null;
  directions: string | null;
  category: {
    id: string | null;
    name: string | null;
    slug: string | null;
  };
  stock_status: CatalogStockStatus | null;
  stock_count: number | null;
  low_stock_threshold: number;
  retail_price: number;
  image_url: string | null;
  images: { url: string; is_primary?: boolean }[];
  is_visible: boolean;
  strength?: string | null;
  form?: string | null;
  best_use_within?: string | null;
  dea_schedule?: string | null;
};

export type PatientStoreClinic = {
  id: string;
  clinic_name: string;
};

export type PaginatedPatientStoreResponse = {
  status: boolean;
  products: PatientStoreProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  clinic: PatientStoreClinic;
};

export type PatientStoreProductResponse = {
  status: boolean;
  product: PatientStoreProduct;
  clinic: PatientStoreClinic;
};
