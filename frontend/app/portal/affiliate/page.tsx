import { PortalShell } from "@/components/portal/PortalShell";

export const metadata = {
  title: "Affiliate portal — Frontier Biomed",
  description: "Affiliate workspace for Frontier Biomed partners.",
};

export default function AffiliatePortalPage() {
  return (
    <PortalShell
      role="affiliate"
      title="Affiliate workspace"
      description="This is the affiliate portal shell. Referrals, commissions, and partner resources will live here once backend services are connected."
    />
  );
}
