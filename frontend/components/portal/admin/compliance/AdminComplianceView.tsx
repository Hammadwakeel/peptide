"use client";

import { useMemo, useState } from "react";
import { MOCK_AUDIT_LOG, MOCK_COMPLIANCE } from "@/lib/admin/mock-data";
import { COMPLIANCE_STATUS_LABELS, type ComplianceStatus } from "@/lib/admin/types";
import { toast } from "@/lib/toast";

function StatusCell({ status }: { status: ComplianceStatus }) {
  const styles: Record<ComplianceStatus, string> = {
    verified: "text-pacific-teal",
    pending: "text-deep-teal/60",
    expired: "text-coral-blush",
    missing: "text-red-600",
  };
  return <span className={`text-xs font-medium ${styles[status]}`}>{COMPLIANCE_STATUS_LABELS[status]}</span>;
}

export function AdminComplianceView() {
  const [tab, setTab] = useState<"compliance" | "audit">("compliance");
  const [auditSearch, setAuditSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const auditEntries = useMemo(() => {
    let list = [...MOCK_AUDIT_LOG];
    const q = auditSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (entry) =>
          entry.actor.toLowerCase().includes(q) ||
          entry.action.toLowerCase().includes(q) ||
          entry.entity.toLowerCase().includes(q),
      );
    }
    if (actionFilter !== "all") {
      list = list.filter((entry) => entry.action.startsWith(actionFilter));
    }
    return list;
  }, [auditSearch, actionFilter]);

  const actionTypes = useMemo(
    () => Array.from(new Set(MOCK_AUDIT_LOG.map((e) => e.action.split(".")[0]))),
    [],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setTab("compliance")} className={`rounded-full px-4 py-2 text-sm font-medium ${tab === "compliance" ? "bg-deep-teal text-pure-white" : "border border-deep-teal/15 text-deep-teal/70"}`}>Compliance</button>
        <button type="button" onClick={() => setTab("audit")} className={`rounded-full px-4 py-2 text-sm font-medium ${tab === "audit" ? "bg-deep-teal text-pure-white" : "border border-deep-teal/15 text-deep-teal/70"}`}>Audit Log</button>
      </div>

      {tab === "compliance" ? (
        <>
          <div>
            <h1 className="font-serif text-2xl font-light text-deep-teal">Compliance</h1>
            <p className="mt-1 text-sm text-deep-teal/55">Clinic credential verification status</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase tracking-wide text-deep-teal/45">
                <tr>
                  <th className="px-4 py-3">Clinic</th>
                  <th className="px-4 py-3">NPI</th>
                  <th className="px-4 py-3">DEA</th>
                  <th className="px-4 py-3">State License</th>
                  <th className="px-4 py-3">Agreement</th>
                  <th className="px-4 py-3">Last Verified</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_COMPLIANCE.map((row) => (
                  <tr key={row.id} className="border-b border-deep-teal/5">
                    <td className="px-4 py-3 font-medium text-deep-teal">{row.clinicName}</td>
                    <td className="px-4 py-3"><StatusCell status={row.npiStatus} /></td>
                    <td className="px-4 py-3"><StatusCell status={row.deaStatus} /></td>
                    <td className="px-4 py-3"><StatusCell status={row.stateLicenseStatus} /></td>
                    <td className="px-4 py-3"><StatusCell status={row.providerAgreementStatus} /></td>
                    <td className="px-4 py-3 text-deep-teal/70">{row.lastVerified}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => toast.info(`Reviewing ${row.clinicName} compliance.`)} className="text-xs text-pacific-teal hover:underline">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div>
            <h1 className="font-serif text-2xl font-light text-deep-teal">Audit Log</h1>
            <p className="mt-1 text-sm text-deep-teal/55">Timestamped platform activity</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <input type="search" value={auditSearch} onChange={(e) => setAuditSearch(e.target.value)} placeholder="Search actor, action, entity…" className="min-w-[200px] flex-1 rounded-xl border border-deep-teal/15 px-3 py-2 text-sm" />
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="rounded-xl border border-deep-teal/15 px-3 py-2 text-sm">
              <option value="all">All actions</option>
              {actionTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            {auditEntries.map((entry) => (
              <article key={entry.id} className="rounded-xl border border-deep-teal/10 bg-pure-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-mono text-xs text-deep-teal/45">{new Date(entry.timestamp).toLocaleString()}</p>
                  <span className="rounded-full bg-deep-teal/5 px-2 py-0.5 text-[10px] font-medium text-deep-teal/60">{entry.action}</span>
                </div>
                <p className="mt-2 text-sm text-deep-teal"><span className="text-deep-teal/50">Actor:</span> {entry.actor}</p>
                <p className="text-sm text-deep-teal"><span className="text-deep-teal/50">Entity:</span> {entry.entity}</p>
                <div className="mt-3 grid gap-2 rounded-lg bg-deep-teal/[0.03] p-3 text-xs sm:grid-cols-2">
                  <div><span className="text-deep-teal/45">Before:</span> <span className="font-mono text-deep-teal">{entry.before}</span></div>
                  <div><span className="text-deep-teal/45">After:</span> <span className="font-mono text-deep-teal">{entry.after}</span></div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
