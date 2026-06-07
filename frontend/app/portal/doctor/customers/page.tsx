import { CustomerManagement } from "@/components/portal/provider/customers/CustomerManagement";

export const metadata = {
  title: "Customers — Provider portal",
  description: "Manage patients and customer relationships.",
};

export default function CustomersPage() {
  return <CustomerManagement />;
}
