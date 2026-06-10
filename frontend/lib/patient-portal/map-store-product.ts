import type { BrowseProduct } from "@/lib/patient-portal/types";
import type { PatientStoreProduct } from "@/lib/patient-portal/store-types";
import type { StockStatus } from "@/lib/products/types";

const DEFAULT_PRODUCT_IMAGE = "/brand/product-vial-2x-blend-hero.png";

function mapStockStatus(status: PatientStoreProduct["stock_status"]): StockStatus {
  if (status === "low") return "low_stock";
  if (status === "out_of_stock") return "out_of_stock";
  return "in_stock";
}

function primaryImage(product: PatientStoreProduct) {
  return (
    product.images.find((image) => image.is_primary)?.url ??
    product.images[0]?.url ??
    product.image_url ??
    DEFAULT_PRODUCT_IMAGE
  );
}

export function mapPatientStoreProduct(product: PatientStoreProduct): BrowseProduct {
  const description = product.description?.trim() ?? "";
  const shortDescription =
    description.length > 120 ? `${description.slice(0, 117).trimEnd()}…` : description;

  return {
    id: product.store_id,
    productId: product.product_id,
    name: product.name,
    category: product.category.name ?? "Uncategorized",
    shortDescription: shortDescription || "No description available.",
    description: description || "No description available.",
    directions: product.directions?.trim() || "Follow your physician's directions.",
    image: primaryImage(product),
    price: product.retail_price,
    stock: product.stock_count ?? 0,
    lowStockThreshold: product.low_stock_threshold,
    stockStatus: mapStockStatus(product.stock_status),
    productType: product.product_type,
  };
}
