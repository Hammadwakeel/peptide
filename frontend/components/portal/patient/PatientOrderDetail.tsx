"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FrontierArrowLeftIcon,
  FrontierTruckIcon,
  ICON_SIZE_SM,
} from "@/components/icons/frontier";
import { frontierBrandIcons } from "@/components/icons/frontier/frontier-brand-icons";
import { PortalPageSection } from "@/components/portal/shared/PortalPageSection";
import {
  PortalPageToolbar,
  toolbarBtnClass,
  toolbarBtnPrimaryClass,
} from "@/components/portal/shared/PortalPageToolbar";
import { usePatientPortal } from "@/context/PatientPortalProvider";
import { getPatientOrderTracking } from "@/lib/patient-portal/api";
import type { PatientHistoryOrder, PatientPendingOrder } from "@/lib/patient-portal/types";
import { showError } from "@/lib/toast";

type PatientOrderDetailProps = {
  orderId: string;
};

function formatDate(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function toHistoryOrder(
  order: PatientHistoryOrder | PatientPendingOrder | undefined,
): PatientHistoryOrder | undefined {
  if (!order || !("status" in order)) return undefined;
  return order;
}

export function PatientOrderDetail({ orderId }: PatientOrderDetailProps) {
  const { getHistoryOrder, fetchOrderDetail } = usePatientPortal();
  const [order, setOrder] = useState<PatientHistoryOrder | undefined>(() =>
    toHistoryOrder(getHistoryOrder(orderId)),
  );
  const [isLoading, setIsLoading] = useState(!order);
  const [trackingMessage, setTrackingMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const cached = toHistoryOrder(getHistoryOrder(orderId));
      if (cached) {
        setOrder(cached);
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }

      try {
        const loaded = await fetchOrderDetail(orderId);
        if (!cancelled) setOrder(loaded);

        const trackingRes = await getPatientOrderTracking(orderId);
        if (!cancelled && trackingRes.message) {
          setTrackingMessage(trackingRes.message);
        }
        if (!cancelled && trackingRes.tracking?.[0]?.tracking_number && loaded) {
          const row = trackingRes.tracking[0];
          const carrier = (row.carrier ?? "fedex").toUpperCase();
          setOrder((current) =>
            current
              ? {
                  ...current,
                  tracking: {
                    carrier,
                    trackingNumber: row.tracking_number!,
                    estimatedDelivery: row.delivered_at?.slice(0, 10) ?? "",
                    trackingUrl:
                      carrier.toLowerCase() === "fedex"
                        ? `https://www.fedex.com/fedextrack/?trknbr=${row.tracking_number}`
                        : "",
                  },
                }
              : current,
          );
        }
      } catch (error) {
        if (!cancelled) showError(error, "Unable to load order.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [orderId, getHistoryOrder, fetchOrderDetail]);

  if (isLoading) {
    return <p className="py-12 text-center text-sm text-deep-teal/50">Loading order…</p>;
  }

  if (!order) {
    return (
      <div className="space-y-5">
        <PortalPageToolbar title="Order not found">
          <Link href="/portal/patient/orders" className={toolbarBtnClass}>
            <FrontierArrowLeftIcon size={ICON_SIZE_SM} aria-hidden="true" />
            <span className="hidden sm:inline">Back</span>
          </Link>
        </PortalPageToolbar>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PortalPageToolbar title={order.orderId}>
        <Link href="/portal/patient/orders" className={toolbarBtnClass}>
          <FrontierArrowLeftIcon size={ICON_SIZE_SM} aria-hidden="true" />
          <span className="hidden sm:inline">Back</span>
        </Link>
        {order.tracking?.trackingUrl ? (
          <a href={order.tracking.trackingUrl} target="_blank" rel="noopener noreferrer" className={toolbarBtnPrimaryClass}>
            Track shipment
          </a>
        ) : null}
      </PortalPageToolbar>

      <PortalPageSection icon={frontierBrandIcons.package} title="Order details" subtitle={`Placed ${formatDate(order.date)}`}>
        {order.reviewStatus === "rejected" && order.rejectionReason ? (
          <p className="mb-4 rounded-xl border border-coral-blush/40 bg-coral-blush/15 px-4 py-3 text-sm text-deep-teal/75">
            Rejected: {order.rejectionReason}
          </p>
        ) : null}

        <ul className="space-y-2 text-sm">
          {order.lineItems.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 border-b border-deep-teal/5 pb-2 text-deep-teal/80">
              <span>
                {item.productName} ×{item.qty}
              </span>
              <span>${item.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between font-light text-deep-teal">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </p>
      </PortalPageSection>

      <PortalPageSection icon={FrontierTruckIcon} title="Tracking">
        {order.tracking ? (
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-deep-teal/45">Carrier</dt>
              <dd className="text-sm text-deep-teal">{order.tracking.carrier}</dd>
            </div>
            <div>
              <dt className="text-xs text-deep-teal/45">Tracking number</dt>
              <dd className="font-sans text-sm text-deep-teal">{order.tracking.trackingNumber}</dd>
            </div>
            {order.tracking.estimatedDelivery ? (
              <div>
                <dt className="text-xs text-deep-teal/45">Delivered / ETA</dt>
                <dd className="text-sm text-deep-teal">{formatDate(order.tracking.estimatedDelivery)}</dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <p className="text-sm text-deep-teal/50">
            {trackingMessage ?? "Tracking not available yet."}
          </p>
        )}
      </PortalPageSection>
    </div>
  );
}
