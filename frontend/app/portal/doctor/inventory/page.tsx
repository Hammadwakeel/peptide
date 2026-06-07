import { ProviderInventoryBrowser } from "@/components/portal/provider/inventory/ProviderInventoryBrowser";

export const metadata = {
  title: "Inventory — Provider portal",
};

export default function ProviderInventoryPage() {
  return (
    <div className="rounded-[2rem] border border-deep-teal/10 bg-pure-white p-4 shadow-sm sm:p-6">
      <ProviderInventoryBrowser />
    </div>
  );
}
