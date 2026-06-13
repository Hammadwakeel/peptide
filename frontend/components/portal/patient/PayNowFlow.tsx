"use client";

import { useState } from "react";
import { authInputClassName, authLabelClassName } from "@/components/auth/AuthShell";
import type { PatientPendingOrder, PayFlowStep } from "@/lib/patient-portal/types";

type PayNowFlowProps = {
  order: PatientPendingOrder;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function PayNowFlow({ order, open, onClose, onSuccess }: PayNowFlowProps) {
  const [step, setStep] = useState<PayFlowStep>("summary");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  if (!open) return null;

  function resetAndClose() {
    setStep("summary");
    setCardNumber("");
    setExpiry("");
    setCvc("");
    onClose();
  }

  async function handlePay(event: React.FormEvent) {
    event.preventDefault();
    setStep("processing");
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const fail = cardNumber.replace(/\s/g, "").endsWith("0000");
    setStep(fail ? "failure" : "success");
    if (!fail) onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-deep-teal/40 p-4 sm:items-center">
      <button type="button" aria-label="Close" className="absolute inset-0" onClick={resetAndClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-[1.5rem] border border-deep-teal/10 bg-pure-white shadow-xl"
      >
        {step === "summary" ? (
          <div className="p-6">
            <h2 className="font-sans text-xl font-light text-deep-teal">Order summary</h2>
            <p className="mt-1 font-mono text-xs text-deep-teal/45">{order.orderId}</p>
            <ul className="mt-4 space-y-2 border-b border-deep-teal/10 pb-4 text-sm">
              {order.lineItems.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span className="text-deep-teal">{item.productName} ×{item.qty}</span>
                  <span>${item.price}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex justify-between font-light text-deep-teal">
              <span>Total</span>
              <span>${order.total}</span>
            </p>
            <button
              type="button"
              onClick={() => setStep("payment")}
              className="mt-6 w-full rounded-full bg-deep-teal py-3 text-sm font-light text-pure-white hover:bg-pacific-teal"
            >
              Continue to payment
            </button>
          </div>
        ) : null}

        {step === "payment" ? (
          <form onSubmit={handlePay} className="p-6">
            <h2 className="font-sans text-xl font-light text-deep-teal">Payment</h2>
            <p className="mt-1 text-xs text-deep-teal/50">Secure card payment</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className={authLabelClassName}>Card number</label>
                <input
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  className={authInputClassName}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={authLabelClassName}>Expiry</label>
                  <input required value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM / YY" className={authInputClassName} />
                </div>
                <div>
                  <label className={authLabelClassName}>CVC</label>
                  <input required value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder="123" className={authInputClassName} />
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-deep-teal/45">
              Payments are encrypted and processed securely via Stripe.
            </p>
            <button type="submit" className="mt-4 w-full rounded-full bg-deep-teal py-3 text-sm font-light text-pure-white">
              Pay ${order.total}
            </button>
          </form>
        ) : null}

        {step === "processing" ? (
          <div className="p-10 text-center">
            <div className="mx-auto size-10 animate-pulse rounded-full bg-pacific-teal/20" />
            <p className="mt-4 text-sm text-deep-teal">Processing payment…</p>
          </div>
        ) : null}

        {step === "success" ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-pacific-teal/10 text-2xl text-pacific-teal">✓</div>
            <h2 className="mt-4 font-sans text-xl font-light text-deep-teal">Payment successful</h2>
            <p className="mt-2 text-sm text-deep-teal/60">Order {order.orderId} is confirmed.</p>
            <button type="button" onClick={resetAndClose} className="mt-6 rounded-full bg-deep-teal px-5 py-2.5 text-sm text-pure-white">
              Done
            </button>
          </div>
        ) : null}

        {step === "failure" ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-coral-blush text-2xl text-deep-teal">×</div>
            <h2 className="mt-4 font-sans text-xl font-light text-deep-teal">Payment failed</h2>
            <p className="mt-2 text-sm text-deep-teal/60">Please try a different card or contact your clinic.</p>
            <button type="button" onClick={() => setStep("payment")} className="mt-6 rounded-full border border-deep-teal/15 px-5 py-2.5 text-sm text-deep-teal">
              Try again
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
