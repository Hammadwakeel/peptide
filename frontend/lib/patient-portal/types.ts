export type PatientPortalTab = "payments" | "orders" | "products" | "chat";

export type PatientPendingOrder = {
  id: string;
  orderId: string;
  doctorName: string;
  itemsCount: number;
  orderedOn: string;
  lineItems: {
    id: string;
    productName: string;
    qty: number;
    price: number;
  }[];
  total: number;
};

export type PatientHistoryOrder = {
  id: string;
  orderId: string;
  date: string;
  status: "paid" | "shipped" | "delivered";
  total: number;
  lineItems: {
    id: string;
    productName: string;
    qty: number;
    price: number;
  }[];
  tracking?: {
    carrier: string;
    trackingNumber: string;
    estimatedDelivery: string;
    trackingUrl: string;
  };
  receiptUrl?: string;
};

export type PatientProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  shippingAddresses: PatientShippingAddress[];
  paymentMethods: PatientPaymentMethod[];
  subscriptions: PatientSubscription[];
};

export type PatientShippingAddress = {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
};

export type PatientPaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

export type PatientSubscription = {
  id: string;
  productName: string;
  frequency: string;
  nextDate: string;
  status: "active" | "paused";
};

export type BrowseProduct = {
  id: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  directions: string;
  image: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
};

export type PayFlowStep = "summary" | "payment" | "processing" | "success" | "failure";

export const PATIENT_PORTAL_TABS: { href: string; label: string; key: PatientPortalTab }[] = [
  { href: "/portal/patient", label: "Pending Payments", key: "payments" },
  { href: "/portal/patient/orders", label: "Order History", key: "orders" },
  { href: "/portal/patient/products", label: "Browse Products", key: "products" },
  { href: "/portal/patient/chat", label: "Chat with Physician", key: "chat" },
];

export const REQUEST_PLACEHOLDER =
  "Please explain to the physician why you think this product would benefit you";
