export type InventoryAlertLevel = "low_stock" | "out_of_stock";

export type InventoryAlert = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  threshold: number;
  level: InventoryAlertLevel;
};

export type WmsDashboardMetrics = {
  pendingShipments: number;
  avgDaysToShip: number;
  lateOrders: number;
  onTimeRate: number;
};

export type FulfillmentTrendPoint = {
  date: string;
  avgDays: number;
};

export type CarrierBreakdownPoint = {
  name: string;
  value: number;
};
