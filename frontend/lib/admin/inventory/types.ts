export type ProductType = "ruo" | "pharmacy";

export type StockStatus = "in_stock" | "low" | "out_of_stock";

export type InventoryCategory = {
  id: string;
  name: string;
  slug: string | null;
  description?: string | null;
  sort_order?: number;
};

export type InventoryProductImage = {
  url: string;
  is_primary?: boolean;
  id?: string;
};

export type InventoryProduct = {
  id: string;
  name: string;
  slug: string | null;
  sku: string;
  description: string | null;
  short_description: string | null;
  product_type: ProductType;
  form: string | null;
  strength: string | null;
  best_use_within: string | null;
  dea_schedule: string | null;
  directions: string | null;
  stock_status: StockStatus;
  stock_count: number;
  low_stock_threshold: number;
  status: "ACTIVE" | "INACTIVE";
  category: {
    id: string | null;
    name: string | null;
    slug: string | null;
  };
  variant_id: string | null;
  images: InventoryProductImage[];
  coa_doc_url: string | null;
  created_at: string;
  clinic_cost: number | null;
};

export type AdminPagination = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
};

export type PaginatedProductsResponse = {
  status: boolean;
  products: InventoryProduct[];
  pagination: AdminPagination;
};

export type ProductResponse = {
  status: boolean;
  product: InventoryProduct;
  message?: string;
};

export type CategoriesResponse = {
  status: boolean;
  categories: InventoryCategory[];
};

export type CreateCategoryPayload = {
  name: string;
  description?: string;
  sort_order?: number;
};

export type CreateProductPayload = {
  sku: string;
  product_name: string;
  category_id?: string;
  product_type?: ProductType;
  description?: string;
  directions?: string;
  stock_count?: number;
  low_stock_threshold?: number;
  clinic_cost: number;
  strength?: string;
  form?: string;
  best_use_within?: string;
  dea_schedule?: string;
};

export type UpdateProductPayload = {
  product_name?: string;
  category_id?: string;
  description?: string;
  directions?: string;
  stock_count?: number;
  low_stock_threshold?: number;
  clinic_cost?: number;
  active?: boolean;
  strength?: string;
  form?: string;
  best_use_within?: string;
  dea_schedule?: string;
};

export type UpdateStockPayload = {
  stock_count: number;
  low_stock_threshold?: number;
};

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  ruo: "Research (RUO)",
  pharmacy: "Pharmacy",
};

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  in_stock: "In stock",
  low: "Low stock",
  out_of_stock: "Out of stock",
};
