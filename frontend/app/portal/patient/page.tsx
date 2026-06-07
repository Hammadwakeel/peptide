import { PendingPaymentsTab } from "@/components/portal/patient/PendingPaymentsTab";

export const metadata = {
  title: "Pending Payments — Patient portal",
  description: "View and pay pending orders.",
};

export default function PatientPortalPage() {
  return <PendingPaymentsTab />;
}
