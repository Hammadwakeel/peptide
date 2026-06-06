import { query } from "@frontier/shared/database";
import type { Order, OrderItem } from "@frontier/shared/database/types";

export async function listOrdersByClinic(clinicId: string, limit = 50) {
  return query<Order>(
    `SELECT * FROM orders
     WHERE clinic_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [clinicId, limit],
  );
}

export async function listOrdersByPatient(patientId: string) {
  return query<Order>(
    "SELECT * FROM orders WHERE patient_id = $1 ORDER BY created_at DESC",
    [patientId],
  );
}

export async function getOrderItems(orderId: string) {
  return query<OrderItem>(
    "SELECT * FROM order_items WHERE order_id = $1",
    [orderId],
  );
}

export async function listPendingPaymentOrders(clinicId: string) {
  return query(
    `SELECT o.*, ppo.payment_link, ppo.expires_at
     FROM orders o
     JOIN pending_payment_orders ppo ON ppo.order_id = o.id
     WHERE o.clinic_id = $1 AND o.payment_status = 'pending'
     ORDER BY o.created_at DESC`,
    [clinicId],
  );
}
