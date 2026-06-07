import { Suspense } from "react";
import { PatientProfile } from "@/components/portal/provider/customers/PatientProfile";

export const metadata = {
  title: "Patient profile — Provider portal",
  description: "View patient details, orders, notes, and requests.",
};

type PatientProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PatientProfilePage({ params }: PatientProfilePageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<p className="text-sm text-deep-teal/50">Loading profile…</p>}>
      <PatientProfile patientId={id} />
    </Suspense>
  );
}
