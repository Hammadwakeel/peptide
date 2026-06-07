"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AddPatientModal } from "@/components/portal/provider/customers/AddPatientModal";
import { usePatients } from "@/context/PatientsProvider";
import {
  getPatientInitials,
  PATIENT_STATUS_LABELS,
  type PatientFilter,
  type PatientStatus,
} from "@/lib/patients/types";
import { toast } from "@/lib/toast";

function StatusPill({ status }: { status: PatientStatus }) {
  const styles = {
    active: "bg-pacific-teal/10 text-pacific-teal",
    inactive: "bg-deep-teal/10 text-deep-teal/55",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {PATIENT_STATUS_LABELS[status]}
    </span>
  );
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CustomerManagement() {
  const { patients, addPatient } = usePatients();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PatientFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);

  const filteredPatients = useMemo(() => {
    let list = [...patients];
    if (filter === "active") list = list.filter((patient) => patient.status === "active");
    if (filter === "inactive") list = list.filter((patient) => patient.status === "inactive");

    const query = search.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (patient) =>
          patient.name.toLowerCase().includes(query) ||
          patient.email.toLowerCase().includes(query) ||
          patient.phone.includes(query),
      );
    }
    return list;
  }, [patients, search, filter]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-deep-teal/10 bg-deep-teal/[0.02] px-4 py-4 sm:px-5">
        <h2 className="font-serif text-xl font-light text-deep-teal">Customer Management</h2>
        <p className="mt-1 text-sm text-deep-teal/60">
          View and manage patients, orders, and product requests for your clinic.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or phone…"
          className="w-full rounded-xl border border-deep-teal/15 px-3 py-2 text-sm outline-none focus:border-pacific-teal lg:max-w-md"
        />
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white hover:bg-pacific-teal"
        >
          Add New Customer
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "active", "inactive"] as PatientFilter[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
              filter === tab
                ? "bg-deep-teal text-pure-white"
                : "border border-deep-teal/15 text-deep-teal/70"
            }`}
          >
            {tab === "all" ? "All" : tab}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase tracking-wide text-deep-teal/45">
            <tr>
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Total Orders</th>
              <th className="px-4 py-3 font-medium">Last Order</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="border-b border-deep-teal/5 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-deep-teal/10 text-xs font-medium text-deep-teal">
                      {getPatientInitials(patient.name)}
                    </span>
                    <span className="font-medium text-deep-teal">{patient.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-deep-teal/70">{patient.email}</td>
                <td className="px-4 py-3 text-deep-teal/70">{patient.phone}</td>
                <td className="px-4 py-3 text-deep-teal">{patient.totalOrders}</td>
                <td className="px-4 py-3 text-deep-teal/70">{formatDate(patient.lastOrderDate)}</td>
                <td className="px-4 py-3">
                  <StatusPill status={patient.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/portal/doctor/customers/${patient.id}`}
                      className="text-xs font-medium text-pacific-teal hover:underline"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => toast.success(`Create order flow opened for ${patient.name}.`)}
                      className="text-xs font-medium text-deep-teal/70 hover:text-deep-teal"
                    >
                      Create Order
                    </button>
                    <Link
                      href={`/portal/doctor/messages?patient=${patient.id}`}
                      className="text-xs font-medium text-deep-teal/70 hover:text-deep-teal"
                    >
                      Chat
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPatients.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-deep-teal/50">No patients match your filters.</p>
        ) : null}
      </div>

      <AddPatientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(payload) => {
          const patient = addPatient(payload);
          toast.success(
            payload.sendInvite
              ? `Invite sent to ${patient.email}.`
              : `${patient.name} created silently.`,
          );
        }}
      />
    </div>
  );
}
