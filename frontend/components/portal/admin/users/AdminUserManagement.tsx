"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FrontierBuilding2Icon,
  FrontierMoreHorizontalIcon,
  FrontierRefreshCwIcon,
  ICON_SIZE_SM,
} from "@/components/icons/frontier";
import { frontierBrandIcons } from "@/components/icons/frontier/frontier-brand-icons";
import { frontierSidebarIcons } from "@/components/icons/frontier/frontier-sidebar-icons";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import {
  changePatientPassword,
  deleteUser,
} from "@/lib/admin/api";
import type { AdminClinicPatient } from "@/lib/admin/types";
import { useShallow } from "@/lib/hooks/zustand";
import { useAdminPortalStore } from "@/stores/admin-portal-store";
import { fuseSearch } from "@/lib/search/fuse";
import {
  ADMIN_CLINIC_PATIENT_SEARCH_KEYS,
  ADMIN_CLINIC_SEARCH_KEYS,
} from "@/lib/search/keys";
import { showError, toast } from "@/lib/toast";

function PasswordModal({
  patient,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  patient: AdminClinicPatient;
  onClose: () => void;
  onSubmit: (payload: { auto_generate: boolean; new_password?: string }) => void;
  isSubmitting: boolean;
}) {
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [newPassword, setNewPassword] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-deep-teal/40 p-4 sm:items-center">
      <button type="button" aria-label="Close" className="absolute inset-0" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-2xl border border-deep-teal/10 bg-pure-white p-6 shadow-xl"
      >
        <h2 className="font-sans text-xl font-light text-deep-teal">Change password</h2>
        <p className="mt-2 text-sm text-deep-teal/60">
          Update password for {patient.first_name} {patient.last_name} ({patient.email})
        </p>

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-2 text-sm text-deep-teal/75">
            <input
              type="checkbox"
              checked={autoGenerate}
              onChange={(e) => setAutoGenerate(e.target.checked)}
              className="size-4 rounded"
            />
            Auto-generate password and email it to the patient
          </label>
          {!autoGenerate ? (
            <div>
              <label htmlFor="new-password" className={authLabelClassName}>New password</label>
              <input
                id="new-password"
                type="password"
                minLength={8}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={authInputClassName}
              />
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm text-deep-teal"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              if (!autoGenerate && newPassword.length < 8) {
                toast.error("Password must be at least 8 characters.");
                return;
              }
              onSubmit(
                autoGenerate
                  ? { auto_generate: true }
                  : { auto_generate: false, new_password: newPassword },
              );
            }}
            className="rounded-full bg-deep-teal px-4 py-2 text-sm text-pure-white disabled:opacity-60"
          >
            {isSubmitting ? "Saving…" : "Update password"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminUserManagement() {
  const { clinics, patientsByClinicId, isLoading, refreshUserManagement, updateClinicPatients } =
    useAdminPortalStore(
      useShallow((state) => ({
        clinics: state.clinics,
        patientsByClinicId: state.patientsByClinicId,
        isLoading: state.isLoading,
        refreshUserManagement: state.refreshUserManagement,
        updateClinicPatients: state.updateClinicPatients,
      })),
    );
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [clinicSearch, setClinicSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [passwordPatient, setPasswordPatient] = useState<AdminClinicPatient | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedClinicId && clinics[0]) {
      setSelectedClinicId(clinics[0].id);
    }
  }, [clinics, selectedClinicId]);

  const loadAllData = useCallback(async () => {
    await refreshUserManagement(true);
  }, [refreshUserManagement]);

  const filteredClinics = useMemo(
    () => fuseSearch(clinics, clinicSearch, ADMIN_CLINIC_SEARCH_KEYS),
    [clinics, clinicSearch],
  );

  const clinicPatients = useMemo(
    () => (selectedClinicId ? (patientsByClinicId[selectedClinicId] ?? []) : []),
    [patientsByClinicId, selectedClinicId],
  );

  const filteredPatients = useMemo(
    () => fuseSearch(clinicPatients, patientSearch, ADMIN_CLINIC_PATIENT_SEARCH_KEYS),
    [clinicPatients, patientSearch],
  );

  const selectedClinic = useMemo(
    () => clinics.find((clinic) => clinic.id === selectedClinicId) ?? null,
    [clinics, selectedClinicId],
  );

  async function handleDeleteUser(patient: AdminClinicPatient) {
    if (!patient.user_id) {
      toast.error("This patient does not have a user account yet.");
      return;
    }

    if (!window.confirm(`Deactivate account for ${patient.email}?`)) {
      return;
    }

    if (!selectedClinicId) return;

    setDeletingUserId(patient.user_id);
    setOpenMenuId(null);
    try {
      const result = await deleteUser(patient.user_id);
      toast.success(result.message);
      updateClinicPatients(selectedClinicId, (patients) =>
        patients.map((entry) =>
          entry.user_id === patient.user_id
            ? { ...entry, has_account: false, status: "inactive" }
            : entry,
        ),
      );
    } catch (error) {
      showError(error, "Unable to deactivate user.");
    } finally {
      setDeletingUserId(null);
    }
  }

  async function handlePasswordChange(
    patient: AdminClinicPatient,
    payload: { auto_generate: boolean; new_password?: string },
  ) {
    if (!patient.has_account) {
      toast.error("This patient does not have a user account yet.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const result = await changePatientPassword(patient.id, payload);
      toast.success(result.message);
      setPasswordPatient(null);
    } catch (error) {
      showError(error, "Unable to change password.");
    } finally {
      setIsSavingPassword(false);
    }
  }

  const searchClass =
    "w-full rounded-xl border border-deep-teal/15 bg-pure-white py-2.5 pl-9 pr-3 text-sm text-deep-teal outline-none focus:border-deep-teal disabled:opacity-50";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-2xl border border-deep-teal/20 bg-pure-white px-4 py-2.5 shadow-[0_2px_12px_rgba(1,26,36,0.08)] sm:px-5">
        <h1 className="shrink-0 font-sans text-xl font-light text-deep-teal sm:text-2xl">Users</h1>
        <div className="min-w-4 flex-1" aria-hidden="true" />
        <button
          type="button"
          onClick={() => void loadAllData()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-full bg-deep-teal px-4 py-2 text-sm font-light text-pure-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <FrontierRefreshCwIcon size={ICON_SIZE_SM} className={isLoading ? "animate-spin" : ""} aria-hidden="true" />
          Refresh
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <section className="flex flex-col overflow-hidden rounded-2xl border border-deep-teal/25 bg-pure-white shadow-[0_4px_24px_rgba(1,26,36,0.12)]">
          <div className="border-b border-deep-teal/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-deep-teal/15 bg-deep-teal/5 text-deep-teal"
                aria-hidden="true"
              >
                <FrontierBuilding2Icon size={ICON_SIZE_SM} />
              </div>
              <div>
                <h2 className="font-sans text-lg font-semibold text-deep-teal">Clinics</h2>
                <p className="text-xs text-deep-teal/60">
                  {isLoading ? "Loading…" : `${filteredClinics.length} shown`}
                </p>
              </div>
            </div>
          </div>

          <div className="border-b border-deep-teal/10 bg-surface-muted/50 px-5 py-4">
            <div className="relative">
              <frontierBrandIcons.search
                size={ICON_SIZE_SM}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-deep-teal/35"
                aria-hidden="true"
              />
              <input
                type="search"
                value={clinicSearch}
                onChange={(e) => setClinicSearch(e.target.value)}
                placeholder="Search clinics…"
                className={searchClass}
              />
            </div>
          </div>

          <div className="max-h-[520px] flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <p className="px-3 py-10 text-center text-sm text-deep-teal/50">Loading clinics…</p>
            ) : filteredClinics.length === 0 ? (
              <p className="px-3 py-10 text-center text-sm text-deep-teal/50">No clinics found.</p>
            ) : (
              <ul className="divide-y divide-deep-teal/8">
                {filteredClinics.map((clinic) => {
                  const isSelected = clinic.id === selectedClinicId;
                  return (
                    <li key={clinic.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClinicId(clinic.id);
                          setPatientSearch("");
                        }}
                        className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                          isSelected
                            ? "bg-deep-teal/5 ring-1 ring-deep-teal/15"
                            : "hover:bg-deep-teal/[0.03]"
                        }`}
                      >
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-light ${
                            isSelected
                              ? "bg-deep-teal text-pure-white"
                              : "bg-deep-teal/10 text-deep-teal"
                          }`}
                          aria-hidden="true"
                        >
                          {clinic.clinic_name.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-light text-deep-teal">{clinic.clinic_name}</p>
                          <p className="mt-0.5 truncate text-xs text-deep-teal/55">{clinic.email}</p>
                          <p className="mt-1.5 text-xs text-deep-teal/45">
                            {clinic.patient_count} patients · {clinic.staff_count} staff
                          </p>
                          <span
                            className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-light uppercase tracking-wide ${
                              clinic.status === "approved"
                                ? "bg-deep-teal/10 text-deep-teal"
                                : "bg-coral-blush/80 text-deep-teal"
                            }`}
                          >
                            {clinic.status}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-deep-teal/25 bg-pure-white shadow-[0_4px_24px_rgba(1,26,36,0.12)]">
          <div className="border-b border-deep-teal/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-deep-teal/15 bg-deep-teal/5 text-deep-teal"
                aria-hidden="true"
              >
                <frontierSidebarIcons.users size={ICON_SIZE_SM} />
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-sans text-lg font-semibold text-deep-teal">
                  {selectedClinic ? `${selectedClinic.clinic_name} — Patients` : "Patients"}
                </h2>
                <p className="text-xs text-deep-teal/60">
                  {isLoading
                    ? "Loading…"
                    : selectedClinicId
                      ? `${filteredPatients.length} shown`
                      : "Select a clinic"}
                </p>
              </div>
            </div>
          </div>

          <div className="border-b border-deep-teal/10 bg-surface-muted/50 px-5 py-4">
            <div className="relative">
              <frontierBrandIcons.search
                size={ICON_SIZE_SM}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-deep-teal/35"
                aria-hidden="true"
              />
              <input
                type="search"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                placeholder="Search patients…"
                className={searchClass}
                disabled={!selectedClinicId || isLoading}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-deep-teal/10 text-[10px] text-deep-teal/60">
                <tr>
                  <th className="px-5 py-3 font-light">Name</th>
                  <th className="hidden px-4 py-3 font-light sm:table-cell">Email</th>
                  <th className="px-4 py-3 font-light">Status</th>
                  <th className="hidden px-4 py-3 font-light md:table-cell">Account</th>
                  <th className="px-5 py-3 text-right font-light">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-deep-teal/8">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-deep-teal/50">
                      Loading patients…
                    </td>
                  </tr>
                ) : !selectedClinicId ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-deep-teal/50">
                      Select a clinic to view patients.
                    </td>
                  </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-deep-teal/50">
                      No patients found for this clinic.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="transition-colors hover:bg-deep-teal/[0.03]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-deep-teal text-sm font-light text-pure-white">
                            {(patient.first_name?.[0] ?? patient.email[0] ?? "?").toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-light text-deep-teal">
                              {patient.first_name} {patient.last_name}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-deep-teal/45 sm:hidden">
                              {patient.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-4 text-deep-teal/70 sm:table-cell">{patient.email}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-light capitalize ${
                            patient.status === "active"
                              ? "bg-deep-teal/10 text-deep-teal"
                              : "bg-coral-blush/80 text-deep-teal"
                          }`}
                        >
                          {patient.status}
                        </span>
                      </td>
                      <td className="hidden px-4 py-4 text-deep-teal/70 md:table-cell">
                        {patient.has_account ? "Active" : "No account"}
                      </td>
                      <td className="relative px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(openMenuId === patient.id ? null : patient.id)}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-deep-teal/50 transition-colors hover:bg-deep-teal/10 hover:text-deep-teal"
                          aria-label={`Actions for ${patient.first_name} ${patient.last_name}`}
                        >
                          <FrontierMoreHorizontalIcon size={ICON_SIZE_SM} />
                        </button>
                        {openMenuId === patient.id ? (
                          <>
                            <button
                              type="button"
                              aria-label="Close menu"
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenMenuId(null)}
                            />
                            <div className="absolute right-5 top-full z-20 mt-1 min-w-[160px] overflow-hidden rounded-xl border border-deep-teal/15 bg-pure-white py-1 shadow-lg">
                              <button
                                type="button"
                                disabled={!patient.has_account}
                                onClick={() => {
                                  setPasswordPatient(patient);
                                  setOpenMenuId(null);
                                }}
                                className="block w-full px-4 py-2 text-left text-sm text-deep-teal hover:bg-deep-teal/5 disabled:opacity-40"
                              >
                                Change password
                              </button>
                              <button
                                type="button"
                                disabled={!patient.user_id || deletingUserId === patient.user_id}
                                onClick={() => void handleDeleteUser(patient)}
                                className="block w-full px-4 py-2 text-left text-sm text-deep-teal/60 hover:bg-coral-blush/40 disabled:opacity-40"
                              >
                                {deletingUserId === patient.user_id ? "Deleting…" : "Delete user"}
                              </button>
                            </div>
                          </>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {passwordPatient ? (
        <PasswordModal
          patient={passwordPatient}
          onClose={() => setPasswordPatient(null)}
          isSubmitting={isSavingPassword}
          onSubmit={(payload) => void handlePasswordChange(passwordPatient, payload)}
        />
      ) : null}
    </div>
  );
}
