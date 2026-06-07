import { PortalShell } from "@/components/portal/PortalShell";

export const metadata = {
  title: "Patient portal — Frontier Biomed",
  description: "Patient workspace for Frontier Biomed partners.",
};

export default function PatientPortalPage() {
  return (
    <PortalShell
      role="patient"
      title="Patient workspace"
      description="This is the patient portal shell. Prescriptions, messaging, and account settings will live here once backend services are connected."
    />
  );
}
