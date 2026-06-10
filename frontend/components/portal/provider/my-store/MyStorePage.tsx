"use client";

import { useMemo, useState } from "react";
import { AddItemsModal } from "@/components/portal/provider/my-store/AddItemsModal";
import { MyStoreProductCard } from "@/components/portal/provider/my-store/MyStoreProductCard";
import { useProviderPortal } from "@/context/ProviderPortalProvider";
import { showError, toast } from "@/lib/toast";

export function MyStorePage() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingStoreId, setUpdatingStoreId] = useState<string | null>(null);
  const {
    myStore,
    isStoreLoading,
    refreshMyStore,
    addToMyStore,
    removeFromMyStore,
    removeAllFromMyStore,
    updateRetailPrice,
    setStoreVisibility,
  } = useProviderPortal();

  const excludedIds = useMemo(() => new Set(myStore.map((entry) => entry.product_id)), [myStore]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return myStore;
    return myStore.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        (product.category.name?.toLowerCase().includes(query) ?? false),
    );
  }, [myStore, search]);

  async function handleRemoveAll() {
    if (myStore.length === 0) return;
    try {
      await removeAllFromMyStore();
      toast.success("All items removed from My Store.");
    } catch (error) {
      showError(error, "Unable to remove all items.");
    }
  }

  async function handleAddSelected(items: { productId: string; retailPrice: number }[]) {
    try {
      await addToMyStore(items);
      toast.success(
        items.length === 1
          ? "1 item added to My Store."
          : `${items.length} items added to My Store.`,
      );
    } catch (error) {
      showError(error, "Unable to add items to My Store.");
    }
  }

  async function handleRemove(storeId: string, name: string) {
    setUpdatingStoreId(storeId);
    try {
      await removeFromMyStore(storeId);
      toast.success(`${name} removed from My Store.`);
    } catch (error) {
      showError(error, "Unable to remove item.");
    } finally {
      setUpdatingStoreId(null);
    }
  }

  async function handlePriceChange(storeId: string, retailPrice: number) {
    setUpdatingStoreId(storeId);
    try {
      await updateRetailPrice(storeId, retailPrice);
      toast.success("Retail price updated.");
    } catch (error) {
      showError(error, "Unable to update retail price.");
    } finally {
      setUpdatingStoreId(null);
    }
  }

  async function handleVisibilityChange(storeId: string, isVisible: boolean) {
    setUpdatingStoreId(storeId);
    try {
      await setStoreVisibility(storeId, isVisible);
      toast.success(isVisible ? "Product is now visible." : "Product hidden from customers.");
    } catch (error) {
      showError(error, "Unable to update visibility.");
    } finally {
      setUpdatingStoreId(null);
    }
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
            onClick={() => void handleRemoveAll()}
            disabled={myStore.length === 0 || isStoreLoading}
            className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm font-medium text-deep-teal hover:border-coral-blush hover:text-coral-blush disabled:cursor-not-allowed disabled:opacity-40"
          >
            Remove All
          </button>
          <button
            type="button"
            onClick={() => void refreshMyStore()}
            className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm font-medium text-deep-teal hover:border-pacific-teal"
          >
            Refresh
          </button>
        </div>
      </div>

      {isStoreLoading ? (
        <p className="py-12 text-center text-sm text-deep-teal/50">Loading My Store…</p>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-deep-teal/15 px-6 py-16 text-center">
          <p className="font-serif text-xl font-light text-deep-teal">
            {myStore.length === 0 ? "Your store is empty" : "No items match your search"}
          </p>
          <p className="mt-2 text-sm text-deep-teal/55">
            {myStore.length === 0
              ? "Add products from the catalog to make them visible to your customers."
              : "Try a different search term."}
          </p>
          {myStore.length === 0 ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-6 rounded-full bg-deep-teal px-5 py-2.5 text-sm font-medium text-pure-white hover:bg-pacific-teal"
            >
              Add Items
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <MyStoreProductCard
              key={product.store_id}
              product={product}
              isUpdating={updatingStoreId === product.store_id}
              onRetailPriceChange={(price) => void handlePriceChange(product.store_id, price)}
              onVisibilityChange={(visible) => void handleVisibilityChange(product.store_id, visible)}
              onRemove={() => void handleRemove(product.store_id, product.name)}
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
