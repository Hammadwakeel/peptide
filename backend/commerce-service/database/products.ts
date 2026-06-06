import { query } from "@frontier/shared/database";
import type { ClinicStoreProduct, Product } from "@frontier/shared/database/types";

export async function listMasterCatalog(productType?: "ruo" | "pharmacy") {
  if (productType) {
    return query<Product>(
      "SELECT * FROM products WHERE active = TRUE AND product_type = $1 ORDER BY product_name",
      [productType],
    );
  }
  return query<Product>(
    "SELECT * FROM products WHERE active = TRUE ORDER BY product_name",
  );
}

export async function listClinicStore(clinicId: string) {
  return query<ClinicStoreProduct & { product_name: string }>(
    `SELECT csp.*, p.product_name, p.stock_status, p.product_type
     FROM clinic_store_products csp
     JOIN products p ON p.id = csp.product_id
     WHERE csp.clinic_id = $1 AND csp.active = TRUE
     ORDER BY p.product_name`,
    [clinicId],
  );
}

export async function listCategories() {
  return query("SELECT * FROM categories WHERE active = TRUE ORDER BY sort_order");
}
