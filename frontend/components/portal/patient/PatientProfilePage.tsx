"use client";

import { useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { useAuth } from "@/context/AuthProvider";
import { usePatientPortal } from "@/context/PatientPortalProvider";
import {
  addPatientPaymentMethod,
  createPatientAddress,
  deletePatientAddress,
  deletePatientPaymentMethod,
  getPatientSettings,
  mapSettingsToProfile,
  setDefaultPatientAddress,
  setDefaultPatientPaymentMethod,
  updatePatientAddress,
  updatePatientProfile,
} from "@/lib/patient/api";
import type { PatientPaymentMethod, PatientShippingAddress } from "@/lib/patient-portal/types";
import { toast } from "@/lib/toast";

const CARD_BRANDS = ["Visa", "Mastercard", "Amex", "Discover"];

function emptyAddress(): PatientShippingAddress {
  return {
    id: "",
    label: "Home",
    line1: "",
    city: "",
    state: "",
    zip: "",
    isDefault: false,
  };
}

export function PatientProfilePage() {
  const { logout } = useAuth();
  const { profile, updateProfile, updateAddresses, updatePaymentMethods } = usePatientPortal();
  const [firstName, setFirstName] = useState(profile.name.split(" ")[0] ?? "");
  const [lastName, setLastName] = useState(profile.name.split(" ").slice(1).join(" ") ?? "");
  const [phone, setPhone] = useState(profile.phone);
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth);
  const [addresses, setAddresses] = useState(profile.shippingAddresses);
  const [paymentMethods, setPaymentMethods] = useState(profile.paymentMethods);
  const [addressDraft, setAddressDraft] = useState<PatientShippingAddress | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [cardBrand, setCardBrand] = useState("Visa");
  const [cardLast4, setCardLast4] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function refreshSettings() {
    const settings = await getPatientSettings();
    const nextProfile = mapSettingsToProfile(settings.settings);
    setAddresses(nextProfile.shippingAddresses);
    setPaymentMethods(nextProfile.paymentMethods);
    updateAddresses(nextProfile.shippingAddresses);
    updatePaymentMethods(nextProfile.paymentMethods);
    return nextProfile;
  }

  async function saveProfile() {
    setIsSaving(true);
    try {
      const response = await updatePatientProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        dob: dateOfBirth || undefined,
      });
      const nextProfile = mapSettingsToProfile(response.settings);
      updateProfile({
        name: nextProfile.name,
        phone: nextProfile.phone,
        dateOfBirth: nextProfile.dateOfBirth,
      });
      setFirstName(response.settings.first_name ?? "");
      setLastName(response.settings.last_name ?? "");
      setAddresses(nextProfile.shippingAddresses);
      setPaymentMethods(nextProfile.paymentMethods);
      updateAddresses(nextProfile.shippingAddresses);
      updatePaymentMethods(nextProfile.paymentMethods);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveAddress() {
    if (!addressDraft) return;
    setIsSaving(true);
    try {
      const isNew = !addresses.some((a) => a.id === addressDraft.id);
      if (isNew) {
        await createPatientAddress({
          label: addressDraft.label,
          line1: addressDraft.line1,
          line2: addressDraft.line2,
          city: addressDraft.city,
          state: addressDraft.state,
          zip: addressDraft.zip,
          is_default: addressDraft.isDefault,
        });
      } else {
        await updatePatientAddress(addressDraft.id, {
          label: addressDraft.label,
          line1: addressDraft.line1,
          line2: addressDraft.line2,
          city: addressDraft.city,
          state: addressDraft.state,
          zip: addressDraft.zip,
          is_default: addressDraft.isDefault,
        });
      }
      await refreshSettings();
      setAddressDraft(null);
      toast.success("Address saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save address.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeAddress(id: string) {
    try {
      await deletePatientAddress(id);
      await refreshSettings();
      toast.success("Address removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove address.");
    }
  }

  async function makeDefaultAddress(id: string) {
    try {
      await setDefaultPatientAddress(id);
      await refreshSettings();
      toast.success("Default address updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to set default address.");
    }
  }

  async function savePaymentMethod() {
    if (!/^\d{4}$/.test(cardLast4)) {
      toast.error("Enter the last 4 digits of your card.");
      return;
    }
    const month = Number(expMonth);
    const year = Number(expYear);
    if (month < 1 || month > 12 || year < 2024) {
      toast.error("Enter a valid expiration date.");
      return;
    }

    setIsSaving(true);
    try {
      await addPatientPaymentMethod({
        card_brand: cardBrand,
        card_last4: cardLast4,
        exp_month: month,
        exp_year: year,
        is_default: paymentMethods.length === 0,
      });
      await refreshSettings();
      setShowPaymentForm(false);
      setCardLast4("");
      setExpMonth("");
      setExpYear("");
      toast.success("Payment method added.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add payment method.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removePaymentMethod(id: string) {
    try {
      await deletePatientPaymentMethod(id);
      await refreshSettings();
      toast.success("Payment method removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove payment method.");
    }
  }

  async function makeDefaultPaymentMethod(id: string) {
    try {
      await setDefaultPatientPaymentMethod(id);
      await refreshSettings();
      toast.success("Default payment method updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to set default card.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-light text-deep-teal">Account Settings</h1>
        <p className="mt-1 text-sm text-deep-teal/55">
          Manage your profile, shipping addresses, and saved cards.
        </p>
      </div>

      <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
        <h2 className="text-sm font-medium text-deep-teal">Personal information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={authLabelClassName}>First name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={authInputClassName} />
          </div>
          <div>
            <label className={authLabelClassName}>Last name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={authInputClassName} />
          </div>
          <div>
            <label className={authLabelClassName}>Email</label>
            <input type="email" value={profile.email} readOnly className={`${authInputClassName} bg-deep-teal/[0.03]`} />
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
        <button
          type="button"
          disabled={isSaving}
          onClick={() => void saveProfile()}
          className="mt-4 rounded-full bg-deep-teal px-4 py-2 text-sm text-pure-white disabled:opacity-60"
        >
          Save profile
        </button>
      </section>

      <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-deep-teal">Shipping addresses</h2>
          <button
            type="button"
            onClick={() => setAddressDraft(emptyAddress())}
            className="text-sm text-pacific-teal hover:underline"
          >
            Add address
          </button>
        </div>
        <ul className="mt-4 space-y-3">
          {addresses.length === 0 ? (
            <li className="text-sm text-deep-teal/50">No saved addresses yet.</li>
          ) : (
            addresses.map((address) => (
              <li key={address.id} className="rounded-xl border border-deep-teal/10 p-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-deep-teal">
                      {address.label}
                      {address.isDefault ? (
                        <span className="ml-2 rounded-full bg-pacific-teal/10 px-2 py-0.5 text-xs text-pacific-teal">
                          Default
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-deep-teal/65">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.zip}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-3">
                  <button type="button" onClick={() => setAddressDraft(address)} className="text-xs text-pacific-teal">
                    Edit
                  </button>
                  {!address.isDefault ? (
                    <button type="button" onClick={() => void makeDefaultAddress(address.id)} className="text-xs text-pacific-teal">
                      Set default
                    </button>
                  ) : null}
                  <button type="button" onClick={() => void removeAddress(address.id)} className="text-xs text-deep-teal/45">
                    Remove
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
        {addressDraft ? (
          <div className="mt-4 space-y-2 rounded-xl border border-dashed border-deep-teal/20 p-4">
            <input value={addressDraft.label} onChange={(e) => setAddressDraft({ ...addressDraft, label: e.target.value })} className={authInputClassName} placeholder="Label" />
            <input value={addressDraft.line1} onChange={(e) => setAddressDraft({ ...addressDraft, line1: e.target.value })} className={authInputClassName} placeholder="Street" />
            <input value={addressDraft.line2 ?? ""} onChange={(e) => setAddressDraft({ ...addressDraft, line2: e.target.value })} className={authInputClassName} placeholder="Apt / suite (optional)" />
            <div className="grid grid-cols-3 gap-2">
              <input value={addressDraft.city} onChange={(e) => setAddressDraft({ ...addressDraft, city: e.target.value })} className={authInputClassName} placeholder="City" />
              <input value={addressDraft.state} onChange={(e) => setAddressDraft({ ...addressDraft, state: e.target.value.toUpperCase() })} className={authInputClassName} placeholder="State" maxLength={2} />
              <input value={addressDraft.zip} onChange={(e) => setAddressDraft({ ...addressDraft, zip: e.target.value })} className={authInputClassName} placeholder="ZIP" />
            </div>
            <div className="flex gap-2">
              <button type="button" disabled={isSaving} onClick={() => void saveAddress()} className="rounded-full bg-deep-teal px-3 py-1.5 text-xs text-pure-white disabled:opacity-60">
                Save
              </button>
              <button type="button" onClick={() => setAddressDraft(null)} className="text-xs text-deep-teal/50">
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-deep-teal">Payment methods</h2>
          <button
            type="button"
            onClick={() => setShowPaymentForm((value) => !value)}
            className="text-sm text-pacific-teal hover:underline"
          >
            {showPaymentForm ? "Cancel" : "Add card"}
          </button>
        </div>
        <ul className="mt-4 space-y-3">
          {paymentMethods.length === 0 ? (
            <li className="text-sm text-deep-teal/50">No saved cards yet.</li>
          ) : (
            paymentMethods.map((method) => (
              <li key={method.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-deep-teal/10 px-4 py-3 text-sm">
                <span className="text-deep-teal">
                  {method.brand} •••• {method.last4}
                  <span className="ml-2 text-deep-teal/45">
                    Exp {method.expMonth}/{method.expYear}
                  </span>
                  {method.isDefault ? (
                    <span className="ml-2 rounded-full bg-pacific-teal/10 px-2 py-0.5 text-xs text-pacific-teal">
                      Default
                    </span>
                  ) : null}
                </span>
                <div className="flex gap-3">
                  {!method.isDefault ? (
                    <button type="button" onClick={() => void makeDefaultPaymentMethod(method.id)} className="text-xs text-pacific-teal">
                      Set default
                    </button>
                  ) : null}
                  <button type="button" onClick={() => void removePaymentMethod(method.id)} className="text-xs text-deep-teal/45 hover:text-coral-blush">
                    Remove
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
        {showPaymentForm ? (
          <div className="mt-4 grid gap-3 rounded-xl border border-dashed border-deep-teal/20 p-4 sm:grid-cols-2">
            <div>
              <label className={authLabelClassName}>Card brand</label>
              <select value={cardBrand} onChange={(e) => setCardBrand(e.target.value)} className={authInputClassName}>
                {CARD_BRANDS.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={authLabelClassName}>Last 4 digits</label>
              <input
                value={cardLast4}
                onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className={authInputClassName}
                placeholder="1234"
                maxLength={4}
              />
            </div>
            <div>
              <label className={authLabelClassName}>Exp month</label>
              <input
                type="number"
                min={1}
                max={12}
                value={expMonth}
                onChange={(e) => setExpMonth(e.target.value)}
                className={authInputClassName}
              />
            </div>
            <div>
              <label className={authLabelClassName}>Exp year</label>
              <input
                type="number"
                min={2024}
                value={expYear}
                onChange={(e) => setExpYear(e.target.value)}
                className={authInputClassName}
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => void savePaymentMethod()}
                className="rounded-full bg-deep-teal px-4 py-2 text-sm text-pure-white disabled:opacity-60"
              >
                Save card
              </button>
            </div>
          </div>
        ) : null}
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
