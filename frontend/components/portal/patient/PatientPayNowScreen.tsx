"use client";

import Link from "next/link";
import { frontierBrandIcons } from "@/components/icons/frontier/frontier-brand-icons";
import { PortalPageSection } from "@/components/portal/shared/PortalPageSection";
import {
  PortalPageToolbar,
  toolbarBtnPrimaryClass,
} from "@/components/portal/shared/PortalPageToolbar";
import { usePatientPortal } from "@/context/PatientPortalProvider";

export function PatientPayNowScreen() {
  const { pendingOrders, ordersLoading } = usePatientPortal();

  if (ordersLoading) {
    return <p className="py-12 text-center text-sm text-deep-teal/50">Loading orders…</p>;
  }

  if (pendingOrders.length === 0) {
    return (
      <div className="space-y-5">
        <PortalPageToolbar title="Pay Now" />
        <PortalPageSection icon={frontierBrandIcons.wallet} title="No payment due">
          <p className="text-sm text-deep-teal/65">
            You don&apos;t have any orders awaiting payment right now.
          </p>
          <Link
            href="/portal/patient"
            className="mt-6 inline-flex rounded-full bg-deep-teal px-5 py-2.5 text-sm font-light text-pure-white hover:bg-pacific-teal"
          >
            Back to portal
          </Link>
        </PortalPageSection>
      </div>
    );
  }

  const order = pendingOrders[0];

  return (
    <div className="space-y-5">
      <PortalPageToolbar title="Pay Now">
        <Link href={`/portal/patient/orders/${order.id}`} className={toolbarBtnPrimaryClass}>
          View order
        </Link>
      </PortalPageToolbar>

      <PortalPageSection
        icon={frontierBrandIcons.wallet}
        title="Payment pending approval"
        subtitle={`Order ${order.orderId}`}
      >
        <p className="text-sm text-deep-teal/65">
          This order is awaiting physician review before payment can be collected.
        </p>
        <p className="mt-4 text-base font-light text-deep-teal">Total: ${order.total.toFixed(2)}</p>
      </PortalPageSection>
    </div>
  );
}
