"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AddPatientModal } from "@/components/portal/provider/customers/AddPatientModal";
import { invitePatient, listDoctorPatients } from "@/lib/doctor/api";
import {
  doctorPatientFullName,
  type DoctorPatient,
  type InvitePatientPayload,
} from "@/lib/doctor/types";
import { getPatientInitials } from "@/lib/patients/types";
import { showError, toast } from "@/lib/toast";

type CustomerFilter = "all" | "active" | "invited";

function AccountPill({ patient }: { patient: DoctorPatient }) {
  if (patient.has_account) {
    const verified = patient.email_verified;
    return (
      <span className="inline-flex rounded-full bg-pacific-teal/10 px-2.5 py-0.5 text-xs font-medium text-pacific-teal">
        {verified === false ? "Account (unverified)" : "Active"}
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-deep-teal/10 px-2.5 py-0.5 text-xs font-medium text-deep-teal/55">
      Invited
    </span>
  );
}

export function CustomerManagement() {
  const [patients, setPatients] = useState<DoctorPatient[]>([]);
  const [clinicName, setClinicName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CustomerFilter>("all");
  const [modalOpen, setModalOpen] = useState(false);

  const loadPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await listDoctorPatients({ page: 1, limit: 100 });
      setPatients(response.patients);
      setClinicName(response.clinic_name);
    } catch (error) {
      showError(error, "Unable to load patients.");
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  const filteredPatients = useMemo(() => {
    let list = [...patients];
    if (filter === "active") list = list.filter((patient) => patient.has_account);
    if (filter === "invited") list = list.filter((patient) => !patient.has_account);

    const query = search.trim().toLowerCase();
    if (query) {
      list = list.filter((patient) => {
        const name = doctorPatientFullName(patient).toLowerCase();
        return (
          name.includes(query) ||
          patient.email.toLowerCase().includes(query) ||
          (patient.phone?.toLowerCase().includes(query) ?? false)
        );
      });
    }
    return list;
  }, [patients, search, filter]);

  async function handleInvite(payload: InvitePatientPayload) {
    try {
      const result = await invitePatient(payload);
      toast.success(result.message || `Invite sent to ${payload.email}.`);
      await loadPatients();
    } catch (error) {
      showError(error, "Unable to invite patient.");
      throw error;
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-deep-teal/10 bg-deep-teal/[0.02] px-4 py-4 sm:px-5">
        <h2 className="font-serif text-xl font-light text-deep-teal">Customer Management</h2>
        <p className="mt-1 text-sm text-deep-teal/60">
          {clinicName
            ? `Patients for ${clinicName}. Invite new patients and manage relationships.`
            : "View and manage patients for your clinic."}
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
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadPatients()}
            className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm font-medium text-deep-teal hover:border-pacific-teal"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white hover:bg-pacific-teal"
          >
            Invite Patient
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "active", "invited"] as CustomerFilter[]).map((tab) => (
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
              <th className="px-4 py-3 font-medium">Account</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => {
              const name = doctorPatientFullName(patient);
              return (
                <tr key={patient.id} className="border-b border-deep-teal/5 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-deep-teal/10 text-xs font-medium text-deep-teal">
                        {getPatientInitials(name)}
                      </span>
                      <span className="font-medium text-deep-teal">{name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-deep-teal/70">{patient.email}</td>
                  <td className="px-4 py-3 text-deep-teal/70">{patient.phone || "—"}</td>
                  <td className="px-4 py-3">
                    <AccountPill patient={patient} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/portal/doctor/messages?patient=${patient.id}`}
                        className="text-xs font-medium text-pacific-teal hover:underline"
                      >
                        Chat
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {isLoading ? (
          <p className="px-4 py-10 text-center text-sm text-deep-teal/50">Loading patients…</p>
        ) : filteredPatients.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-deep-teal/50">
            {patients.length === 0
              ? "No patients yet. Invite your first patient to get started."
              : "No patients match your filters."}
          </p>
        ) : null}
      </div>

      <AddPatientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleInvite}
      />
    </div>
  );
}
