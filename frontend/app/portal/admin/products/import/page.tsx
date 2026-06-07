import { AdminBulkImport } from "@/components/portal/admin/products/AdminBulkImport";

export const metadata = {
  title: "Bulk import — Admin portal",
};

export default function AdminBulkImportPage() {
  return (
    <div className="rounded-[2rem] border border-deep-teal/10 bg-pure-white p-4 shadow-sm sm:p-6">
      <AdminBulkImport />
    </div>
  );
}
