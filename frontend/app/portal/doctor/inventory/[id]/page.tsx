"use client";

import { useParams } from "next/navigation";
import { ProviderProductDetail } from "@/components/portal/provider/inventory/ProviderProductDetail";

export default function ProviderProductDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");

  return <ProviderProductDetail productId={id} />;
}
