export type CommerceOrderItem = {
  id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string | null;
  product_type: string | null;
  sku: string | null;
  qty: number;
  unit_price: number;
  unit_cost: number;
  total: number;
};

export type CommerceTracking = {
  id: string;
  carrier: string | null;
  tracking_number: string | null;
  status: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
};

export type CommercePatientOrder = {
  id: string;
  order_number: string;
  clinic_id: string;
  clinic_name?: string | null;
  payment_status?: string | null;
  shipment_status?: string | null;
  review_status?: string | null;
  total_amount: number;
  notes?: string | null;
  rejection_reason?: string | null;
  shipping_carrier?: string | null;
  created_at: string;
  reviewed_at?: string | null;
  items?: CommerceOrderItem[];
  tracking?: CommerceTracking[];
};

export type CommerceClinicOrder = CommercePatientOrder & {
  patient_id: string;
  patient_name: string | null;
  patient_email: string | null;
  patient_phone: string | null;
  net_cost: number | null;
  profit: number | null;
};

export type ReviewStatus = "pending_review" | "approved" | "rejected" | "cancelled";
