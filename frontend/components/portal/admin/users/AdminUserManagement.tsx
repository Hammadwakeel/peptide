"use client";

import { useMemo, useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { MOCK_ADMIN_USERS } from "@/lib/admin/mock-data";
import {
  ADMIN_USER_ROLE_LABELS,
  ADMIN_USER_STATUS_LABELS,
  type AdminUser,
  type AdminUserRole,
  type AdminUserStatus,
} from "@/lib/admin/types";
import { toast } from "@/lib/toast";

function RolePill({ role }: { role: AdminUserRole }) {
  return (
    <span className="rounded-full bg-deep-teal/5 px-2 py-0.5 text-xs font-medium text-deep-teal/70">
      {ADMIN_USER_ROLE_LABELS[role]}
    </span>
  );
}

function StatusPill({ status }: { status: AdminUserStatus }) {
  const styles = {
    active: "bg-pacific-teal/10 text-pacific-teal",
    suspended: "bg-red-100 text-red-700",
    pending: "bg-coral-blush text-deep-teal/70",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {ADMIN_USER_STATUS_LABELS[status]}
    </span>
  );
}

function UserDetailModal({
  user,
  onClose,
  onSave,
}: {
  user: AdminUser;
  onClose: () => void;
  onSave: (updated: AdminUser) => void;
}) {
  const [draft, setDraft] = useState(user);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-deep-teal/40 p-4 sm:items-center">
      <button type="button" aria-label="Close" className="absolute inset-0" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-deep-teal/10 bg-pure-white p-6 shadow-xl">
        <h2 className="font-serif text-xl font-light text-deep-teal">Edit user</h2>
        <div className="mt-4 space-y-3">
          <div><label className={authLabelClassName}>Name</label><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={authInputClassName} /></div>
          <div><label className={authLabelClassName}>Email</label><input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className={authInputClassName} /></div>
          <div><label className={authLabelClassName}>Phone</label><input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} className={authInputClassName} /></div>
          <div>
            <label className={authLabelClassName}>Role</label>
            <select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as AdminUserRole })} className={authInputClassName}>
              {(Object.keys(ADMIN_USER_ROLE_LABELS) as AdminUserRole[]).map((role) => (
                <option key={role} value={role}>{ADMIN_USER_ROLE_LABELS[role]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={authLabelClassName}>Status</label>
            <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as AdminUserStatus })} className={authInputClassName}>
              {(Object.keys(ADMIN_USER_STATUS_LABELS) as AdminUserStatus[]).map((status) => (
                <option key={status} value={status}>{ADMIN_USER_STATUS_LABELS[status]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={authLabelClassName}>Document status</label>
            <select value={draft.documentStatus} onChange={(e) => setDraft({ ...draft, documentStatus: e.target.value as AdminUser["documentStatus"] })} className={authInputClassName}>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div>
            <label className={authLabelClassName}>Linked clinics</label>
            <input value={draft.linkedClinics.join(", ")} onChange={(e) => setDraft({ ...draft, linkedClinics: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className={authInputClassName} />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm text-deep-teal">Cancel</button>
          <button type="button" onClick={() => { onSave(draft); onClose(); }} className="rounded-full bg-deep-teal px-4 py-2 text-sm text-pure-white">Save</button>
        </div>
      </div>
    </div>
  );
}

export function AdminUserManagement() {
  const [users, setUsers] = useState(MOCK_ADMIN_USERS);
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<AdminUser | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.role.includes(q),
    );
  }, [users, search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-light text-deep-teal">User Management</h1>
          <p className="mt-1 text-sm text-deep-teal/55">{users.length} platform users</p>
        </div>
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className="w-full rounded-xl border border-deep-teal/15 px-3 py-2 text-sm sm:max-w-xs" />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase tracking-wide text-deep-teal/45">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Sign-up</th>
              <th className="px-4 py-3">Last login</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-deep-teal/5">
                <td className="px-4 py-3 font-medium text-deep-teal">{user.name}</td>
                <td className="px-4 py-3 text-deep-teal/70">{user.email}</td>
                <td className="px-4 py-3"><RolePill role={user.role} /></td>
                <td className="px-4 py-3"><StatusPill status={user.status} /></td>
                <td className="px-4 py-3 text-deep-teal/70">{user.signUpDate}</td>
                <td className="px-4 py-3 text-deep-teal/70">{user.lastLogin}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button type="button" onClick={() => setEditUser(user)} className="text-pacific-teal hover:underline">Edit</button>
                    <button type="button" onClick={() => { setUsers((c) => c.map((u) => u.id === user.id ? { ...u, status: u.status === "suspended" ? "active" : "suspended" } : u)); toast.success(user.status === "suspended" ? "User reactivated." : "User suspended."); }} className="text-deep-teal/60 hover:text-deep-teal">Suspend</button>
                    <button type="button" onClick={() => toast.info(`Impersonating ${user.email} (mock).`)} className="text-deep-teal/60 hover:text-deep-teal">Impersonate</button>
                    <button type="button" onClick={() => toast.success(`Password reset sent to ${user.email}.`)} className="text-deep-teal/60 hover:text-deep-teal">Reset PW</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editUser ? (
        <UserDetailModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={(updated) => {
            setUsers((current) => current.map((u) => (u.id === updated.id ? updated : u)));
            toast.success("User updated.");
          }}
        />
      ) : null}
    </div>
  );
}
