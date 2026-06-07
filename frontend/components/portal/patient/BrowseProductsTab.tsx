"use client";

import { useMemo, useState } from "react";
import { PatientProductCard } from "@/components/portal/patient/PatientProductCard";
import { ProductDetailModal } from "@/components/portal/patient/ProductDetailModal";
import { RequestFromDoctorModal } from "@/components/portal/patient/RequestFromDoctorModal";
import { usePatientPortal } from "@/context/PatientPortalProvider";
import type { BrowseProduct } from "@/lib/patient-portal/types";
import { toast } from "@/lib/toast";

export function BrowseProductsTab() {
  const { products, submitProductRequest } = usePatientPortal();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [detailProduct, setDetailProduct] = useState<BrowseProduct | null>(null);
  const [requestProduct, setRequestProduct] = useState<BrowseProduct | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.shortDescription.toLowerCase().includes(query),
    );
  }, [products, search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light text-deep-teal">Browse Products</h1>
          <p className="mt-1 text-sm text-deep-teal/55">{filtered.length} products</p>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full rounded-xl border border-deep-teal/15 px-3 py-2 text-sm outline-none focus:border-pacific-teal sm:max-w-xs"
        />
      </div>

      <div className="flex rounded-xl border border-deep-teal/15 p-1 w-fit">
        {(["grid", "list"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setView(mode)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${
              view === mode ? "bg-deep-teal text-pure-white" : "text-deep-teal/60"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
        {filtered.map((product) => (
          <PatientProductCard
            key={product.id}
            product={product}
            view={view}
            onInfo={() => setDetailProduct(product)}
            onRequest={() => setRequestProduct(product)}
          />
        ))}
      </div>

      <ProductDetailModal
        product={detailProduct}
        open={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
        onRequest={() => detailProduct && setRequestProduct(detailProduct)}
      />

      <RequestFromDoctorModal
        product={requestProduct}
        open={Boolean(requestProduct)}
        onClose={() => setRequestProduct(null)}
        onSubmit={(reason) => {
          if (requestProduct) {
            submitProductRequest(requestProduct, reason);
            toast.success("Request submitted to your physician.");
          }
        }}
      />
    </div>
  );
}
