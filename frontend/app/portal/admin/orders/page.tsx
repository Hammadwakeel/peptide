import { AdminOrdersView } from "@/components/portal/admin/orders/AdminOrdersView";

export const metadata = {
  title: "All orders — Admin portal",
  description: "Cross-clinic order management and bulk actions.",
};

export default function AdminOrdersPage() {
  return <AdminOrdersView />;
}
