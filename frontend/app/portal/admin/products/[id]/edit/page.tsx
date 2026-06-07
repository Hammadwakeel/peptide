"use client";

import { useParams } from "next/navigation";
import { AdminProductForm } from "@/components/portal/admin/products/AdminProductForm";

export default function AdminEditProductPage() {
  const params = useParams();
  const id = String(params.id ?? "");

  return (
    <div className="rounded-[2rem] border border-deep-teal/10 bg-pure-white p-4 shadow-sm sm:p-6">
      <AdminProductForm productId={id} />
    </div>
  );
}
