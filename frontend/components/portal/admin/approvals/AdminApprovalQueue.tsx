"use client";

import { useState } from "react";
import { MOCK_PENDING_APPLICATIONS } from "@/lib/admin/mock-data";
import type { ApprovalStatus, PendingApplication } from "@/lib/admin/types";
import { toast } from "@/lib/toast";

function ApplicationCard({
  application,
  onApprove,
  onReject,
  onRequestInfo,
}: {
  application: PendingApplication;
  onApprove: () => void;
  onReject: () => void;
  onRequestInfo: (note: string) => void;
}) {
  const [showInfoForm, setShowInfoForm] = useState(false);
  const [infoNote, setInfoNote] = useState("");

  function submitInfoRequest() {
    if (!infoNote.trim()) {
      toast.error("Enter a note for the applicant.");
      return;
    }
    onRequestInfo(infoNote.trim());
    setShowInfoForm(false);
    setInfoNote("");
  }

  const statusStyles: Record<ApprovalStatus, string> = {
    pending: "bg-coral-blush/20 text-deep-teal",
    approved: "bg-pacific-teal/10 text-pacific-teal",
    rejected: "bg-red-100 text-red-700",
    more_info: "bg-deep-teal/5 text-deep-teal/70",
  };

  return (
    <article className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-light text-deep-teal">{application.clinicName}</h2>
          <p className="mt-1 text-sm text-deep-teal/55">Submitted {application.submittedAt}</p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[application.status]}`}>
          {application.status.replace("_", " ")}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-deep-teal/45">NPI#</dt><dd className="font-mono text-deep-teal">{application.npi}</dd></div>
        <div><dt className="text-deep-teal/45">DEA#</dt><dd className="font-mono text-deep-teal">{application.dea}</dd></div>
        <div><dt className="text-deep-teal/45">Applicant</dt><dd className="text-deep-teal">{application.applicantName}</dd></div>
        <div><dt className="text-deep-teal/45">Email</dt><dd className="text-deep-teal">{application.applicantEmail}</dd></div>
        <div className="sm:col-span-2"><dt className="text-deep-teal/45">Affiliate attribution</dt><dd className="text-deep-teal">{application.affiliateAttribution}</dd></div>
      </dl>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-wide text-deep-teal/45">Documents</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {application.documents.map((doc) => (
            <li key={doc.url}>
              <a href={doc.url} className="rounded-full border border-deep-teal/15 px-3 py-1 text-xs text-pacific-teal hover:underline">
                {doc.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {application.adminNote ? (
        <p className="mt-4 rounded-lg bg-deep-teal/[0.03] px-3 py-2 text-sm text-deep-teal/70">
          <span className="font-medium text-deep-teal">Admin note:</span> {application.adminNote}
        </p>
      ) : null}

      {application.status === "pending" || application.status === "more_info" ? (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-deep-teal/10 pt-4">
          <button type="button" onClick={onApprove} className="rounded-full bg-pacific-teal px-4 py-2 text-sm font-medium text-pure-white hover:bg-deep-teal">Approve</button>
          <button type="button" onClick={onReject} className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50">Reject</button>
          <button type="button" onClick={() => setShowInfoForm((v) => !v)} className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm font-medium text-deep-teal">Request More Info</button>
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
            <button type="button" onClick={submitInfoRequest} className="rounded-full bg-deep-teal px-4 py-2 text-sm text-pure-white">Send request</button>
            <button type="button" onClick={() => setShowInfoForm(false)} className="text-sm text-deep-teal/50">Cancel</button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function AdminApprovalQueue() {
  const [applications, setApplications] = useState(MOCK_PENDING_APPLICATIONS);

  function updateStatus(id: string, status: ApprovalStatus, adminNote?: string) {
    setApplications((current) =>
      current.map((app) => (app.id === id ? { ...app, status, adminNote: adminNote ?? app.adminNote } : app)),
    );
  }

  const pending = applications.filter((app) => app.status === "pending" || app.status === "more_info");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-light text-deep-teal">Approval Queue</h1>
        <p className="mt-1 text-sm text-deep-teal/55">
          {pending.length} pending application{pending.length === 1 ? "" : "s"} awaiting review
        </p>
      </div>

      <div className="space-y-4">
        {pending.length === 0 ? (
          <p className="rounded-2xl border border-deep-teal/10 bg-pure-white px-6 py-12 text-center text-sm text-deep-teal/50">
            No pending applications.
          </p>
        ) : (
          pending.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onApprove={() => {
                updateStatus(application.id, "approved");
                toast.success(`${application.clinicName} approved.`);
              }}
              onReject={() => {
                updateStatus(application.id, "rejected");
                toast.success(`${application.clinicName} rejected.`);
              }}
              onRequestInfo={(note) => {
                updateStatus(application.id, "more_info", note);
                toast.info(`Info request sent to ${application.applicantEmail}.`);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
