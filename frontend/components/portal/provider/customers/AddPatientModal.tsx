"use client";

import { useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import type { InvitePatientPayload } from "@/lib/doctor/types";

type AddPatientModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: InvitePatientPayload) => Promise<void> | void;
};

export function AddPatientModal({ open, onClose, onSubmit }: AddPatientModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  function resetForm() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setDob("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        dob: dob || null,
      });
      resetForm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-deep-teal/40 p-4 sm:items-center">
      <button type="button" aria-label="Close modal" className="absolute inset-0" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-patient-title"
        className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-[1.5rem] border border-deep-teal/10 bg-pure-white p-6 shadow-xl"
        data-tour="doctor-patient-invite-form"
      >
        <h2 id="add-patient-title" className="font-sans text-xl font-light text-deep-teal">
          Invite patient
        </h2>
        <p className="mt-1 text-sm text-deep-teal/55">
          We&apos;ll create the patient and email them an invitation to activate their account.
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="patient-first-name" className={authLabelClassName}>First name</label>
              <input
                id="patient-first-name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={authInputClassName}
              />
            </div>
            <div>
              <label htmlFor="patient-last-name" className={authLabelClassName}>Last name</label>
              <input
                id="patient-last-name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={authInputClassName}
              />
            </div>
          </div>
          <div>
            <label htmlFor="patient-email" className={authLabelClassName}>Email</label>
            <input
              id="patient-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputClassName}
            />
          </div>
          <div>
            <label htmlFor="patient-phone" className={authLabelClassName}>Phone (optional)</label>
            <input
              id="patient-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={authInputClassName}
            />
          </div>
          <div>
            <label htmlFor="patient-dob" className={authLabelClassName}>Date of birth (optional)</label>
            <input
              id="patient-dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className={authInputClassName}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm text-deep-teal disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-deep-teal px-4 py-2 text-sm font-light text-pure-white hover:bg-pacific-teal disabled:opacity-60"
              data-tour="doctor-patient-invite-submit"
            >
              {isSubmitting ? "Sending…" : "Send invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
