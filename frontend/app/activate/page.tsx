import { Suspense } from "react";
import { PatientActivationForm } from "@/components/activate/PatientActivationForm";

export const metadata = {
  title: "Activate account — Frontier Biomed",
  description: "Activate your patient account and set your password.",
};

export default function ActivatePage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-sm text-deep-teal/50">Loading…</p>}>
      <PatientActivationForm />
    </Suspense>
  );
}
