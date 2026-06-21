import { PortalAuthGuard } from "@/components/auth/PortalAuthGuard";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalAuthGuard>{children}</PortalAuthGuard>;
}
