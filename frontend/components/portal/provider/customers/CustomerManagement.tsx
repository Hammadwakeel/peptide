"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, UserPlus, Users } from "lucide-react";
import { AddPatientModal } from "@/components/portal/provider/customers/AddPatientModal";
import { ProviderPageSection } from "@/components/portal/provider/shared/ProviderPageSection";
import {
  ProviderPageToolbar,
  toolbarBtnClass,
  toolbarBtnPrimaryClass,
} from "@/components/portal/provider/shared/ProviderPageToolbar";
import { getClinicProfile, invitePatient, listDoctorPatients } from "@/lib/doctor/api";
import {
  doctorPatientFullName,
  type DoctorPatient,
  type InvitePatientPayload,
} from "@/lib/doctor/types";
import { getPatientInitials } from "@/lib/patients/types";
import { fuseSearch } from "@/lib/search/fuse";
import { DOCTOR_PATIENT_SEARCH_KEYS } from "@/lib/search/keys";
import { showError, toast } from "@/lib/toast";

type CustomerFilter = "all" | "active" | "invited";

function AccountPill({ patient }: { patient: DoctorPatient }) {
  if (patient.has_account) {
    const verified = patient.email_verified;
    return (
      <span className="inline-flex rounded-full bg-pacific-teal/10 px-2.5 py-0.5 text-xs font-light text-pacific-teal">
        {verified === false ? "Account (unverified)" : "Active"}
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-deep-teal/10 px-2.5 py-0.5 text-xs font-light text-deep-teal/55">
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
  const [canInvitePatients, setCanInvitePatients] = useState(false);

  const loadPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const [response, profile] = await Promise.all([
        listDoctorPatients({ page: 1, limit: 100 }),
        getClinicProfile(),
      ]);
      setPatients(response.patients);
      setClinicName(response.clinic_name);
      setCanInvitePatients(profile.membership.permissions.includes("invite_patients"));
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

    if (search.trim()) {
      list = fuseSearch(list, search, DOCTOR_PATIENT_SEARCH_KEYS);
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
      <ProviderPageToolbar title="Customers">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as CustomerFilter)}
          className="rounded-full border border-deep-teal/25 bg-pure-white px-4 py-2 text-sm capitalize text-deep-teal outline-none focus:border-deep-teal"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
        </select>
        <button
          type="button"
          onClick={() => void loadPatients()}
          disabled={isLoading}
          className={toolbarBtnClass}
          aria-label="Refresh patients"
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
        </button>
        {canInvitePatients ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className={toolbarBtnPrimaryClass}
          >
            <UserPlus className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Invite patient</span>
          </button>
        ) : null}
      </ProviderPageToolbar>

      <ProviderPageSection
        icon={Users}
        title="Patients"
        subtitle={
          isLoading
            ? "Loading…"
            : clinicName
              ? `${filteredPatients.length} patient${filteredPatients.length === 1 ? "" : "s"} · ${clinicName}`
              : `${filteredPatients.length} patient${filteredPatients.length === 1 ? "" : "s"}`
        }
        noPadding
      >
        <div className="border-b border-deep-teal/10 p-4 sm:px-5">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone…"
            className="w-full rounded-full border border-deep-teal/15 px-4 py-2 text-sm outline-none focus:border-pacific-teal sm:max-w-md"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-deep-teal/10 bg-surface-muted/50 text-xs uppercase tracking-wide text-deep-teal/45">
              <tr>
                <th className="px-4 py-3 font-light">Patient</th>
                <th className="px-4 py-3 font-light">Email</th>
                <th className="px-4 py-3 font-light">Phone</th>
                <th className="px-4 py-3 font-light">Account</th>
                <th className="px-4 py-3 font-light">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => {
                const name = doctorPatientFullName(patient);
                return (
                  <tr key={patient.id} className="border-b border-deep-teal/5 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/portal/doctor/customers/${patient.id}`}
                        className="flex items-center gap-3 hover:opacity-80"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-deep-teal/10 text-xs font-light text-deep-teal">
                          {getPatientInitials(name)}
                        </span>
                        <span className="font-light text-deep-teal">{name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-deep-teal/70">{patient.email}</td>
                    <td className="px-4 py-3 text-deep-teal/70">{patient.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <AccountPill patient={patient} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/portal/doctor/messages?patient=${patient.id}`}
                        className="text-xs font-light text-pacific-teal hover:underline"
                      >
                        Chat
                      </Link>
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
                ? canInvitePatients
                  ? "No patients yet. Invite your first patient to get started."
                  : "No patients yet."
                : "No patients match your filters."}
            </p>
          ) : null}
        </div>
      </ProviderPageSection>

      <AddPatientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleInvite}
      />
    </div>
  );
}
