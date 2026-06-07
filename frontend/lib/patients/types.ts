export type PatientStatus = "active" | "inactive";

export type PatientAddress = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
};

export type ShippingAddress = PatientAddress & {
  id: string;
  label: string;
  isDefault: boolean;
};

export type PaymentMethod = {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
};

export type PatientOrder = {
  id: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
};

export type ChatMessage = {
  id: string;
  sender: "provider" | "patient";
  content: string;
  sentAt: string;
};

export type PatientNote = {
  id: string;
  content: string;
  createdAt: string;
  author: string;
};

export type RequestStatus = "pending_review" | "approved" | "rejected";

export type ProductRequest = {
  id: string;
  productName: string;
  description: string;
  category: string;
  dateRequested: string;
  doctorName: string;
  price: number;
  requestReason: string;
  status: RequestStatus;
};

export type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  status: PatientStatus;
  totalOrders: number;
  lastOrderDate: string | null;
  avatarUrl?: string;
  address: PatientAddress;
  shippingAddresses: ShippingAddress[];
  paymentMethod: PaymentMethod;
  orders: PatientOrder[];
  chatMessages: ChatMessage[];
  notes: PatientNote[];
  requests: ProductRequest[];
};

export type PatientFilter = "all" | "active" | "inactive";

export type PatientProfileTab =
  | "orders"
  | "chat"
  | "notes"
  | "requests"
  | "information";

export type AddPatientPayload = {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: PatientAddress;
  sendInvite: boolean;
};

export const PATIENT_STATUS_LABELS: Record<PatientStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

export const ORDER_STATUS_LABELS: Record<PatientOrder["status"], string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  pending_review: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
};

export const PROFILE_TAB_LABELS: Record<PatientProfileTab, string> = {
  orders: "Order History",
  chat: "Chat Messages",
  notes: "Patient Notes",
  requests: "Requests",
  information: "Customer Information",
};

export function getPatientInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
