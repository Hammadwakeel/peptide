"use client";

import { useMemo, useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { AddPatientModal } from "@/components/portal/provider/customers/AddPatientModal";
import { useProviderPortal } from "@/context/ProviderPortalProvider";
import { usePatients } from "@/context/PatientsProvider";
import type { CartLineItem, OrderType } from "@/lib/orders/types";
import type { StoreProduct } from "@/lib/products/catalog-types";
import { fuseSearch } from "@/lib/search/fuse";
import { STORE_PRODUCT_SEARCH_KEYS } from "@/lib/search/keys";
import { Tooltip } from "@/components/ui/Tippy";
import { toast } from "@/lib/toast";

type CreateOrderPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateOrderPanel({ open, onClose }: CreateOrderPanelProps) {
  const { myStore } = useProviderPortal();
  const { patients, addPatient } = usePatients();
  const [orderFor, setOrderFor] = useState<OrderType>("customer");
  const [customerId, setCustomerId] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [cart, setCart] = useState<CartLineItem[]>([]);
  const [addPatientOpen, setAddPatientOpen] = useState(false);

  const products = myStore;

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products.slice(0, 8);
    return fuseSearch(products, productSearch, STORE_PRODUCT_SEARCH_KEYS);
  }, [productSearch, products]);

  const selectedProduct = products.find((product) => product.product_id === selectedProductId);
  const cartTotal = cart.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);

  if (!open) return null;

  function unitPriceForProduct(product: StoreProduct, type: OrderType) {
    if (type === "clinic") return product.clinic_cost ?? 0;
    return product.retail_price;
  }

  function handleProductSelect(productId: string) {
    setSelectedProductId(productId);
    const product = products.find((item) => item.product_id === productId);
    if (product) {
      setPrice(String(unitPriceForProduct(product, orderFor)));
    }
  }

  function handleAddToCart() {
    if (!selectedProduct) {
      toast.error("Select a product.");
      return;
    }
    const parsedQty = Number(qty);
    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedQty) || parsedQty <= 0 || !Number.isFinite(parsedPrice)) {
      toast.error("Enter valid quantity and price.");
      return;
    }
    setCart((current) => [
      ...current,
      {
        id: `cart-${Date.now()}`,
        productId: selectedProduct.product_id,
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        qty: parsedQty,
        unitPrice: parsedPrice,
      },
    ]);
    setQty("1");
    setProductSearch("");
    setSelectedProductId("");
    setPrice("");
  }

  function handleCreateOrder() {
    if (cart.length === 0) {
      toast.error("Add at least one item to the cart.");
      return;
    }
    const customer = patients.find((patient) => patient.id === customerId);
    if (orderFor === "customer" && !customer) {
      toast.error("Select a customer.");
      return;
    }
    toast.info("Order creation via the API is not available yet.");
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-deep-teal/30" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-order-title"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-4xl flex-col border-l border-deep-teal/10 bg-pure-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-deep-teal/10 px-5 py-4">
          <h2 id="create-order-title" className="font-sans text-xl font-light text-deep-teal">
            Create new order
          </h2>
          <Tooltip content="Close">
            <button type="button" onClick={onClose} aria-label="Close" className="text-2xl text-deep-teal/50 hover:text-deep-teal">
              ×
            </button>
          </Tooltip>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <fieldset>
              <legend className={authLabelClassName}>This order is for</legend>
              <div className="mt-2 flex gap-4">
                {(["customer", "clinic"] as OrderType[]).map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm text-deep-teal capitalize">
                    <input
                      type="radio"
                      name="order-for"
                      checked={orderFor === type}
                      onChange={() => setOrderFor(type)}
                    />
                    {type === "customer" ? "Customer" : "My Clinic"}
                  </label>
                ))}
              </div>
            </fieldset>

            {orderFor === "customer" ? (
              <div>
                <label htmlFor="select-customer" className={authLabelClassName}>Select customer</label>
                <div className="flex gap-2">
                  <select
                    id="select-customer"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className={authInputClassName}
                  >
                    <option value="">Choose a patient…</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>{patient.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setAddPatientOpen(true)}
                    className="shrink-0 rounded-full border border-deep-teal/15 px-3 py-2 text-xs font-light text-pacific-teal hover:bg-pacific-teal/12"
                  >
                    Add New
                  </button>
                </div>
              </div>
            ) : null}

            <div>
              <label htmlFor="product-search" className={authLabelClassName}>Product</label>
              <input
                id="product-search"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products…"
                className={authInputClassName}
              />
              {products.length === 0 ? (
                <p className="mt-2 text-sm text-deep-teal/50">Add products to My Store to create orders.</p>
              ) : null}
              {productSearch || selectedProductId ? (
                <ul className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-deep-teal/10">
                  {filteredProducts.map((product) => (
                    <li key={product.product_id}>
                      <button
                        type="button"
                        onClick={() => handleProductSelect(product.product_id)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-deep-teal/[0.03] ${
                          selectedProductId === product.product_id ? "bg-deep-teal/5 font-light" : ""
                        }`}
                      >
                        {product.name}
                        <span className="ml-2 text-xs text-deep-teal/45">{product.sku}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="order-qty" className={authLabelClassName}>Qty</label>
                <input id="order-qty" type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} className={authInputClassName} />
              </div>
              <div>
                <label htmlFor="order-price" className={authLabelClassName}>Price</label>
                <input id="order-price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={authInputClassName} />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm font-light text-deep-teal hover:bg-pacific-teal/12"
            >
              Add to Cart
            </button>
          </div>

          <div className="w-full border-t border-deep-teal/10 bg-deep-teal/[0.02] p-5 lg:w-80 lg:border-l lg:border-t-0">
            <h3 className="text-sm font-light text-deep-teal">Order items</h3>
            {cart.length === 0 ? (
              <p className="mt-4 text-sm text-deep-teal/50">Cart is empty.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {cart.map((item) => (
                  <li key={item.id} className="rounded-xl border border-deep-teal/10 bg-pure-white p-3 text-sm">
                    <p className="font-light text-deep-teal">{item.productName}</p>
                    <p className="mt-1 text-xs text-deep-teal/50">
                      Qty {item.qty} × ${item.unitPrice.toFixed(2)} = ${(item.qty * item.unitPrice).toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setCart((current) => current.filter((row) => row.id !== item.id))}
                      className="mt-2 text-xs text-deep-teal/45 hover:text-coral-blush"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 border-t border-deep-teal/10 pt-4">
              <p className="flex justify-between text-sm font-light text-deep-teal">
                <span>Total amount</span>
                <span>${cartTotal.toFixed(2)}</span>
              </p>
              <button
                type="button"
                disabled={cart.length === 0}
                onClick={handleCreateOrder}
                className="mt-4 w-full rounded-full bg-deep-teal py-2.5 text-sm font-light text-pure-white hover:bg-pacific-teal disabled:opacity-40"
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      </aside>

      <AddPatientModal
        open={addPatientOpen}
        onClose={() => setAddPatientOpen(false)}
        onSubmit={(payload) => {
          const patient = addPatient({
            name: `${payload.first_name} ${payload.last_name}`.trim(),
            email: payload.email,
            phone: payload.phone ?? "",
            dateOfBirth: payload.dob ?? "",
            address: { line1: "", city: "", state: "", zip: "" },
            sendInvite: true,
          });
          setCustomerId(patient.id);
          toast.success(`${patient.name} added.`);
        }}
      />
    </>
  );
}
