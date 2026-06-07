"use client";

import { useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { useAuth } from "@/context/AuthProvider";
import { usePatientPortal } from "@/context/PatientPortalProvider";
import type { PatientPaymentMethod, PatientShippingAddress } from "@/lib/patient-portal/types";
import { toast } from "@/lib/toast";

export function PatientProfilePage() {
  const { logout } = useAuth();
  const { profile, updateProfile, updateAddresses, updatePaymentMethods } = usePatientPortal();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth);
  const [addresses, setAddresses] = useState(profile.shippingAddresses);
  const [paymentMethods, setPaymentMethods] = useState(profile.paymentMethods);
  const [addressDraft, setAddressDraft] = useState<PatientShippingAddress | null>(null);

  function saveProfile() {
    updateProfile({ name, email, phone, dateOfBirth });
    toast.success("Profile updated.");
  }

  function saveAddress() {
    if (!addressDraft) return;
    const exists = addresses.some((a) => a.id === addressDraft.id);
    const next = exists
      ? addresses.map((a) => (a.id === addressDraft.id ? addressDraft : a))
      : [...addresses, addressDraft];
    setAddresses(next);
    updateAddresses(next);
    setAddressDraft(null);
    toast.success("Address saved.");
  }

  function removeAddress(id: string) {
    const next = addresses.filter((a) => a.id !== id);
    setAddresses(next);
    updateAddresses(next);
    toast.success("Address removed.");
  }

  function removePaymentMethod(id: string) {
    const next = paymentMethods.filter((m) => m.id !== id);
    setPaymentMethods(next);
    updatePaymentMethods(next);
    toast.success("Payment method removed.");
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-light text-deep-teal">Account</h1>

      <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
        <h2 className="text-sm font-medium text-deep-teal">Personal information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={authLabelClassName}>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={authInputClassName} />
          </div>
          <div>
            <label className={authLabelClassName}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={authInputClassName} />
          </div>
          <div>
            <label className={authLabelClassName}>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={authInputClassName} />
          </div>
          <div>
            <label className={authLabelClassName}>Date of birth</label>
            <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={authInputClassName} />
          </div>
        </div>
        <button type="button" onClick={saveProfile} className="mt-4 rounded-full bg-deep-teal px-4 py-2 text-sm text-pure-white">
          Save
        </button>
      </section>

      <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-deep-teal">Shipping addresses</h2>
          <button
            type="button"
            onClick={() =>
              setAddressDraft({
                id: `addr-${Date.now()}`,
                label: "New address",
                line1: "",
                city: "",
                state: "",
                zip: "",
                isDefault: addresses.length === 0,
              })
            }
            className="text-sm text-pacific-teal hover:underline"
          >
            Add
          </button>
        </div>
        <ul className="mt-4 space-y-3">
          {addresses.map((address) => (
            <li key={address.id} className="rounded-xl border border-deep-teal/10 p-3 text-sm">
              <p className="font-medium text-deep-teal">{address.label}</p>
              <p className="mt-1 text-deep-teal/65">
                {address.line1}, {address.city}, {address.state} {address.zip}
              </p>
              <div className="mt-2 flex gap-3">
                <button type="button" onClick={() => setAddressDraft(address)} className="text-xs text-pacific-teal">Edit</button>
                <button type="button" onClick={() => removeAddress(address.id)} className="text-xs text-deep-teal/45">Remove</button>
              </div>
            </li>
          ))}
        </ul>
        {addressDraft ? (
          <div className="mt-4 space-y-2 rounded-xl border border-dashed border-deep-teal/20 p-4">
            <input value={addressDraft.label} onChange={(e) => setAddressDraft({ ...addressDraft, label: e.target.value })} className={authInputClassName} placeholder="Label" />
            <input value={addressDraft.line1} onChange={(e) => setAddressDraft({ ...addressDraft, line1: e.target.value })} className={authInputClassName} placeholder="Street" />
            <div className="grid grid-cols-3 gap-2">
              <input value={addressDraft.city} onChange={(e) => setAddressDraft({ ...addressDraft, city: e.target.value })} className={authInputClassName} placeholder="City" />
              <input value={addressDraft.state} onChange={(e) => setAddressDraft({ ...addressDraft, state: e.target.value })} className={authInputClassName} placeholder="State" />
              <input value={addressDraft.zip} onChange={(e) => setAddressDraft({ ...addressDraft, zip: e.target.value })} className={authInputClassName} placeholder="ZIP" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={saveAddress} className="rounded-full bg-deep-teal px-3 py-1.5 text-xs text-pure-white">Save</button>
              <button type="button" onClick={() => setAddressDraft(null)} className="text-xs text-deep-teal/50">Cancel</button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
        <h2 className="text-sm font-medium text-deep-teal">Payment methods</h2>
        <ul className="mt-4 space-y-3">
          {paymentMethods.map((method) => (
            <li key={method.id} className="flex items-center justify-between rounded-xl border border-deep-teal/10 px-4 py-3 text-sm">
              <span className="text-deep-teal">
                {method.brand} •••• {method.last4}
                <span className="ml-2 text-deep-teal/45">Exp {method.expMonth}/{method.expYear}</span>
              </span>
              <button type="button" onClick={() => removePaymentMethod(method.id)} className="text-xs text-deep-teal/45 hover:text-coral-blush">
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => {
            const method: PatientPaymentMethod = {
              id: `pm-${Date.now()}`,
              brand: "Visa",
              last4: "1111",
              expMonth: 12,
              expYear: 2029,
              isDefault: false,
            };
            const next = [...paymentMethods, method];
            setPaymentMethods(next);
            updatePaymentMethods(next);
            toast.success("Payment method added.");
          }}
          className="mt-3 text-sm text-pacific-teal hover:underline"
        >
          Add payment method
        </button>
      </section>

      <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
        <h2 className="text-sm font-medium text-deep-teal">Subscriptions</h2>
        <ul className="mt-4 space-y-3">
          {profile.subscriptions.map((sub) => (
            <li key={sub.id} className="rounded-xl border border-deep-teal/10 px-4 py-3 text-sm">
              <p className="font-medium text-deep-teal">{sub.productName}</p>
              <p className="mt-1 text-deep-teal/55">{sub.frequency} · Next: {sub.nextDate}</p>
              <span className="mt-2 inline-block rounded-full bg-pacific-teal/10 px-2 py-0.5 text-xs capitalize text-pacific-teal">
                {sub.status}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        onClick={logout}
        className="rounded-full border border-deep-teal/15 px-5 py-2.5 text-sm font-medium text-deep-teal hover:border-coral-blush hover:text-coral-blush"
      >
        Log out
      </button>
    </div>
  );
}
