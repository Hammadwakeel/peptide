import { AdminPortalLayout } from "@/components/portal/admin/AdminPortalLayout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminPortalLayout>{children}</AdminPortalLayout>;
}
