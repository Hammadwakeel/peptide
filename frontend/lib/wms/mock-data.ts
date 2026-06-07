import type {
  CarrierBreakdownPoint,
  FulfillmentTrendPoint,
  InventoryAlert,
  WmsDashboardMetrics,
} from "@/lib/wms/types";

export const WMS_DASHBOARD_METRICS: WmsDashboardMetrics = {
  pendingShipments: 14,
  avgDaysToShip: 1.8,
  lateOrders: 3,
  onTimeRate: 94,
};

export const FULFILLMENT_TREND_30D: FulfillmentTrendPoint[] = [
  { date: "Feb 6", avgDays: 2.4 },
  { date: "Feb 10", avgDays: 2.1 },
  { date: "Feb 14", avgDays: 2.0 },
  { date: "Feb 18", avgDays: 1.9 },
  { date: "Feb 22", avgDays: 2.2 },
  { date: "Feb 26", avgDays: 1.7 },
  { date: "Mar 2", avgDays: 1.8 },
  { date: "Mar 6", avgDays: 1.6 },
];

export const CARRIER_BREAKDOWN: CarrierBreakdownPoint[] = [
  { name: "FedEx", value: 42 },
  { name: "UPS", value: 31 },
  { name: "USPS", value: 19 },
  { name: "DHL", value: 8 },
];

export const RETURN_RATE_PERCENT = 1.4;

export const INVENTORY_ALERTS: InventoryAlert[] = [
  {
    id: "alert-001",
    productId: "prod-002",
    productName: "Semaglutide Pharmacy Grade",
    sku: "FR-SEMA-2.5MG",
    currentStock: 18,
    threshold: 20,
    level: "low_stock",
  },
  {
    id: "alert-002",
    productId: "prod-003",
    productName: "TB-500 Research Blend",
    sku: "FR-TB500-2MG",
    currentStock: 0,
    threshold: 15,
    level: "out_of_stock",
  },
  {
    id: "alert-003",
    productId: "prod-001",
    productName: "BPC-157 Research Peptide",
    sku: "FR-BPC157-5MG",
    currentStock: 22,
    threshold: 25,
    level: "low_stock",
  },
];
