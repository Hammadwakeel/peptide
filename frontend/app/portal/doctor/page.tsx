import { PortalShell } from "@/components/portal/PortalShell";

export const metadata = {
  title: "Doctor portal — Frontier Biomed",
  description: "Doctor workspace for Frontier Biomed partners.",
};

export default function DoctorPortalPage() {
  return (
    <PortalShell
      role="doctor"
      title="Doctor workspace"
      description="This is the doctor portal shell. Orders, verification, and clinic workflows will live here once backend services are connected."
    />
  );
}
