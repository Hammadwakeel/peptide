import type { Order, TrackingCsvRow } from "@/lib/orders/types";
import { buildTrackingUrl } from "@/lib/orders/types";

export const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-8821",
    orderType: "customer",
    customerId: "pat-001",
    customerName: "Sarah Chen",
    doctorName: "Dr. Rivera",
    paymentDate: "2026-03-02",
    paymentStatus: "paid",
    shipmentStatus: "delivered",
    itemsCount: 2,
    total: 249,
    netCost: 157,
    profit: 92,
    clinicId: "clinic-001",
    clinicName: "Frontier Wellness Clinic",
    patientEmail: "sarah.chen@email.com",
    patientPhone: "(415) 555-0182",
    lineItems: [
      {
        id: "li-1",
        productId: "prod-002",
        productName: "Semaglutide Pharmacy Grade",
        sku: "FR-SEMA-2.5MG",
        qty: 1,
        unitPrice: 210,
        total: 210,
      },
      {
        id: "li-2",
        productId: "prod-001",
        productName: "BPC-157 Research Peptide",
        sku: "FR-BPC157-5MG",
        qty: 1,
        unitPrice: 39,
        total: 39,
      },
    ],
    tracking: {
      carrier: "FedEx",
      trackingNumber: "794612345678",
      shippedDate: "2026-03-03",
      trackingUrl: buildTrackingUrl("FedEx", "794612345678"),
    },
    timeline: [
      { id: "t1", date: "2026-03-05T14:00:00", status: "Delivered", note: "Package delivered to recipient." },
      { id: "t2", date: "2026-03-03T09:15:00", status: "Shipped", note: "FedEx label created." },
      { id: "t3", date: "2026-03-02T11:30:00", status: "Paid", note: "Payment captured successfully." },
      { id: "t4", date: "2026-03-02T11:28:00", status: "Created", note: "Order placed by patient." },
    ],
  },
  {
    id: "ORD-8744",
    orderType: "customer",
    customerId: "pat-001",
    customerName: "Sarah Chen",
    doctorName: "Dr. Rivera",
    paymentDate: "2026-02-14",
    paymentStatus: "paid",
    shipmentStatus: "delivered",
    itemsCount: 1,
    total: 185,
    netCost: 120,
    profit: 65,
    clinicId: "clinic-001",
    clinicName: "Frontier Wellness Clinic",
    patientEmail: "sarah.chen@email.com",
    patientPhone: "(415) 555-0182",
    lineItems: [
      {
        id: "li-3",
        productId: "prod-002",
        productName: "Semaglutide Pharmacy Grade",
        sku: "FR-SEMA-2.5MG",
        qty: 1,
        unitPrice: 185,
        total: 185,
      },
    ],
    tracking: {
      carrier: "UPS",
      trackingNumber: "1Z999AA10123456784",
      shippedDate: "2026-02-15",
      trackingUrl: buildTrackingUrl("UPS", "1Z999AA10123456784"),
    },
    timeline: [
      { id: "t5", date: "2026-02-18T10:00:00", status: "Delivered", note: "Delivered." },
      { id: "t6", date: "2026-02-14T16:00:00", status: "Paid", note: "Payment captured." },
    ],
  },
  {
    id: "ORD-8702",
    orderType: "customer",
    customerId: "pat-002",
    customerName: "Marcus Webb",
    doctorName: "Dr. Kim",
    paymentDate: "2026-02-18",
    paymentStatus: "paid",
    shipmentStatus: "shipped",
    itemsCount: 1,
    total: 149,
    netCost: 89,
    profit: 60,
    clinicId: "clinic-001",
    clinicName: "Frontier Wellness Clinic",
    patientEmail: "marcus.webb@email.com",
    patientPhone: "(628) 555-0199",
    lineItems: [
      {
        id: "li-4",
        productId: "prod-001",
        productName: "BPC-157 Research Peptide",
        sku: "FR-BPC157-5MG",
        qty: 2,
        unitPrice: 74.5,
        total: 149,
      },
    ],
    tracking: {
      carrier: "USPS",
      trackingNumber: "9400111899223344556677",
      shippedDate: "2026-02-19",
      trackingUrl: buildTrackingUrl("USPS", "9400111899223344556677"),
    },
    timeline: [
      { id: "t7", date: "2026-02-19T08:00:00", status: "Shipped", note: "USPS Priority Mail." },
      { id: "t8", date: "2026-02-18T12:00:00", status: "Paid", note: "Payment captured." },
    ],
  },
  {
    id: "ORD-9010",
    orderType: "clinic",
    customerName: undefined,
    doctorName: "Dr. Rivera",
    paymentDate: "2026-03-04",
    paymentStatus: "paid",
    shipmentStatus: "processing",
    itemsCount: 3,
    total: 520,
    netCost: 380,
    profit: 140,
    clinicId: "clinic-001",
    clinicName: "Frontier Wellness Clinic",
    lineItems: [
      {
        id: "li-5",
        productId: "prod-002",
        productName: "Semaglutide Pharmacy Grade",
        sku: "FR-SEMA-2.5MG",
        qty: 2,
        unitPrice: 185,
        total: 370,
      },
      {
        id: "li-6",
        productId: "prod-001",
        productName: "BPC-157 Research Peptide",
        sku: "FR-BPC157-5MG",
        qty: 2,
        unitPrice: 75,
        total: 150,
      },
    ],
    timeline: [
      { id: "t9", date: "2026-03-04T14:00:00", status: "Processing", note: "Clinic restock order queued." },
      { id: "t10", date: "2026-03-04T13:55:00", status: "Paid", note: "Clinic account charged." },
    ],
  },
  {
    id: "ORD-9210",
    orderType: "customer",
    customerId: "pat-ext-2",
    customerName: "Lisa Nguyen",
    doctorName: "Dr. Patel",
    paymentDate: "2026-03-03",
    paymentStatus: "paid",
    shipmentStatus: "not_shipped",
    itemsCount: 2,
    total: 298,
    netCost: 210,
    profit: 88,
    clinicId: "clinic-002",
    clinicName: "Bay Area Regenerative",
    patientEmail: "l.nguyen@email.com",
    patientPhone: "(408) 555-0177",
    lineItems: [
      {
        id: "li-12",
        productId: "prod-002",
        productName: "Semaglutide Pharmacy Grade",
        sku: "FR-SEMA-2.5MG",
        qty: 1,
        unitPrice: 210,
        total: 210,
      },
      {
        id: "li-13",
        productId: "prod-001",
        productName: "BPC-157 Research Peptide",
        sku: "FR-BPC157-5MG",
        qty: 1,
        unitPrice: 88,
        total: 88,
      },
    ],
    timeline: [
      { id: "t15", date: "2026-03-03T10:00:00", status: "Paid", note: "Payment captured." },
      { id: "t16", date: "2026-03-03T09:58:00", status: "Created", note: "Order placed." },
    ],
  },
  {
    id: "ORD-9225",
    orderType: "customer",
    customerId: "pat-ext-3",
    customerName: "Robert Kim",
    doctorName: "Dr. Nguyen",
    paymentDate: "2026-02-28",
    paymentStatus: "paid",
    shipmentStatus: "not_shipped",
    itemsCount: 1,
    total: 185,
    netCost: 130,
    profit: 55,
    clinicId: "clinic-003",
    clinicName: "Pacific Peptide Partners",
    patientEmail: "r.kim@email.com",
    patientPhone: "(415) 555-0222",
    lineItems: [
      {
        id: "li-14",
        productId: "prod-003",
        productName: "TB-500 Research Peptide",
        sku: "FR-TB500-5MG",
        qty: 1,
        unitPrice: 185,
        total: 185,
      },
    ],
    timeline: [
      { id: "t17", date: "2026-02-28T15:00:00", status: "Paid", note: "Payment captured." },
    ],
  },
  {
    id: "ORD-9055",
    orderType: "customer",
    customerId: "pat-003",
    customerName: "Elena Vasquez",
    doctorName: "Dr. Kim",
    paymentDate: null,
    paymentStatus: "pending",
    shipmentStatus: "not_shipped",
    itemsCount: 1,
    total: 89,
    netCost: 72,
    profit: 17,
    clinicId: "clinic-001",
    clinicName: "Frontier Wellness Clinic",
    patientEmail: "elena.v@email.com",
    patientPhone: "(510) 555-0144",
    lineItems: [
      {
        id: "li-7",
        productId: "prod-001",
        productName: "BPC-157 Research Peptide",
        sku: "FR-BPC157-5MG",
        qty: 1,
        unitPrice: 89,
        total: 89,
      },
    ],
    timeline: [
      { id: "t11", date: "2026-03-05T10:00:00", status: "Pending Payment", note: "Awaiting patient payment." },
    ],
  },
  {
    id: "ORD-9100",
    orderType: "customer",
    customerId: "pat-002",
    customerName: "Marcus Webb",
    doctorName: "Dr. Kim",
    paymentDate: null,
    paymentStatus: "pending",
    shipmentStatus: "not_shipped",
    itemsCount: 2,
    total: 395,
    netCost: 290,
    profit: 105,
    clinicId: "clinic-001",
    clinicName: "Frontier Wellness Clinic",
    patientEmail: "marcus.webb@email.com",
    patientPhone: "(628) 555-0199",
    lineItems: [
      {
        id: "li-8",
        productId: "prod-002",
        productName: "Semaglutide Pharmacy Grade",
        sku: "FR-SEMA-2.5MG",
        qty: 1,
        unitPrice: 210,
        total: 210,
      },
      {
        id: "li-9",
        productId: "prod-003",
        productName: "TB-500 Research Peptide",
        sku: "FR-TB500-5MG",
        qty: 1,
        unitPrice: 185,
        total: 185,
      },
    ],
    timeline: [
      { id: "t12", date: "2026-03-06T09:00:00", status: "Pending Payment", note: "Invoice sent to patient." },
    ],
  },
  // Cross-clinic orders for admin
  {
    id: "ORD-8200",
    orderType: "customer",
    customerId: "pat-ext-1",
    customerName: "James Ortiz",
    doctorName: "Dr. Patel",
    paymentDate: "2026-03-01",
    paymentStatus: "paid",
    shipmentStatus: "shipped",
    itemsCount: 1,
    total: 210,
    netCost: 155,
    profit: 55,
    clinicId: "clinic-002",
    clinicName: "Bay Area Regenerative",
    patientEmail: "j.ortiz@email.com",
    patientPhone: "(650) 555-0101",
    lineItems: [
      {
        id: "li-10",
        productId: "prod-002",
        productName: "Semaglutide Pharmacy Grade",
        sku: "FR-SEMA-2.5MG",
        qty: 1,
        unitPrice: 210,
        total: 210,
      },
    ],
    tracking: {
      carrier: "FedEx",
      trackingNumber: "794699887766",
      shippedDate: "2026-03-02",
      trackingUrl: buildTrackingUrl("FedEx", "794699887766"),
    },
    timeline: [
      { id: "t13", date: "2026-03-02T11:00:00", status: "Shipped", note: "Outbound from fulfillment." },
    ],
    flagged: true,
  },
  {
    id: "ORD-8150",
    orderType: "clinic",
    doctorName: "Dr. Nguyen",
    paymentDate: "2026-02-28",
    paymentStatus: "paid",
    shipmentStatus: "delivered",
    itemsCount: 4,
    total: 680,
    netCost: 510,
    profit: 170,
    clinicId: "clinic-003",
    clinicName: "Pacific Peptide Partners",
    lineItems: [
      {
        id: "li-11",
        productId: "prod-001",
        productName: "BPC-157 Research Peptide",
        sku: "FR-BPC157-5MG",
        qty: 4,
        unitPrice: 170,
        total: 680,
      },
    ],
    timeline: [
      { id: "t14", date: "2026-03-01T16:00:00", status: "Delivered", note: "Clinic receiving dock." },
    ],
  },
];

export function getOrderById(id: string): Order | undefined {
  return MOCK_ORDERS.find((order) => order.id === id);
}

export function parseTrackingCsv(text: string): TrackingCsvRow[] {
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

    const orderExists = MOCK_ORDERS.some((order) => order.id === orderId);
    if (!orderExists) {
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

export const TRACKING_CSV_SAMPLE = `Order ID,Carrier,Tracking Number,Shipped Date
ORD-8821,FedEx,794612345678,2026-03-03
ORD-8702,USPS,9400111899223344556677,2026-02-19`;
