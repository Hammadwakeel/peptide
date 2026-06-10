import type { CommerceClinicOrder } from "@/lib/orders/commerce-types";
import type {
  Order,
  OrderLineItem,
  OrderTimelineEntry,
  OrderTracking,
  PaymentStatus,
  ShipmentStatus,
} from "@/lib/orders/types";
import { buildTrackingUrl } from "@/lib/orders/types";

function mapPaymentStatus(value: string | null | undefined): PaymentStatus {
  switch (value) {
    case "paid":
      return "paid";
    case "failed":
      return "failed";
    case "refunded":
      return "refunded";
    case "partial_refund":
      return "partial_refund";
    default:
      return "pending";
  }
}

function mapShipmentStatus(value: string | null | undefined): ShipmentStatus {
  switch (value) {
    case "processing":
      return "processing";
    case "shipped":
    case "in_transit":
      return "shipped";
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
    default:
      return "not_shipped";
  }
}

function mapTracking(order: CommerceClinicOrder): OrderTracking | undefined {
  const row = order.tracking?.[0];
  if (!row?.tracking_number) return undefined;
  const carrier = (row.carrier ?? "fedex").toUpperCase();
  return {
    carrier,
    trackingNumber: row.tracking_number,
    shippedDate: row.shipped_at ? row.shipped_at.slice(0, 10) : null,
    trackingUrl: buildTrackingUrl(carrier, row.tracking_number),
  };
}

function buildTimeline(order: CommerceClinicOrder): OrderTimelineEntry[] {
  const entries: OrderTimelineEntry[] = [
    {
      id: `created-${order.id}`,
      date: order.created_at,
      status: "Order placed",
      note: `Order ${order.order_number} submitted by patient.`,
    },
  ];
  if (order.reviewed_at && order.review_status === "approved") {
    entries.unshift({
      id: `approved-${order.id}`,
      date: order.reviewed_at,
      status: "Approved",
      note: order.shipping_carrier
        ? `Approved for fulfillment (${order.shipping_carrier}).`
        : "Approved by physician.",
    });
  }
  if (order.review_status === "rejected" && order.rejection_reason) {
    entries.unshift({
      id: `rejected-${order.id}`,
      date: order.reviewed_at ?? order.created_at,
      status: "Rejected",
      note: order.rejection_reason,
    });
  }
  const tracking = order.tracking?.[0];
  if (tracking?.tracking_number) {
    entries.unshift({
      id: `shipped-${order.id}`,
      date: tracking.shipped_at ?? order.reviewed_at ?? order.created_at,
      status: "Shipped",
      note: `${tracking.carrier ?? "Carrier"} ${tracking.tracking_number}`,
    });
  }
  return entries;
}

export function mapClinicOrderToUi(order: CommerceClinicOrder): Order {
  const lineItems: OrderLineItem[] = (order.items ?? []).map((item) => ({
    id: item.id,
    productId: item.product_id,
    productName: item.product_name ?? "Product",
    sku: item.sku ?? "—",
    qty: item.qty,
    unitPrice: item.unit_price,
    total: item.total,
  }));

  return {
    id: order.id,
    orderNumber: order.order_number,
    orderType: "customer",
    customerId: order.patient_id,
    customerName: order.patient_name ?? undefined,
    doctorName: order.clinic_name ?? "Clinic",
    paymentDate:
      order.review_status === "approved" ? (order.reviewed_at?.slice(0, 10) ?? null) : null,
    paymentStatus: mapPaymentStatus(order.payment_status),
    shipmentStatus: mapShipmentStatus(order.shipment_status),
    reviewStatus: (order.review_status as Order["reviewStatus"]) ?? "pending_review",
    itemsCount: lineItems.reduce((sum, item) => sum + item.qty, 0),
    total: order.total_amount,
    netCost: order.net_cost ?? 0,
    profit: order.profit ?? 0,
    lineItems,
    patientEmail: order.patient_email ?? undefined,
    patientPhone: order.patient_phone ?? undefined,
    tracking: mapTracking(order),
    timeline: buildTimeline(order),
    clinicId: order.clinic_id,
    clinicName: order.clinic_name ?? "Clinic",
    notes: order.notes ?? undefined,
    rejectionReason: order.rejection_reason ?? undefined,
  };
}
