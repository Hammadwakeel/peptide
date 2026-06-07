"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import {
  changePatientPassword,
  deleteUser,
  listClinicPatients,
  listClinics,
} from "@/lib/admin/api";
import type { AdminClinic, AdminClinicPatient } from "@/lib/admin/types";
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
        <h2 className="font-serif text-xl font-light text-deep-teal">Change password</h2>
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
  const [clinics, setClinics] = useState<AdminClinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [patients, setPatients] = useState<AdminClinicPatient[]>([]);
  const [clinicSearch, setClinicSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [isLoadingClinics, setIsLoadingClinics] = useState(true);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [passwordPatient, setPasswordPatient] = useState<AdminClinicPatient | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const loadClinics = useCallback(async () => {
    setIsLoadingClinics(true);
    try {
      const response = await listClinics({ page: 1, limit: 100 });
      setClinics(response.clinics);
      if (!selectedClinicId && response.clinics[0]) {
        setSelectedClinicId(response.clinics[0].id);
      }
    } catch (error) {
      showError(error, "Unable to load clinics.");
    } finally {
      setIsLoadingClinics(false);
    }
  }, [selectedClinicId]);

  const loadPatients = useCallback(async (clinicId: string) => {
    setIsLoadingPatients(true);
    try {
      const response = await listClinicPatients(clinicId, { page: 1, limit: 100 });
      setPatients(response.patients);
    } catch (error) {
      showError(error, "Unable to load clinic patients.");
      setPatients([]);
    } finally {
      setIsLoadingPatients(false);
    }
  }, []);

  useEffect(() => {
    void loadClinics();
  }, [loadClinics]);

  useEffect(() => {
    if (selectedClinicId) {
      void loadPatients(selectedClinicId);
    }
  }, [selectedClinicId, loadPatients]);

  const filteredClinics = useMemo(() => {
    const query = clinicSearch.trim().toLowerCase();
    if (!query) return clinics;
    return clinics.filter(
      (clinic) =>
        clinic.clinic_name.toLowerCase().includes(query) ||
        clinic.email.toLowerCase().includes(query),
    );
  }, [clinics, clinicSearch]);

  const filteredPatients = useMemo(() => {
    const query = patientSearch.trim().toLowerCase();
    if (!query) return patients;
    return patients.filter(
      (patient) =>
        `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(query) ||
        patient.email.toLowerCase().includes(query),
    );
  }, [patients, patientSearch]);

  const selectedClinic = clinics.find((clinic) => clinic.id === selectedClinicId) ?? null;

  async function handleDeleteUser(patient: AdminClinicPatient) {
    if (!patient.user_id) {
      toast.error("This patient does not have a user account yet.");
      return;
    }

    if (!window.confirm(`Deactivate account for ${patient.email}?`)) {
      return;
    }

    setDeletingUserId(patient.user_id);
    try {
      const result = await deleteUser(patient.user_id);
      toast.success(result.message);
      if (selectedClinicId) {
        await loadPatients(selectedClinicId);
      }
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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-light text-deep-teal">User Management</h1>
        <p className="mt-1 text-sm text-deep-teal/55">
          Browse clinics, manage patient accounts, reset passwords, and deactivate users
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <section className="rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
          <div className="border-b border-deep-teal/10 px-4 py-4">
            <h2 className="text-sm font-medium text-deep-teal">Clinics</h2>
            <input
              type="search"
              value={clinicSearch}
              onChange={(e) => setClinicSearch(e.target.value)}
              placeholder="Search clinics…"
              className="mt-3 w-full rounded-xl border border-deep-teal/15 px-3 py-2 text-sm"
            />
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            {isLoadingClinics ? (
              <p className="px-4 py-8 text-center text-sm text-deep-teal/50">Loading clinics…</p>
            ) : filteredClinics.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-deep-teal/50">No clinics found.</p>
            ) : (
              filteredClinics.map((clinic) => {
                const isSelected = clinic.id === selectedClinicId;
                return (
                  <button
                    key={clinic.id}
                    type="button"
                    onClick={() => setSelectedClinicId(clinic.id)}
                    className={`block w-full border-b border-deep-teal/5 px-4 py-4 text-left transition-colors ${
                      isSelected ? "bg-pacific-teal/5" : "hover:bg-deep-teal/[0.02]"
                    }`}
                  >
                    <p className="font-medium text-deep-teal">{clinic.clinic_name}</p>
                    <p className="mt-1 text-xs text-deep-teal/55">{clinic.email}</p>
                    <p className="mt-2 text-xs text-deep-teal/45">
                      {clinic.patient_count} patients · {clinic.staff_count} staff · {clinic.status}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
          <div className="border-b border-deep-teal/10 px-4 py-4">
            <h2 className="text-sm font-medium text-deep-teal">
              {selectedClinic ? `${selectedClinic.clinic_name} — Patients` : "Patients"}
            </h2>
            <input
              type="search"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Search patients…"
              className="mt-3 w-full rounded-xl border border-deep-teal/15 px-3 py-2 text-sm"
              disabled={!selectedClinicId}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase tracking-wide text-deep-teal/45">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!selectedClinicId ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-deep-teal/50">
                      Select a clinic to view patients.
                    </td>
                  </tr>
                ) : isLoadingPatients ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-deep-teal/50">
                      Loading patients…
                    </td>
                  </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-deep-teal/50">
                      No patients found for this clinic.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="border-b border-deep-teal/5">
                      <td className="px-4 py-3 font-medium text-deep-teal">
                        {patient.first_name} {patient.last_name}
                      </td>
                      <td className="px-4 py-3 text-deep-teal/70">{patient.email}</td>
                      <td className="px-4 py-3 capitalize text-deep-teal/70">{patient.status}</td>
                      <td className="px-4 py-3 text-deep-teal/70">
                        {patient.has_account ? "Active" : "No account"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2 text-xs">
                          <button
                            type="button"
                            disabled={!patient.has_account}
                            onClick={() => setPasswordPatient(patient)}
                            className="text-pacific-teal hover:underline disabled:opacity-40"
                          >
                            Change password
                          </button>
                          <button
                            type="button"
                            disabled={!patient.user_id || deletingUserId === patient.user_id}
                            onClick={() => void handleDeleteUser(patient)}
                            className="text-red-600 hover:underline disabled:opacity-40"
                          >
                            {deletingUserId === patient.user_id ? "Deleting…" : "Delete user"}
                          </button>
                        </div>
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
