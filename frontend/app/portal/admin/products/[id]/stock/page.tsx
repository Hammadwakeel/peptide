"use client";

import { useParams } from "next/navigation";
import { AdminStockPanel } from "@/components/portal/admin/products/AdminStockPanel";

export default function AdminStockPage() {
  const params = useParams();
  const id = String(params.id ?? "");

  return <AdminStockPanel productId={id} />;
}
