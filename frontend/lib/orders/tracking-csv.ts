import type { TrackingCsvRow } from "@/lib/orders/types";

export const TRACKING_CSV_HEADER = "Order ID,Carrier,Tracking Number,Shipped Date";

export function parseTrackingCsv(
  text: string,
  validOrderIds?: Set<string>,
): TrackingCsvRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  return lines.slice(1).map((line, index) => {
    const row = index + 2;
    const parts = line.split(",").map((part) => part.trim().replace(/^"|"$/g, ""));
    const [orderId, carrier, trackingNumber, shippedDate] = parts;

    if (!orderId || !carrier || !trackingNumber) {
      return {
        row,
        orderId: orderId ?? "",
        carrier: carrier ?? "",
        trackingNumber: trackingNumber ?? "",
        shippedDate: shippedDate ?? "",
        error: "Missing order ID, carrier, or tracking number",
      };
    }

    if (validOrderIds && !validOrderIds.has(orderId)) {
      return {
        row,
        orderId,
        carrier,
        trackingNumber,
        shippedDate: shippedDate ?? "",
        error: `Unknown order ID: ${orderId}`,
      };
    }

    return {
      row,
      orderId,
      carrier,
      trackingNumber,
      shippedDate: shippedDate ?? new Date().toISOString().slice(0, 10),
    };
  });
}
