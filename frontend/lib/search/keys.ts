import type { FuseOptionKey } from "fuse.js";
import type { AdminClinic, AdminClinicPatient } from "@/lib/admin/types";
import type { DoctorPatient } from "@/lib/doctor/types";
import { doctorPatientFullName } from "@/lib/doctor/types";
import type { BrowseProduct, PatientHistoryOrder } from "@/lib/patient-portal/types";
import type { CatalogProduct, StoreProduct } from "@/lib/products/catalog-types";

const PATIENT_ORDER_STATUS_LABELS: Record<PatientHistoryOrder["status"], string> = {
  paid: "Approved",
  shipped: "Shipped",
  delivered: "Delivered",
};

export const DOCTOR_PATIENT_SEARCH_KEYS: FuseOptionKey<DoctorPatient>[] = [
  { name: "fullName", getFn: (patient) => doctorPatientFullName(patient), weight: 0.4 },
  { name: "email", weight: 0.3 },
  "phone",
];

export const ADMIN_CLINIC_SEARCH_KEYS: FuseOptionKey<AdminClinic>[] = [
  { name: "clinic_name", weight: 0.6 },
  { name: "email", weight: 0.4 },
];

export const ADMIN_CLINIC_PATIENT_SEARCH_KEYS: FuseOptionKey<AdminClinicPatient>[] = [
  {
    name: "fullName",
    getFn: (patient) => `${patient.first_name} ${patient.last_name}`,
    weight: 0.6,
  },
  { name: "email", weight: 0.4 },
];

export const ORDER_SEARCH_KEYS: FuseOptionKey<{
  id: string;
  orderNumber?: string | null;
  customerName?: string | null;
  clinicName?: string;
}>[] = [
  { name: "id", weight: 0.35 },
  { name: "orderNumber", weight: 0.35 },
  { name: "customerName", weight: 0.2 },
  { name: "clinicName", weight: 0.1 },
];

export const PATIENT_ORDER_HISTORY_KEYS: FuseOptionKey<PatientHistoryOrder>[] = [
  { name: "orderId", weight: 0.4 },
  { name: "reviewStatus", weight: 0.2 },
  {
    name: "statusLabel",
    getFn: (order) => PATIENT_ORDER_STATUS_LABELS[order.status],
    weight: 0.4,
  },
];

export const BROWSE_PRODUCT_SEARCH_KEYS: FuseOptionKey<BrowseProduct>[] = [
  { name: "name", weight: 0.5 },
  { name: "category", weight: 0.25 },
  { name: "shortDescription", weight: 0.25 },
];

export const CATALOG_PRODUCT_SEARCH_KEYS: FuseOptionKey<CatalogProduct>[] = [
  { name: "name", weight: 0.5 },
  { name: "sku", weight: 0.3 },
  { name: "category.name", weight: 0.2 },
];

export const STORE_PRODUCT_SEARCH_KEYS: FuseOptionKey<StoreProduct>[] = [
  { name: "name", weight: 0.5 },
  { name: "sku", weight: 0.3 },
  { name: "category.name", weight: 0.2 },
];

export const AFFILIATE_SEARCH_KEYS: FuseOptionKey<{
  email: string;
  affiliate_code: string;
}>[] = [
  { name: "email", weight: 0.5 },
  { name: "affiliate_code", weight: 0.5 },
];

export const HELP_ARTICLE_SEARCH_KEYS: FuseOptionKey<{
  title: string;
  category: string;
}>[] = [
  { name: "title", weight: 0.7 },
  { name: "category", weight: 0.3 },
];

export const AUDIT_LOG_SEARCH_KEYS: FuseOptionKey<{
  actor: string;
  action: string;
  entity: string;
}>[] = [
  { name: "actor", weight: 0.35 },
  { name: "action", weight: 0.35 },
  { name: "entity", weight: 0.3 },
];
