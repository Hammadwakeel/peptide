"use client";

import Link from "next/link";
import { Tooltip } from "@/components/ui/Tippy";
import type { PatientOrder } from "@/lib/patients/types";
import { ORDER_STATUS_LABELS } from "@/lib/patients/types";

type OrderHistoryTabProps = {
  orders: PatientOrder[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function OrderHistoryTab({ orders }: OrderHistoryTabProps) {
  if (orders.length === 0) {
    return <p className="text-sm text-deep-teal/50">No orders yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-deep-teal/10">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase tracking-wide text-deep-teal/45">
          <tr>
            <th className="px-4 py-3 font-light">Order ID</th>
            <th className="px-4 py-3 font-light">Date</th>
            <th className="px-4 py-3 font-light">Status</th>
            <th className="px-4 py-3 font-light">Total</th>
            <th className="px-4 py-3 font-light" aria-label="View" />
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-deep-teal/5 last:border-0">
              <td className="px-4 py-3 font-light text-deep-teal">{order.id}</td>
              <td className="px-4 py-3 text-deep-teal/70">{formatDate(order.date)}</td>
              <td className="px-4 py-3 text-deep-teal/70">{ORDER_STATUS_LABELS[order.status]}</td>
              <td className="px-4 py-3 text-deep-teal">${order.total}</td>
              <td className="px-4 py-3 text-right">
                <Tooltip content={`View order ${order.id}`}>
                  <button
                    type="button"
                    aria-label={`View order ${order.id}`}
                    className="text-pacific-teal hover:text-deep-teal"
                  >
                    →
                  </button>
                </Tooltip>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChatMessagesTab({
  messages,
  patientName,
}: {
  messages: { id: string; sender: "provider" | "patient"; content: string; sentAt: string }[];
  patientName: string;
}) {
  if (messages.length === 0) {
    return <p className="text-sm text-deep-teal/50">No messages with {patientName} yet.</p>;
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`max-w-xl rounded-2xl px-4 py-3 text-sm ${
            message.sender === "provider"
              ? "ml-auto bg-deep-teal text-pure-white"
              : "bg-deep-teal/[0.05] text-deep-teal"
          }`}
        >
          <p>{message.content}</p>
          <p className={`mt-2 text-[10px] ${message.sender === "provider" ? "text-pure-white/60" : "text-deep-teal/45"}`}>
            {new Date(message.sentAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
