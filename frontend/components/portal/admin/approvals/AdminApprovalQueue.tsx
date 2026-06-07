"use client";

import { useCallback, useEffect, useState } from "react";
import { listApplications, reviewApplication } from "@/lib/admin/api";
import {
  DOCUMENT_TYPE_LABELS,
  isReviewableApplication,
  mapApplicationStatus,
  type AdminApplication,
  type ApprovalStatus,
} from "@/lib/admin/types";
import { showError, toast } from "@/lib/toast";

function ApplicationCard({
  application,
  onApprove,
  onReject,
  onRequestInfo,
  isProcessing,
}: {
  application: AdminApplication;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onRequestInfo: (note: string) => void;
  isProcessing: boolean;
}) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showInfoForm, setShowInfoForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [infoNote, setInfoNote] = useState("");

  const status = mapApplicationStatus(application.application_status);
  const statusStyles: Record<ApprovalStatus, string> = {
    pending: "bg-coral-blush/20 text-deep-teal",
    approved: "bg-pacific-teal/10 text-pacific-teal",
    rejected: "bg-red-100 text-red-700",
    more_info: "bg-deep-teal/5 text-deep-teal/70",
  };

  const affiliateLabel = application.affiliate?.affiliate_code
    ? application.affiliate.affiliate_code
    : "Direct / none";

  const addressLine = [
    application.address.address1,
    application.address.address2,
    application.address.city,
    application.address.state,
    application.address.zip,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-light text-deep-teal">{application.clinic_name}</h2>
          <p className="mt-1 text-sm text-deep-teal/55">
            Submitted {new Date(application.created_at).toLocaleString()}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[status]}`}
        >
          {application.application_status.replaceAll("_", " ")}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-deep-teal/45">NPI#</dt>
          <dd className="font-mono text-deep-teal">{application.npi_number ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-deep-teal/45">DEA#</dt>
          <dd className="font-mono text-deep-teal">{application.dea_number ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-deep-teal/45">Applicant</dt>
          <dd className="text-deep-teal">{application.primary_contact_name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-deep-teal/45">Email</dt>
          <dd className="text-deep-teal">{application.email}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-deep-teal/45">Address</dt>
          <dd className="text-deep-teal">{addressLine || "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-deep-teal/45">Affiliate attribution</dt>
          <dd className="text-deep-teal">{affiliateLabel}</dd>
        </div>
        {application.banking ? (
          <div className="sm:col-span-2">
            <dt className="text-deep-teal/45">Banking</dt>
            <dd className="text-deep-teal">
              {application.banking.bank_name} · {application.banking.account_type} · routing ••••
              {application.banking.routing_last4} · account ••••{application.banking.account_last4}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-wide text-deep-teal/45">Documents</p>
        {application.documents.length === 0 ? (
          <p className="mt-2 text-sm text-deep-teal/50">No documents uploaded yet.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {application.documents.map((doc) => (
              <li key={doc.id}>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-deep-teal/15 px-3 py-1 text-xs text-pacific-teal hover:underline"
                >
                  {DOCUMENT_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {application.admin_note ? (
        <p className="mt-4 rounded-lg bg-deep-teal/[0.03] px-3 py-2 text-sm text-deep-teal/70">
          <span className="font-medium text-deep-teal">Admin note:</span> {application.admin_note}
        </p>
      ) : null}

      {application.rejection_reason ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <span className="font-medium">Rejection reason:</span> {application.rejection_reason}
        </p>
      ) : null}

      {isReviewableApplication(application) ? (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-deep-teal/10 pt-4">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onApprove}
            className="rounded-full bg-pacific-teal px-4 py-2 text-sm font-medium text-pure-white hover:bg-deep-teal disabled:opacity-60"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => {
              setShowRejectForm((value) => !value);
              setShowInfoForm(false);
            }}
            className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            Reject
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => {
              setShowInfoForm((value) => !value);
              setShowRejectForm(false);
            }}
            className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm font-medium text-deep-teal disabled:opacity-60"
          >
            Request More Info
          </button>
        </div>
      ) : null}

      {showRejectForm ? (
        <div className="mt-4 space-y-2">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="Explain why the application is being rejected…"
            className="w-full rounded-xl border border-deep-teal/15 px-3 py-2 text-sm outline-none focus:border-pacific-teal"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => {
                if (!rejectReason.trim()) {
                  toast.error("Rejection reason is required.");
                  return;
                }
                onReject(rejectReason.trim());
                setShowRejectForm(false);
                setRejectReason("");
              }}
              className="rounded-full bg-red-600 px-4 py-2 text-sm text-pure-white disabled:opacity-60"
            >
              Confirm reject
            </button>
            <button
              type="button"
              onClick={() => setShowRejectForm(false)}
              className="text-sm text-deep-teal/50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {showInfoForm ? (
        <div className="mt-4 space-y-2">
          <textarea
            value={infoNote}
            onChange={(e) => setInfoNote(e.target.value)}
            rows={3}
            placeholder="Describe what additional information is needed…"
            className="w-full rounded-xl border border-deep-teal/15 px-3 py-2 text-sm outline-none focus:border-pacific-teal"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => {
                if (!infoNote.trim()) {
                  toast.error("Enter a note for the applicant.");
                  return;
                }
                onRequestInfo(infoNote.trim());
                setShowInfoForm(false);
                setInfoNote("");
              }}
              className="rounded-full bg-deep-teal px-4 py-2 text-sm text-pure-white disabled:opacity-60"
            >
              Send request
            </button>
            <button
              type="button"
              onClick={() => setShowInfoForm(false)}
              className="text-sm text-deep-teal/50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function AdminApprovalQueue() {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await listApplications({ page: 1, limit: 50 });
      setApplications(response.applications);
    } catch (error) {
      showError(error, "Unable to load applications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  async function handleReview(
    applicationId: string,
    body: Parameters<typeof reviewApplication>[1],
    successMessage: string,
  ) {
    setProcessingId(applicationId);
    try {
      const result = await reviewApplication(applicationId, body);
      toast.success(result.message || successMessage);
      await loadApplications();
    } catch (error) {
      showError(error, "Unable to update application.");
    } finally {
      setProcessingId(null);
    }
  }

  const pending = applications.filter(isReviewableApplication);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-light text-deep-teal">Approval Queue</h1>
          <p className="mt-1 text-sm text-deep-teal/55">
            {pending.length} pending application{pending.length === 1 ? "" : "s"} awaiting review
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadApplications()}
          className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm text-deep-teal hover:border-pacific-teal"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p className="rounded-2xl border border-deep-teal/10 bg-pure-white px-6 py-12 text-center text-sm text-deep-teal/50">
            Loading applications…
          </p>
        ) : pending.length === 0 ? (
          <p className="rounded-2xl border border-deep-teal/10 bg-pure-white px-6 py-12 text-center text-sm text-deep-teal/50">
            No pending applications.
          </p>
        ) : (
          pending.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              isProcessing={processingId === application.id}
              onApprove={() =>
                void handleReview(application.id, { action: "approve" }, "Application approved.")
              }
              onReject={(rejection_reason) =>
                void handleReview(
                  application.id,
                  { action: "reject", rejection_reason },
                  "Application rejected.",
                )
              }
              onRequestInfo={(admin_note) =>
                void handleReview(
                  application.id,
                  { action: "request_more_info", admin_note },
                  "More information requested.",
                )
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
