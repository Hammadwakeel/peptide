"use client";

import { RoleOnboardingChecklist } from "@/components/onboarding/RoleOnboardingChecklist";
import { useCallback, useState } from "react";
import {
  Building2,
  FileText,
  Landmark,
  Mail,
  MapPin,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { reviewApplication } from "@/lib/admin/api";
import { useShallow } from "@/lib/hooks/zustand";
import { useAdminPortalStore } from "@/stores/admin-portal-store";
import {
  DOCUMENT_TYPE_LABELS,
  formatPrimaryContactName,
  isReviewableApplication,
  mapApplicationStatus,
  type AdminApplication,
  type ApprovalStatus,
} from "@/lib/admin/types";
import { showError, toast } from "@/lib/toast";

const STATUS_STYLES: Record<ApprovalStatus, string> = {
  pending: "border-coral-blush bg-coral-blush/70 text-deep-teal",
  approved: "border-deep-teal/20 bg-deep-teal/10 text-deep-teal",
  rejected: "border-coral-blush bg-coral-blush/50 text-deep-teal",
  more_info: "border-deep-teal/15 bg-surface-subtle text-deep-teal/75",
};

function formatSubmittedAt(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function DetailPanel({
  icon: Icon,
  label,
  children,
  className = "",
}: {
  icon: typeof Building2;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`h-full rounded-lg border border-deep-teal/10 bg-pure-white p-3 ${className}`}
    >
      <div className="flex items-center gap-1.5 border-b border-deep-teal/8 pb-2">
        <Icon className="size-3 shrink-0 text-deep-teal" aria-hidden="true" />
        <p className="font-sans text-[10px] font-medium text-deep-teal">{label}</p>
      </div>
      <div className="mt-2 flex flex-col gap-1.5 text-sm leading-snug text-deep-teal">{children}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
  stacked,
}: {
  label: string;
  value: string;
  mono?: boolean;
  stacked?: boolean;
}) {
  if (stacked) {
    return (
      <div>
        <p className="text-[11px] text-deep-teal/45">{label}</p>
        <p className={`break-words ${mono ? "font-mono text-xs" : "text-sm"}`}>{value}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[minmax(0,6.5rem)_1fr] items-baseline gap-x-2">
      <p className="text-[11px] text-deep-teal/45">{label}</p>
      <p className={`break-words text-right sm:text-left ${mono ? "font-mono text-xs" : "text-sm"}`}>
        {value}
      </p>
    </div>
  );
}

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
  const affiliateLabel = application.affiliate?.affiliate_code ?? "Direct / none";
  const applicantName = formatPrimaryContactName(application) ?? "—";
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
    <article className="overflow-hidden rounded-2xl border border-deep-teal/25 bg-pure-white shadow-[0_4px_24px_rgba(1,26,36,0.12)]">
      <div className="bg-deep-teal px-4 py-3 text-pure-white">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-pure-white/15 text-sm font-medium"
              aria-hidden="true"
            >
              {application.clinic_name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="font-sans text-lg font-semibold leading-tight sm:text-xl">
                {application.clinic_name}
              </h2>
              <p className="text-xs text-pure-white/75">
                Submitted {formatSubmittedAt(application.created_at)}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${STATUS_STYLES[status]}`}
          >
            {application.application_status.replaceAll("_", " ")}
          </span>
        </div>
      </div>

      <div className="space-y-2 bg-surface-muted/50 p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <DetailPanel icon={Building2} label="Licenses">
            <DetailRow label="NPI" value={application.npi_number ?? "—"} mono stacked />
            <DetailRow label="DEA" value={application.dea_number ?? "—"} mono stacked />
          </DetailPanel>

          <DetailPanel icon={UserRound} label="Contact">
            <DetailRow label="Applicant" value={applicantName} stacked />
            <DetailRow label="Email" value={application.email} stacked />
          </DetailPanel>

          <DetailPanel icon={MapPin} label="Location">
            <DetailRow label="Practice address" value={addressLine || "—"} stacked />
          </DetailPanel>

          <DetailPanel icon={Mail} label="Attribution">
            <DetailRow label="Affiliate code" value={affiliateLabel} mono stacked />
          </DetailPanel>

          {application.banking ? (
            <DetailPanel icon={Landmark} label="Banking">
              <DetailRow
                label="Account"
                value={`${application.banking.bank_name} · ${application.banking.account_type}`}
                stacked
              />
              <DetailRow
                label="Masked details"
                value={`Routing ••••${application.banking.routing_last4} · Account ••••${application.banking.account_last4}`}
                mono
                stacked
              />
            </DetailPanel>
          ) : (
            <DetailPanel icon={Landmark} label="Banking">
              <p className="text-xs text-deep-teal/50">No banking details on file.</p>
            </DetailPanel>
          )}

          <DetailPanel icon={FileText} label="Documents">
            {application.documents.length === 0 ? (
              <p className="text-sm text-deep-teal/50">No documents uploaded yet.</p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {application.documents.map((doc) => (
                  <li key={doc.id}>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-full border border-deep-teal/10 bg-surface-muted px-2.5 py-0.5 text-[11px] font-medium text-deep-teal transition-colors hover:bg-deep-teal/5"
                    >
                      {DOCUMENT_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </DetailPanel>
        </div>

        {application.admin_note ? (
          <p className="rounded-lg border border-deep-teal/15 bg-pure-white px-3 py-2 text-sm leading-snug text-deep-teal/75">
            <span className="font-medium text-deep-teal">Admin note:</span> {application.admin_note}
          </p>
        ) : null}

        {application.rejection_reason ? (
          <p className="rounded-lg border border-coral-blush bg-coral-blush/30 px-3 py-2 text-sm leading-snug text-deep-teal">
            <span className="font-medium">Rejection reason:</span> {application.rejection_reason}
          </p>
        ) : null}

        {showRejectForm ? (
          <div className="space-y-2 rounded-lg border border-coral-blush bg-coral-blush/20 p-3">
            <label htmlFor={`reject-${application.id}`} className="text-sm font-medium text-deep-teal">
              Rejection reason
            </label>
            <textarea
              id={`reject-${application.id}`}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Explain why the application is being rejected…"
              className="w-full rounded-xl border border-deep-teal/15 bg-pure-white px-3 py-2 text-sm outline-none focus:border-deep-teal"
            />
            <div className="flex flex-wrap gap-2">
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
                className="rounded-full bg-deep-teal px-4 py-2 text-sm text-pure-white disabled:opacity-60"
              >
                Confirm reject
              </button>
              <button
                type="button"
                onClick={() => setShowRejectForm(false)}
                className="text-sm text-deep-teal/50 hover:text-deep-teal"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

        {showInfoForm ? (
          <div className="space-y-2 rounded-lg border border-deep-teal/10 bg-pure-white p-3">
            <label htmlFor={`info-${application.id}`} className="text-sm font-medium text-deep-teal">
              Information request
            </label>
            <textarea
              id={`info-${application.id}`}
              value={infoNote}
              onChange={(e) => setInfoNote(e.target.value)}
              rows={3}
              placeholder="Describe what additional information is needed…"
              className="w-full rounded-xl border border-deep-teal/15 bg-pure-white px-3 py-2 text-sm outline-none focus:border-deep-teal"
            />
            <div className="flex flex-wrap gap-2">
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
                className="text-sm text-deep-teal/50 hover:text-deep-teal"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {isReviewableApplication(application) ? (
        <div className="flex flex-wrap gap-2 border-t border-deep-teal/10 bg-pure-white px-3 py-3 sm:px-4">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onApprove}
            className="rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white transition-opacity hover:opacity-90 disabled:opacity-60"
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
            className="rounded-full border border-coral-blush px-4 py-2 text-sm font-medium text-deep-teal transition-colors hover:bg-coral-blush/40 disabled:opacity-60"
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
            className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm font-medium text-deep-teal transition-colors hover:bg-deep-teal/5 disabled:opacity-60"
          >
            Request more info
          </button>
        </div>
      ) : null}
    </article>
  );
}

export function AdminApprovalQueue() {
  const { applications, isLoading, refreshApplications } = useAdminPortalStore(
    useShallow((state) => ({
      applications: state.applications,
      isLoading: state.isLoading,
      refreshApplications: state.refreshApplications,
    })),
  );
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    await refreshApplications(true);
  }, [refreshApplications]);

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
      <RoleOnboardingChecklist role="admin" />

      <div className="flex items-center gap-4 rounded-2xl border border-deep-teal/20 bg-pure-white px-4 py-2.5 shadow-[0_2px_12px_rgba(1,26,36,0.08)] sm:px-5">
        <h1 className="shrink-0 font-sans text-xl font-semibold text-deep-teal sm:text-2xl">
          Approval Queue
        </h1>
        <div className="min-w-4 flex-1" aria-hidden="true" />
        <button
          type="button"
          onClick={() => void loadApplications()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1].map((key) => (
              <div
                key={key}
                className="h-64 animate-pulse rounded-2xl border border-deep-teal/10 bg-surface-muted"
              />
            ))}
          </div>
        ) : pending.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-deep-teal/20 bg-surface-muted/50 px-6 py-16 text-center">
            <p className="font-sans text-xl font-semibold text-deep-teal">All caught up</p>
            <p className="mt-2 text-sm text-deep-teal/55">No pending clinic applications right now.</p>
          </div>
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
