"use client";

import { useParams } from "next/navigation";
import { ProviderProductDetail } from "@/components/portal/provider/inventory/ProviderProductDetail";

export default function ProviderProductDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");

  return (
    <div className="rounded-[2rem] border border-deep-teal/10 bg-pure-white p-4 shadow-sm sm:p-6">
      <ProviderProductDetail productId={id} />
    </div>
  );
}
