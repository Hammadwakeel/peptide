import { AccountingPage } from "@/components/portal/provider/accounting/AccountingPage";

export const metadata = {
  title: "Accounting — Provider portal",
  description: "Revenue, profit trends, paid orders, and payouts.",
};

export default function DoctorAccountingPage() {
  return <AccountingPage />;
}
