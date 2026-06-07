import { MOCK_PRODUCTS } from "@/lib/products/mock-data";
import { buildTrackingUrl } from "@/lib/orders/types";
import type {
  BrowseProduct,
  PatientHistoryOrder,
  PatientPendingOrder,
  PatientProfile,
} from "@/lib/patient-portal/types";

export const DEMO_PATIENT_ID = "pat-001";

export const CLINIC_BRANDING = {
  name: "Frontier Wellness",
  tagline: "Verified peptides. Unconditional trust.",
  themeColor: "#0d717b",
  logoUrl: null as string | null,
};

export const DEMO_PATIENT_PROFILE: PatientProfile = {
  id: DEMO_PATIENT_ID,
  name: "Sarah Chen",
  email: "patient@demo.frontierbiomed.com",
  phone: "(415) 555-0182",
  dateOfBirth: "1988-04-12",
  shippingAddresses: [
    {
      id: "addr-001",
      label: "Home",
      line1: "742 Valencia St",
      line2: "Apt 4B",
      city: "San Francisco",
      state: "CA",
      zip: "94110",
      isDefault: true,
    },
  ],
  paymentMethods: [
    {
      id: "pm-1",
      brand: "Visa",
      last4: "4242",
      expMonth: 8,
      expYear: 2028,
      isDefault: true,
    },
  ],
  subscriptions: [
    {
      id: "sub-1",
      productName: "BPC-157 Research Peptide",
      frequency: "Every 30 days",
      nextDate: "2026-04-02",
      status: "active",
    },
  ],
};

export const INITIAL_PENDING_ORDERS: PatientPendingOrder[] = [
  {
    id: "pending-1",
    orderId: "ORD-9055",
    doctorName: "Dr. Kim",
    itemsCount: 1,
    orderedOn: "2026-03-05",
    lineItems: [
      { id: "li-1", productName: "BPC-157 Research Peptide", qty: 1, price: 89 },
    ],
    total: 89,
  },
  {
    id: "pending-2",
    orderId: "ORD-9100",
    doctorName: "Dr. Kim",
    itemsCount: 2,
    orderedOn: "2026-03-06",
    lineItems: [
      { id: "li-2", productName: "Semaglutide Pharmacy Grade", qty: 1, price: 210 },
      { id: "li-3", productName: "TB-500 Research Blend", qty: 1, price: 185 },
    ],
    total: 395,
  },
];

export const INITIAL_HISTORY_ORDERS: PatientHistoryOrder[] = [
  {
    id: "hist-1",
    orderId: "ORD-8821",
    date: "2026-03-02",
    status: "delivered",
    total: 249,
    lineItems: [
      { id: "h-li-1", productName: "Semaglutide Pharmacy Grade", qty: 1, price: 210 },
      { id: "h-li-2", productName: "BPC-157 Research Peptide", qty: 1, price: 39 },
    ],
    tracking: {
      carrier: "FedEx",
      trackingNumber: "794612345678",
      estimatedDelivery: "2026-03-05",
      trackingUrl: buildTrackingUrl("FedEx", "794612345678"),
    },
    receiptUrl: "#receipt-ORD-8821",
  },
  {
    id: "hist-2",
    orderId: "ORD-8744",
    date: "2026-02-14",
    status: "delivered",
    total: 185,
    lineItems: [
      { id: "h-li-3", productName: "Semaglutide Pharmacy Grade", qty: 1, price: 185 },
    ],
    tracking: {
      carrier: "UPS",
      trackingNumber: "1Z999AA10123456784",
      estimatedDelivery: "2026-02-18",
      trackingUrl: buildTrackingUrl("UPS", "1Z999AA10123456784"),
    },
    receiptUrl: "#receipt-ORD-8744",
  },
  {
    id: "hist-3",
    orderId: "ORD-8702",
    date: "2026-02-18",
    status: "shipped",
    total: 149,
    lineItems: [
      { id: "h-li-4", productName: "BPC-157 Research Peptide", qty: 2, price: 149 },
    ],
    tracking: {
      carrier: "USPS",
      trackingNumber: "9400111899223344556677",
      estimatedDelivery: "2026-02-22",
      trackingUrl: buildTrackingUrl("USPS", "9400111899223344556677"),
    },
    receiptUrl: "#receipt-ORD-8702",
  },
];

export const BROWSE_PRODUCTS: BrowseProduct[] = MOCK_PRODUCTS.filter(
  (product) => product.status === "active",
).map((product) => ({
  id: product.id,
  name: product.name,
  category: product.category,
  shortDescription: product.shortDescription,
  description: product.description.replace(/<[^>]+>/g, ""),
  directions: product.directions,
  image: product.images[0],
  price: Math.ceil(product.clinicPrice * 1.35),
  stock: product.stock,
  lowStockThreshold: product.lowStockThreshold,
}));

export function getHistoryOrderById(id: string): PatientHistoryOrder | undefined {
  return INITIAL_HISTORY_ORDERS.find(
    (order) => order.id === id || order.orderId === id,
  );
}
