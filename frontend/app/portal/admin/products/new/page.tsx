import { AdminProductForm } from "@/components/portal/admin/products/AdminProductForm";

export const metadata = {
  title: "Add product — Admin portal",
};

export default function AdminNewProductPage() {
  return (
    <div className="rounded-[2rem] border border-deep-teal/10 bg-pure-white p-4 shadow-sm sm:p-6">
      <AdminProductForm />
    </div>
  );
}
