"use client";

import { useMemo, useState } from "react";
import { LayoutGrid } from "lucide-react";
import { PatientProductCard } from "@/components/portal/patient/PatientProductCard";
import { ProductDetailModal } from "@/components/portal/patient/ProductDetailModal";
import { PlaceOrderModal } from "@/components/portal/patient/PlaceOrderModal";
import { RequestFromDoctorModal } from "@/components/portal/patient/RequestFromDoctorModal";
import { PortalPageSection } from "@/components/portal/shared/PortalPageSection";
import { PortalPageToolbar } from "@/components/portal/shared/PortalPageToolbar";
import { usePatientPortal } from "@/context/PatientPortalProvider";
import type { BrowseProduct } from "@/lib/patient-portal/types";
import { fuseSearch } from "@/lib/search/fuse";
import { BROWSE_PRODUCT_SEARCH_KEYS } from "@/lib/search/keys";
import { toast } from "@/lib/toast";

export function BrowseProductsTab() {
  const { products, productsLoading, productsError, clinicName, submitProductRequest } =
    usePatientPortal();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [detailProduct, setDetailProduct] = useState<BrowseProduct | null>(null);
  const [requestProduct, setRequestProduct] = useState<BrowseProduct | null>(null);
  const [orderProduct, setOrderProduct] = useState<BrowseProduct | null>(null);

  const filtered = useMemo(
    () => fuseSearch(products, search, BROWSE_PRODUCT_SEARCH_KEYS),
    [products, search],
  );

  return (
    <div className="space-y-5">
      <PortalPageToolbar title="Browse Products">
        <div className="flex rounded-full border border-deep-teal/15 p-1">
          {(["grid", "list"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${
                view === mode ? "bg-deep-teal text-pure-white" : "text-deep-teal/60"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </PortalPageToolbar>

      <PortalPageSection
        icon={LayoutGrid}
        title="Clinic store"
        subtitle={
          productsLoading
            ? "Loading…"
            : clinicName
              ? `${clinicName} · ${filtered.length} product${filtered.length === 1 ? "" : "s"}`
              : `${filtered.length} product${filtered.length === 1 ? "" : "s"}`
        }
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="mb-5 w-full rounded-full border border-deep-teal/15 px-4 py-2 text-sm outline-none focus:border-pacific-teal sm:max-w-sm"
        />

        {productsError ? (
          <p className="mb-4 rounded-xl border border-coral-blush bg-coral-blush/30 px-4 py-3 text-sm text-deep-teal/70">
            {productsError}
          </p>
        ) : null}

        {!productsLoading && !productsError && filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-deep-teal/50">
            No products are available in your clinic store yet.
          </p>
        ) : (
          <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
            {filtered.map((product) => (
              <PatientProductCard
                key={product.id}
                product={product}
                view={view}
                onInfo={() => setDetailProduct(product)}
                onRequest={() => setRequestProduct(product)}
                onOrder={() => setOrderProduct(product)}
              />
            ))}
          </div>
        )}
      </PortalPageSection>

      <ProductDetailModal
        product={detailProduct}
        open={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
        onRequest={() => detailProduct && setRequestProduct(detailProduct)}
        onOrder={() => detailProduct && setOrderProduct(detailProduct)}
      />

      <PlaceOrderModal
        product={orderProduct}
        open={Boolean(orderProduct)}
        onClose={() => setOrderProduct(null)}
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
