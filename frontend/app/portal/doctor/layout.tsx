import { ProviderPortalLayout } from "@/components/portal/provider/ProviderPortalLayout";

export default function DoctorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProviderPortalLayout>{children}</ProviderPortalLayout>;
}
