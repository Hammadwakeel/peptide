"use client";

import { useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { usePatients } from "@/context/PatientsProvider";
import type { Patient, ShippingAddress } from "@/lib/patients/types";
import { toast } from "@/lib/toast";

type CustomerInformationTabProps = {
  patient: Patient;
};

function emptyAddress(): Omit<ShippingAddress, "id"> {
  return {
    label: "New address",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    isDefault: false,
  };
}

export function CustomerInformationTab({ patient }: CustomerInformationTabProps) {
  const { updatePatientContact, updateShippingAddresses } = usePatients();
  const [name, setName] = useState(patient.name);
  const [email, setEmail] = useState(patient.email);
  const [phone, setPhone] = useState(patient.phone);
  const [dateOfBirth, setDateOfBirth] = useState(patient.dateOfBirth);
  const [line1, setLine1] = useState(patient.address.line1);
  const [line2, setLine2] = useState(patient.address.line2 ?? "");
  const [city, setCity] = useState(patient.address.city);
  const [state, setState] = useState(patient.address.state);
  const [zip, setZip] = useState(patient.address.zip);
  const [addresses, setAddresses] = useState(patient.shippingAddresses);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<ShippingAddress, "id"> | null>(null);

  function saveContact() {
    updatePatientContact(patient.id, {
      name,
      email,
      phone,
      dateOfBirth,
      address: { line1, line2: line2 || undefined, city, state, zip },
    });
    toast.success("Contact information saved.");
  }

  function startAddAddress() {
    setEditingId("new");
    setDraft(emptyAddress());
  }

  function startEditAddress(address: ShippingAddress) {
    setEditingId(address.id);
    setDraft({ ...address });
  }

  function saveAddress() {
    if (!draft) return;
    if (editingId === "new") {
      const next = [
        ...addresses,
        { ...draft, id: `addr-${Date.now()}`, isDefault: addresses.length === 0 },
      ];
      setAddresses(next);
      updateShippingAddresses(patient.id, next);
    } else if (editingId) {
      const next = addresses.map((address) =>
        address.id === editingId ? { ...address, ...draft, id: address.id } : address,
      );
      setAddresses(next);
      updateShippingAddresses(patient.id, next);
    }
    setEditingId(null);
    setDraft(null);
    toast.success("Shipping address saved.");
  }

  function deleteAddress(id: string) {
    const next = addresses.filter((address) => address.id !== id);
    setAddresses(next);
    updateShippingAddresses(patient.id, next);
    toast.success("Address removed.");
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2">
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
        <div className="sm:col-span-2">
          <label className={authLabelClassName}>Primary address</label>
          <input value={line1} onChange={(e) => setLine1(e.target.value)} className={authInputClassName} placeholder="Street" />
        </div>
        <div className="sm:col-span-2">
          <input value={line2} onChange={(e) => setLine2(e.target.value)} className={authInputClassName} placeholder="Apt, suite (optional)" />
        </div>
        <div>
          <input value={city} onChange={(e) => setCity(e.target.value)} className={authInputClassName} placeholder="City" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input value={state} onChange={(e) => setState(e.target.value)} className={authInputClassName} placeholder="State" />
          <input value={zip} onChange={(e) => setZip(e.target.value)} className={authInputClassName} placeholder="ZIP" />
        </div>
        <div className="sm:col-span-2">
          <button type="button" onClick={saveContact} className="rounded-full bg-deep-teal px-4 py-2 text-sm font-light text-pure-white hover:bg-pacific-teal">
            Save contact info
          </button>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-light text-deep-teal">Shipping addresses</h3>
          <button type="button" onClick={startAddAddress} className="text-sm font-light text-pacific-teal hover:underline">
            Add address
          </button>
        </div>
        <div className="space-y-3">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-xl border border-deep-teal/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-light text-deep-teal">
                    {address.label}
                    {address.isDefault ? (
                      <span className="ml-2 text-xs font-light text-deep-teal/45">Default</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm text-deep-teal/65">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ""}
                    <br />
                    {address.city}, {address.state} {address.zip}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => startEditAddress(address)} className="text-xs text-pacific-teal hover:underline">
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteAddress(address.id)} className="text-xs text-deep-teal/45 hover:text-coral-blush">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {draft ? (
          <div className="mt-4 space-y-3 rounded-xl border border-dashed border-deep-teal/20 p-4">
            <input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} className={authInputClassName} placeholder="Label" />
            <input value={draft.line1} onChange={(e) => setDraft({ ...draft, line1: e.target.value })} className={authInputClassName} placeholder="Street" />
            <input value={draft.line2 ?? ""} onChange={(e) => setDraft({ ...draft, line2: e.target.value })} className={authInputClassName} placeholder="Apt (optional)" />
            <div className="grid gap-3 sm:grid-cols-3">
              <input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} className={authInputClassName} placeholder="City" />
              <input value={draft.state} onChange={(e) => setDraft({ ...draft, state: e.target.value })} className={authInputClassName} placeholder="State" />
              <input value={draft.zip} onChange={(e) => setDraft({ ...draft, zip: e.target.value })} className={authInputClassName} placeholder="ZIP" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={saveAddress} className="rounded-full bg-deep-teal px-4 py-2 text-sm text-pure-white">
                Save address
              </button>
              <button type="button" onClick={() => { setEditingId(null); setDraft(null); }} className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm text-deep-teal">
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-deep-teal/10 bg-deep-teal/[0.02] p-4">
        <h3 className="text-sm font-light text-deep-teal">Payment method on file</h3>
        <p className="mt-2 text-sm text-deep-teal/70">
          {patient.paymentMethod.brand} ending in {patient.paymentMethod.last4}
        </p>
        <p className="text-xs text-deep-teal/45">
          Expires {patient.paymentMethod.expMonth}/{patient.paymentMethod.expYear}
        </p>
      </section>
    </div>
  );
}
