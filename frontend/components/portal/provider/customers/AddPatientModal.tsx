"use client";

import { useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import type { AddPatientPayload } from "@/lib/patients/types";

type AddPatientModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: AddPatientPayload) => void;
};

export function AddPatientModal({ open, onClose, onSubmit }: AddPatientModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [sendInvite, setSendInvite] = useState(true);

  if (!open) return null;

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setDateOfBirth("");
    setLine1("");
    setLine2("");
    setCity("");
    setState("");
    setZip("");
    setSendInvite(true);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit({
      name,
      email,
      phone,
      dateOfBirth,
      address: { line1, line2: line2 || undefined, city, state, zip },
      sendInvite,
    });
    resetForm();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-deep-teal/40 p-4 sm:items-center">
      <button type="button" aria-label="Close modal" className="absolute inset-0" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-patient-title"
        className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-[1.5rem] border border-deep-teal/10 bg-pure-white p-6 shadow-xl"
      >
        <h2 id="add-patient-title" className="font-serif text-xl font-light text-deep-teal">
          Add / invite patient
        </h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="patient-name" className={authLabelClassName}>Name</label>
            <input id="patient-name" required value={name} onChange={(e) => setName(e.target.value)} className={authInputClassName} />
          </div>
          <div>
            <label htmlFor="patient-email" className={authLabelClassName}>Email</label>
            <input id="patient-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={authInputClassName} />
          </div>
          <div>
            <label htmlFor="patient-phone" className={authLabelClassName}>Phone</label>
            <input id="patient-phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className={authInputClassName} />
          </div>
          <div>
            <label htmlFor="patient-dob" className={authLabelClassName}>Date of birth</label>
            <input id="patient-dob" type="date" required value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={authInputClassName} />
          </div>
          <div>
            <label htmlFor="patient-line1" className={authLabelClassName}>Address</label>
            <input id="patient-line1" required placeholder="Street address" value={line1} onChange={(e) => setLine1(e.target.value)} className={authInputClassName} />
          </div>
          <div>
            <input placeholder="Apt, suite, etc. (optional)" value={line2} onChange={(e) => setLine2(e.target.value)} className={authInputClassName} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <input required placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className={authInputClassName} />
            </div>
            <div>
              <input required placeholder="State" value={state} onChange={(e) => setState(e.target.value)} className={authInputClassName} />
            </div>
            <div>
              <input required placeholder="ZIP" value={zip} onChange={(e) => setZip(e.target.value)} className={authInputClassName} />
            </div>
          </div>

          <fieldset className="rounded-xl border border-deep-teal/10 p-4">
            <legend className="px-1 text-sm font-medium text-deep-teal">Onboarding</legend>
            <div className="mt-2 space-y-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-deep-teal/[0.03]">
                <input
                  type="radio"
                  name="invite-mode"
                  checked={sendInvite}
                  onChange={() => setSendInvite(true)}
                  className="size-4 text-pacific-teal"
                />
                <span className="text-sm text-deep-teal">Send Invite Email</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-deep-teal/[0.03]">
                <input
                  type="radio"
                  name="invite-mode"
                  checked={!sendInvite}
                  onChange={() => setSendInvite(false)}
                  className="size-4 text-pacific-teal"
                />
                <span className="text-sm text-deep-teal">Create Silently</span>
              </label>
            </div>
          </fieldset>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm text-deep-teal">
              Cancel
            </button>
            <button type="submit" className="rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white hover:bg-pacific-teal">
              {sendInvite ? "Send invite" : "Create patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
