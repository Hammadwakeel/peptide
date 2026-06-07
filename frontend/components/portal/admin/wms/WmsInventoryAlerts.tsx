"use client";

import Link from "next/link";
import { WmsSubNav } from "@/components/portal/admin/wms/WmsSubNav";
import { INVENTORY_ALERTS } from "@/lib/wms/mock-data";
import type { InventoryAlertLevel } from "@/lib/wms/types";
import { toast } from "@/lib/toast";

function AlertBadge({ level }: { level: InventoryAlertLevel }) {
  const styles: Record<InventoryAlertLevel, string> = {
    low_stock: "bg-coral-blush text-deep-teal",
    out_of_stock: "bg-red-100 text-red-700",
  };
  const labels: Record<InventoryAlertLevel, string> = {
    low_stock: "Low stock",
    out_of_stock: "Out of stock",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[level]}`}>
      {labels[level]}
    </span>
  );
}

export function WmsInventoryAlerts() {
  const lowStock = INVENTORY_ALERTS.filter((alert) => alert.level === "low_stock");
  const outOfStock = INVENTORY_ALERTS.filter((alert) => alert.level === "out_of_stock");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-light text-deep-teal">Inventory Alerts</h1>
        <p className="mt-1 text-sm text-deep-teal/55">
          {INVENTORY_ALERTS.length} products need attention
        </p>
      </div>

      <WmsSubNav />

      {outOfStock.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-red-700">Out of stock</h2>
          {outOfStock.map((alert) => (
            <article key={alert.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50/50 p-4">
              <div>
                <p className="font-medium text-deep-teal">{alert.productName}</p>
                <p className="text-xs text-deep-teal/45">{alert.sku} · 0 units (threshold {alert.threshold})</p>
              </div>
              <div className="flex items-center gap-3">
                <AlertBadge level={alert.level} />
                <button
                  type="button"
                  onClick={() => toast.success(`Restock request created for ${alert.productName}.`)}
                  className="rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white hover:bg-pacific-teal"
                >
                  Restock
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {lowStock.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-deep-teal">Low stock</h2>
          {lowStock.map((alert) => (
            <article key={alert.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-deep-teal/10 bg-pure-white p-4 shadow-sm">
              <div>
                <p className="font-medium text-deep-teal">{alert.productName}</p>
                <p className="text-xs text-deep-teal/45">
                  {alert.sku} · {alert.currentStock} units (threshold {alert.threshold})
                </p>
              </div>
              <div className="flex items-center gap-3">
                <AlertBadge level={alert.level} />
                <Link
                  href={`/portal/admin/products/${alert.productId}/stock`}
                  className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm font-medium text-deep-teal hover:border-pacific-teal"
                >
                  Restock
                </Link>
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
