import type { Order } from "@/lib/orders/types";
import type { StoreProduct } from "@/lib/products/catalog-types";

export type ProviderDashboardStats = {
  pendingReviewCount: number;
  activeShipments: number;
  visibleStoreProducts: number;
  patientCount: number;
};

export function computeProviderDashboardStats(
  orders: Order[],
  patientCount: number,
  myStore: StoreProduct[],
): ProviderDashboardStats {
  return {
    pendingReviewCount: orders.filter((order) => order.reviewStatus === "pending_review").length,
    activeShipments: orders.filter(
      (order) =>
        order.reviewStatus === "approved" &&
        order.shipmentStatus !== "delivered" &&
        order.shipmentStatus !== "cancelled",
    ).length,
    visibleStoreProducts: myStore.filter((product) => product.is_visible).length,
    patientCount,
  };
}
