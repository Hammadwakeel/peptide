"use client";

import Link from "next/link";
import { useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { MOCK_PATIENT_PAY_ORDER } from "@/lib/finance/mock-data";
import { toast } from "@/lib/toast";

type PaymentMethod = "saved" | "new";

export function PatientPayNowScreen() {
  const order = MOCK_PATIENT_PAY_ORDER;
  const [method, setMethod] = useState<PaymentMethod>("saved");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paid, setPaid] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [zip, setZip] = useState("");

  async function handlePay(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setPaid(true);
    toast.success("Payment successful.");
  }

  if (paid) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-deep-teal/10 bg-pure-white p-8 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-pacific-teal/10 text-2xl text-pacific-teal">
          ✓
        </div>
        <h1 className="mt-4 font-serif text-2xl font-light text-deep-teal">Payment received</h1>
        <p className="mt-2 text-sm text-deep-teal/65">
          Order {order.orderId} is confirmed. You&apos;ll receive a receipt by email.
        </p>
        <Link
          href="/portal/patient"
          className="mt-6 inline-flex rounded-full bg-deep-teal px-5 py-2.5 text-sm font-medium text-pure-white hover:bg-pacific-teal"
        >
          Back to portal
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-6 shadow-sm">
        <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-pacific-teal">Secure checkout</p>
        <h1 className="mt-2 font-serif text-2xl font-light text-deep-teal">Pay Now</h1>
        <p className="mt-1 text-sm text-deep-teal/60">{order.clinicName}</p>

        <form onSubmit={handlePay} className="mt-6 space-y-5">
          <fieldset className="space-y-3">
            <legend className={authLabelClassName}>Payment method</legend>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-deep-teal/10 p-4 hover:bg-deep-teal/[0.02]">
              <input
                type="radio"
                name="payment-method"
                checked={method === "saved"}
                onChange={() => setMethod("saved")}
              />
              <div>
                <p className="text-sm font-medium text-deep-teal">
                  {order.savedCard.brand} •••• {order.savedCard.last4}
                </p>
                <p className="text-xs text-deep-teal/50">
                  Expires {order.savedCard.expMonth}/{order.savedCard.expYear}
                </p>
              </div>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-deep-teal/10 p-4 hover:bg-deep-teal/[0.02]">
              <input
                type="radio"
                name="payment-method"
                checked={method === "new"}
                onChange={() => setMethod("new")}
              />
              <span className="text-sm text-deep-teal">Use a new card</span>
            </label>
          </fieldset>

          {method === "new" ? (
            <div className="space-y-4 rounded-xl border border-deep-teal/10 bg-deep-teal/[0.02] p-4">
              <p className="text-[10px] font-medium uppercase tracking-wide text-deep-teal/45">
                Card details — Stripe Elements (mock)
              </p>
              <div>
                <label className={authLabelClassName}>Card number</label>
                <input
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  className={`${authInputClassName} font-mono`}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className={authLabelClassName}>Expiry</label>
                  <input
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM / YY"
                    className={authInputClassName}
                  />
                </div>
                <div className="col-span-1">
                  <label className={authLabelClassName}>CVC</label>
                  <input
                    required
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="123"
                    className={authInputClassName}
                  />
                </div>
                <div className="col-span-1">
                  <label className={authLabelClassName}>ZIP</label>
                  <input
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="94110"
                    className={authInputClassName}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <p className="flex items-center gap-2 text-xs text-deep-teal/50">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3 4 7v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V7l-8-4Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Payments are encrypted and processed securely via Stripe. Your card details are never stored on our servers.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-deep-teal py-3 text-sm font-medium text-pure-white hover:bg-pacific-teal disabled:opacity-60"
          >
            {isSubmitting ? "Processing…" : `Pay Now — $${order.total}`}
          </button>
        </form>
      </section>

      <aside className="rounded-2xl border border-deep-teal/10 bg-deep-teal/[0.02] p-6">
        <h2 className="text-sm font-medium text-deep-teal">Order summary</h2>
        <p className="mt-1 font-mono text-xs text-deep-teal/45">{order.orderId}</p>
        <ul className="mt-4 space-y-3 border-b border-deep-teal/10 pb-4">
          {order.lineItems.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 text-sm">
              <span className="text-deep-teal">
                {item.productName}
                <span className="ml-1 text-deep-teal/45">×{item.qty}</span>
              </span>
              <span className="text-deep-teal">${item.total}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-deep-teal/70">
            <dt>Subtotal</dt>
            <dd>${order.subtotal}</dd>
          </div>
          <div className="flex justify-between text-deep-teal/70">
            <dt>Shipping</dt>
            <dd>{order.shipping === 0 ? "Free" : `$${order.shipping}`}</dd>
          </div>
          <div className="flex justify-between border-t border-deep-teal/10 pt-2 text-base font-medium text-deep-teal">
            <dt>Total</dt>
            <dd>${order.total}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
