import { OrderManagement } from "@/components/portal/provider/orders/OrderManagement";

export const metadata = {
  title: "Orders — Provider portal",
  description: "Manage customer and clinic orders.",
};

export default function DoctorOrdersPage() {
  return <OrderManagement />;
}
