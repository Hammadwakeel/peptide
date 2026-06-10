export type OrderTab = "pending_review" | "approved" | "rejected" | "all";

export type ReviewStatus = "pending_review" | "approved" | "rejected" | "cancelled";

export type PaymentStatus = "paid" | "pending" | "failed" | "refunded" | "partial_refund";

export type ShipmentStatus =
  | "not_shipped"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderType = "customer" | "clinic";

export type OrderLineItem = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  qty: number;
  unitPrice: number;
  total: number;
};

export type OrderTimelineEntry = {
  id: string;
  date: string;
  status: string;
  note: string;
};

export type OrderTracking = {
  carrier: string;
  trackingNumber: string;
  shippedDate: string | null;
  trackingUrl?: string;
};

export type Order = {
  id: string;
  orderNumber?: string;
  orderType: OrderType;
  reviewStatus?: ReviewStatus;
  customerId?: string;
  customerName?: string;
  doctorName: string;
  paymentDate: string | null;
  paymentStatus: PaymentStatus;
  shipmentStatus: ShipmentStatus;
  itemsCount: number;
  total: number;
  netCost: number;
  profit: number;
  lineItems: OrderLineItem[];
  patientEmail?: string;
  patientPhone?: string;
  tracking?: OrderTracking;
  timeline: OrderTimelineEntry[];
  clinicId: string;
  clinicName: string;
  flagged?: boolean;
  notes?: string;
  rejectionReason?: string;
};

export type CartLineItem = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  qty: number;
  unitPrice: number;
};

export type TrackingCsvRow = {
  row: number;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  shippedDate: string;
  error?: string;
};

export const ORDER_TAB_LABELS: Record<OrderTab, string> = {
  pending_review: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  all: "All Orders",
};

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  pending_review: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
  partial_refund: "Partial Refund",
};

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  not_shipped: "Not Shipped",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const CARRIER_OPTIONS = ["UPS", "FedEx", "USPS", "DHL"] as const;

export type Carrier = (typeof CARRIER_OPTIONS)[number];

export function buildTrackingUrl(carrier: string, trackingNumber: string): string {
  const encoded = encodeURIComponent(trackingNumber);
  switch (carrier.toLowerCase()) {
    case "ups":
      return `https://www.ups.com/track?tracknum=${encoded}`;
    case "fedex":
      return `https://www.fedex.com/fedextrack/?trknbr=${encoded}`;
    case "usps":
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encoded}`;
    case "dhl":
      return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${encoded}`;
    default:
      return `https://www.google.com/search?q=${encodeURIComponent(`${carrier} tracking ${trackingNumber}`)}`;
  }
}

export function ordersToCsv(orders: Order[]): string {
  const header = "Order ID,Customer,Doctor,Payment Date,Payment Status,Shipment Status,Items,Total,Net Cost,Profit";
  const rows = orders.map(
    (order) =>
      `${order.orderNumber ?? order.id},"${order.customerName ?? "Clinic"}",${order.doctorName},${order.paymentDate ?? ""},${order.paymentStatus},${order.shipmentStatus},${order.itemsCount},${order.total},${order.netCost},${order.profit}`,
  );
  return [header, ...rows].join("\n");
}
