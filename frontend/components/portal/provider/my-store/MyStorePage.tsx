"use client";

import { useMemo, useState } from "react";
import { AddItemsModal } from "@/components/portal/provider/my-store/AddItemsModal";
import { MyStoreProductCard } from "@/components/portal/provider/my-store/MyStoreProductCard";
import { useProviderPortal } from "@/context/ProviderPortalProvider";
import { MOCK_PRODUCTS } from "@/lib/products/mock-data";
import { toast } from "@/lib/toast";

export function MyStorePage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const {
    myStore,
    addToMyStore,
    removeFromMyStore,
    removeAllFromMyStore,
    updateRetailPrice,
  } = useProviderPortal();

  const storeProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return myStore
      .map((entry) => {
        const product = MOCK_PRODUCTS.find((item) => item.id === entry.productId);
        if (!product) return null;
        return { entry, product };
      })
      .filter((item): item is NonNullable<typeof item> => {
        if (!item) return false;
        if (!query) return true;
        return (
          item.product.name.toLowerCase().includes(query) ||
          item.product.category.toLowerCase().includes(query) ||
          item.product.sku.toLowerCase().includes(query)
        );
      });
  }, [myStore, search]);

  const excludedIds = useMemo(() => new Set(myStore.map((entry) => entry.productId)), [myStore]);

  function handleRemoveAll() {
    if (myStore.length === 0) return;
    removeAllFromMyStore();
    toast.success("All items removed from My Store.");
  }

  function handleAddSelected(productIds: string[]) {
    addToMyStore(productIds);
    toast.success(
      productIds.length === 1
        ? "1 item added to My Store."
        : `${productIds.length} items added to My Store.`,
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-deep-teal/10 bg-deep-teal/[0.02] px-4 py-4 sm:px-5">
        <p className="text-sm leading-relaxed text-deep-teal/70">
          These are the items your customers see. They won&apos;t see your clinic price.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search My Store…"
          className="w-full rounded-xl border border-deep-teal/15 px-3 py-2 text-sm outline-none focus:border-pacific-teal sm:max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white hover:bg-pacific-teal"
          >
            Add Items
          </button>
          <button
            type="button"
            onClick={handleRemoveAll}
            disabled={myStore.length === 0}
            className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm font-medium text-deep-teal hover:border-coral-blush hover:text-coral-blush disabled:cursor-not-allowed disabled:opacity-40"
          >
            Remove All
          </button>
        </div>
      </div>

      {storeProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-deep-teal/15 px-6 py-16 text-center">
          <p className="font-serif text-xl font-light text-deep-teal">Your store is empty</p>
          <p className="mt-2 text-sm text-deep-teal/55">
            Add products from the catalog to make them visible to your customers.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-6 rounded-full bg-deep-teal px-5 py-2.5 text-sm font-medium text-pure-white hover:bg-pacific-teal"
          >
            Add Items
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {storeProducts.map(({ entry, product }) => (
            <MyStoreProductCard
              key={entry.productId}
              product={product}
              retailPrice={entry.retailPrice}
              onRetailPriceChange={(price) => updateRetailPrice(entry.productId, price)}
              onRemove={() => {
                removeFromMyStore(entry.productId);
                toast.success(`${product.name} removed from My Store.`);
              }}
            />
          ))}
        </div>
      )}

      <AddItemsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        excludedIds={excludedIds}
        onAddSelected={handleAddSelected}
      />
    </div>
  );
}
