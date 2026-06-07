export type ProductType = "research" | "pharmacy";
export type ProductStatus = "active" | "draft" | "archived";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type ProductVariant = {
  id: string;
  size: string;
  strength: string;
  price: number;
  imageUrl: string;
};

export type PricingTier = {
  id: string;
  minQty: number;
  maxQty: number | null;
  unitPrice: number;
};

export type StockHistoryEntry = {
  id: string;
  date: string;
  change: number;
  quantity: number;
  note: string;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  type: ProductType;
  status: ProductStatus;
  stock: number;
  lowStockThreshold: number;
  price: number;
  clinicPrice: number;
  shortDescription: string;
  description: string;
  images: string[];
  coaFileName?: string;
  variants: ProductVariant[];
  pricingTiers: PricingTier[];
  form: string;
  strength: string;
  bestUseWithin: string;
  deaSchedule: string;
  productTypeLabel: string;
  directions: string;
  stockHistory: StockHistoryEntry[];
};

export type ProductFormState = Omit<Product, "id" | "stockHistory"> & {
  id?: string;
};

export type CsvImportRow = {
  row: number;
  sku: string;
  name: string;
  category: string;
  type: ProductType;
  price: number;
  stock: number;
  error?: string;
};

export type InventoryFilter = "all" | "category" | "favorites" | "stock";
export type InventoryView = "grid" | "list";

export function getStockStatus(product: Pick<Product, "stock" | "lowStockThreshold">): StockStatus {
  if (product.stock <= 0) return "out_of_stock";
  if (product.stock <= product.lowStockThreshold) return "low_stock";
  return "in_stock";
}

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  in_stock: "In stock",
  low_stock: "Low stock",
  out_of_stock: "Out of stock",
};

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  research: "Research Use Only",
  pharmacy: "Pharmacy",
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  active: "Active",
  draft: "Draft",
  archived: "Archived",
};
