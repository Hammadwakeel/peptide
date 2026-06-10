import type { CommercePatientOrder } from "@/lib/orders/commerce-types";
import type { PatientHistoryOrder, PatientPendingOrder } from "@/lib/patient-portal/types";
import { buildTrackingUrl } from "@/lib/orders/types";

export type { CommercePatientOrder };

function mapLineItems(order: CommercePatientOrder) {
  return (order.items ?? []).map((item) => ({
    id: item.id,
    productName: item.product_name ?? "Product",
    qty: item.qty,
    price: item.unit_price,
  }));
}

function mapTracking(order: CommercePatientOrder): PatientHistoryOrder["tracking"] {
  const row = order.tracking?.[0];
  if (!row?.tracking_number) return undefined;
  const carrier = (row.carrier ?? "fedex").toUpperCase();
  return {
    carrier,
    trackingNumber: row.tracking_number,
    estimatedDelivery: row.delivered_at?.slice(0, 10) ?? "",
    trackingUrl: buildTrackingUrl(carrier, row.tracking_number),
  };
}

function mapHistoryStatus(order: CommercePatientOrder): PatientHistoryOrder["status"] {
  if (order.review_status === "rejected" || order.review_status === "cancelled") {
    return "paid";
  }
  if (order.shipment_status === "delivered") return "delivered";
  if (
    order.shipment_status === "shipped" ||
    order.shipment_status === "in_transit" ||
    order.shipment_status === "processing"
  ) {
    return "shipped";
  }
  return "paid";
}

export function mapCommerceOrder(order: CommercePatientOrder): PatientHistoryOrder {
  return {
    id: order.id,
    orderId: order.order_number,
    date: order.created_at.slice(0, 10),
    status: mapHistoryStatus(order),
    reviewStatus: (order.review_status as PatientHistoryOrder["reviewStatus"]) ?? undefined,
    shipmentStatus: order.shipment_status ?? undefined,
    rejectionReason: order.rejection_reason ?? undefined,
    total: order.total_amount,
    lineItems: mapLineItems(order),
    tracking: mapTracking(order),
    notes: order.notes ?? undefined,
  };
}

export function mapCommerceOrderToPending(
  order: CommercePatientOrder,
  doctorName: string,
): PatientPendingOrder {
  return {
    id: order.id,
    orderId: order.order_number,
    doctorName,
    itemsCount: order.items?.length ?? 0,
    orderedOn: order.created_at.slice(0, 10),
    lineItems: mapLineItems(order),
    total: order.total_amount,
    reviewStatus: "pending_review",
    notes: order.notes ?? undefined,
  };
}
