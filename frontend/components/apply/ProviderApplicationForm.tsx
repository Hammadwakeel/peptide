"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AuthCard,
  AuthShell,
  authInputCompactClassName,
  authLabelCompactClassName,
  authLinkClassName,
} from "@/components/auth/AuthShell";
import { fadeInUp, motion, transition } from "@/components/motion";
import type { ProviderApplicationPayload } from "@/lib/auth/types";
import { showError, toast } from "@/lib/toast";

const INITIAL_STATE: ProviderApplicationPayload = {
  clinicName: "",
  npi: "",
  contactName: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};

async function mockSubmitApplication(payload: ProviderApplicationPayload) {
  await new Promise((resolve) => setTimeout(resolve, 700));

  if (!payload.clinicName.trim() || !payload.npi.trim() || !payload.email.trim()) {
    throw new Error("Clinic name, NPI, and email are required.");
  }

  if (!payload.email.includes("@")) {
    throw new Error("Enter a valid contact email.");
  }
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div variants={fadeInUp} transition={transition}>
      <label htmlFor={id} className={authLabelCompactClassName}>
        {label}
      </label>
      {children}
    </motion.div>
  );
}

export function ProviderApplicationForm() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof ProviderApplicationPayload>(
    key: K,
    value: ProviderApplicationPayload[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Submitting application…");

    try {
      await mockSubmitApplication(form);
      toast.dismiss(toastId);
      toast.success("Application submitted. Our team will review your request.");
      router.push("/login");
    } catch (error) {
      toast.dismiss(toastId);
      showError(error, "Unable to submit application.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell background="merch-jacket" compact>
      <AuthCard compact>
        <div className="mb-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-pacific-teal">
            Provider onboarding
          </span>
          <h1 className="mt-2 font-serif text-xl font-light tracking-[-0.02em] text-deep-teal sm:text-2xl">
            Clinic application
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-deep-teal/60 sm:text-sm">
            Apply for provider access to the Frontier Biomed partner portal.
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="clinicName" label="Clinic name">
              <input
                id="clinicName"
                required
                value={form.clinicName}
                onChange={(e) => updateField("clinicName", e.target.value)}
                className={authInputCompactClassName}
              />
            </Field>

            <Field id="npi" label="NPI number">
              <input
                id="npi"
                required
                value={form.npi}
                onChange={(e) => updateField("npi", e.target.value)}
                className={authInputCompactClassName}
              />
            </Field>

            <Field id="contactName" label="Primary contact">
              <input
                id="contactName"
                required
                value={form.contactName}
                onChange={(e) => updateField("contactName", e.target.value)}
                className={authInputCompactClassName}
              />
            </Field>

            <Field id="phone" label="Phone">
              <input
                id="phone"
                type="tel"
                required
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className={authInputCompactClassName}
              />
            </Field>

            <Field id="email" label="Contact email">
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={authInputCompactClassName}
              />
            </Field>

            <Field id="address" label="Clinic address">
              <input
                id="address"
                required
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                className={authInputCompactClassName}
              />
            </Field>
          </div>

          <Field id="notes" label="Additional notes (optional)">
            <textarea
              id="notes"
              rows={2}
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              className={`${authInputCompactClassName} resize-none`}
            />
          </Field>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            variants={fadeInUp}
            transition={transition}
            className="w-full rounded-full bg-deep-teal px-5 py-2.5 text-sm font-medium text-pure-white transition-all duration-300 hover:bg-pacific-teal disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Submitting…" : "Submit application"}
          </motion.button>
        </motion.form>

        <p className="mt-4 text-center text-xs text-deep-teal/60 sm:text-sm">
          Already have access?{" "}
          <Link href="/login" className={authLinkClassName}>
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}
