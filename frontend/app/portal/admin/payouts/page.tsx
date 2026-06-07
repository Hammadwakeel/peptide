import { AdminPayoutsDashboard } from "@/components/portal/admin/finance/AdminPayoutsDashboard";

export const metadata = {
  title: "Payouts — Admin portal",
  description: "Cross-clinic payout management and error monitoring.",
};

export default function AdminPayoutsPage() {
  return <AdminPayoutsDashboard />;
}
