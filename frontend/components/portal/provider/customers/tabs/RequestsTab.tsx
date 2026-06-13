"use client";

import { usePatients } from "@/context/PatientsProvider";
import type { ProductRequest } from "@/lib/patients/types";
import { REQUEST_STATUS_LABELS } from "@/lib/patients/types";
import { toast } from "@/lib/toast";

type RequestsTabProps = {
  patientId: string;
  patientName: string;
  requests: ProductRequest[];
  onChat: () => void;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RequestsTab({ patientId, patientName, requests, onChat }: RequestsTabProps) {
  const { updateRequestStatus } = usePatients();

  if (requests.length === 0) {
    return <p className="text-sm text-deep-teal/50">No product requests from {patientName}.</p>;
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <article key={request.id} className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-light text-deep-teal">{request.productName}</h3>
              <p className="mt-1 text-sm text-deep-teal/60">{request.description}</p>
            </div>
            <span className="rounded-full bg-coral-blush px-2.5 py-0.5 text-xs font-light text-deep-teal/70">
              {REQUEST_STATUS_LABELS[request.status]}
            </span>
          </div>

          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-deep-teal/45">Category</dt>
              <dd className="text-deep-teal">{request.category}</dd>
            </div>
            <div>
              <dt className="text-deep-teal/45">Date requested</dt>
              <dd className="text-deep-teal">{formatDate(request.dateRequested)}</dd>
            </div>
            <div>
              <dt className="text-deep-teal/45">Doctor</dt>
              <dd className="text-deep-teal">{request.doctorName}</dd>
            </div>
            <div>
              <dt className="text-deep-teal/45">Price</dt>
              <dd className="text-deep-teal">${request.price}</dd>
            </div>
          </dl>

          <div className="mt-4 rounded-xl bg-deep-teal/[0.03] px-4 py-3">
            <p className="text-[10px] font-light uppercase tracking-wide text-deep-teal/45">
              Request reason
            </p>
            <p className="mt-1 text-sm text-deep-teal/70">{request.requestReason}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={request.status !== "pending_review"}
              onClick={() => {
                updateRequestStatus(patientId, request.id, "approved");
                toast.success("Request approved.");
              }}
              className="rounded-full bg-deep-teal px-3 py-1.5 text-xs font-light text-pure-white hover:bg-pacific-teal disabled:opacity-40"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={request.status !== "pending_review"}
              onClick={() => {
                updateRequestStatus(patientId, request.id, "rejected");
                toast.success("Request rejected.");
              }}
              className="rounded-full border border-deep-teal/15 px-3 py-1.5 text-xs font-light text-deep-teal hover:bg-coral-blush/30 disabled:opacity-40"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={onChat}
              className="rounded-full border border-deep-teal/15 px-3 py-1.5 text-xs font-light text-deep-teal hover:bg-pacific-teal/12"
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => toast.info(`Viewing details for ${request.productName}.`)}
              className="rounded-full border border-deep-teal/15 px-3 py-1.5 text-xs font-light text-deep-teal hover:bg-pacific-teal/12"
            >
              View Details
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
