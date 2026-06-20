"use client";

import { useMemo, useState } from "react";
import {
  FrontierRefreshCwIcon,
  FrontierTrash2Icon,
  ICON_SIZE_SM,
} from "@/components/icons/frontier";
import { frontierBrandIcons } from "@/components/icons/frontier/frontier-brand-icons";
import { AddItemsModal } from "@/components/portal/provider/my-store/AddItemsModal";
import { MyStoreProductCard } from "@/components/portal/provider/my-store/MyStoreProductCard";
import { ProviderPageSection } from "@/components/portal/provider/shared/ProviderPageSection";
import {
  ProviderPageToolbar,
  toolbarBtnClass,
  toolbarBtnPrimaryClass,
} from "@/components/portal/provider/shared/ProviderPageToolbar";
import { useProviderPortal } from "@/context/ProviderPortalProvider";
import { fuseSearch } from "@/lib/search/fuse";
import { STORE_PRODUCT_SEARCH_KEYS } from "@/lib/search/keys";
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

  const filteredProducts = useMemo(
    () => fuseSearch(myStore, search, STORE_PRODUCT_SEARCH_KEYS),
    [myStore, search],
  );

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
      <ProviderPageToolbar title="My Store">
        <button
          type="button"
          onClick={() => void refreshMyStore({ force: true })}
          disabled={isStoreLoading}
          className={toolbarBtnClass}
          aria-label="Refresh store"
        >
          <FrontierRefreshCwIcon size={ICON_SIZE_SM} className={isStoreLoading ? "animate-spin" : ""} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => void handleRemoveAll()}
          disabled={myStore.length === 0 || isStoreLoading}
          className={toolbarBtnClass}
        >
          <FrontierTrash2Icon size={ICON_SIZE_SM} aria-hidden="true" />
          <span className="hidden sm:inline">Remove all</span>
        </button>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className={toolbarBtnPrimaryClass}
        >
          <frontierBrandIcons.add size={ICON_SIZE_SM} aria-hidden="true" />
          <span className="hidden sm:inline">Add items</span>
        </button>
      </ProviderPageToolbar>

      <ProviderPageSection
        icon={frontierBrandIcons.home}
        title="Storefront products"
        subtitle={
          isStoreLoading
            ? "Loading…"
            : `${myStore.length} product${myStore.length === 1 ? "" : "s"} visible to patients`
        }
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search My Store…"
          className="mb-5 w-full rounded-full border border-deep-teal/15 px-4 py-2 text-sm outline-none focus:border-pacific-teal sm:max-w-sm"
        />

        {isStoreLoading ? (
          <p className="py-12 text-center text-sm text-deep-teal/50">Loading My Store…</p>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-deep-teal/15 px-6 py-16 text-center">
            <p className="font-sans text-xl font-light text-deep-teal">
              {myStore.length === 0 ? "Your store is empty" : "No items match your search"}
            </p>
            {myStore.length === 0 ? (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-6 rounded-full bg-deep-teal px-5 py-2.5 text-sm font-light text-pure-white hover:bg-pacific-teal"
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
      </ProviderPageSection>

      <AddItemsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        excludedIds={excludedIds}
        onAddSelected={handleAddSelected}
      />
    </div>
  );
}
