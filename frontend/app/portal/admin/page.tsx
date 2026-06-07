import { PortalShell } from "@/components/portal/PortalShell";

export const metadata = {
  title: "Admin portal — Frontier Biomed",
  description: "Admin workspace for Frontier Biomed partners.",
};

export default function AdminPortalPage() {
  return (
    <PortalShell
      role="admin"
      title="Admin workspace"
      description="This is the admin portal shell. User management, approvals, and system settings will live here once backend services are connected."
    />
  );
}
