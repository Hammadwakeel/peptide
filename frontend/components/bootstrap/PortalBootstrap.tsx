"use client";

import { useEffect } from "react";
import { bootstrapPortal } from "@/lib/bootstrap/portal-bootstrap";
import type { UserRole } from "@/lib/auth/types";
import { useAuthStore } from "@/stores/auth-store";

type PortalBootstrapProps = {
  role: UserRole;
};

export function PortalBootstrap({ role }: PortalBootstrapProps) {
  const session = useAuthStore((state) => state.session);
  const authLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (authLoading || !session || session.role !== role) return;
    void bootstrapPortal(role);
  }, [authLoading, session, role]);

  return null;
}
