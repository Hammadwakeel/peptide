"use client";

import { useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import type { OrgUser, OrgUserRole } from "@/lib/apply/types";
import { ORG_ROLE_LABELS } from "@/lib/apply/types";
import { toast } from "@/lib/toast";

type InviteUserModalProps = {
  open: boolean;
  onClose: () => void;
  onInvite: (email: string, role: OrgUserRole) => void;
};

export function InviteUserModal({ open, onClose, onInvite }: InviteUserModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrgUserRole>("staff");

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Enter a valid email address.");
      return;
    }
    onInvite(email, role);
    setEmail("");
    setRole("staff");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-teal/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-user-title"
        className="w-full max-w-md rounded-2xl border border-deep-teal/10 bg-pure-white p-6 shadow-xl"
      >
        <h2 id="invite-user-title" className="font-serif text-xl font-light text-deep-teal">
          Invite organization user
        </h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="invite-email" className={authLabelClassName}>Email</label>
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputClassName}
            />
          </div>
          <div>
            <label htmlFor="invite-role" className={authLabelClassName}>Role</label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as OrgUserRole)}
              className={authInputClassName}
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="associate_provider">Associate Provider</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm text-deep-teal">
              Cancel
            </button>
            <button type="submit" className="rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white hover:bg-pacific-teal">
              Send invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const INITIAL_USERS: OrgUser[] = [
  { id: "1", name: "Dr. Sarah Chen", email: "sarah@frontierclinic.com", role: "admin", status: "active", accessEnabled: true },
  { id: "2", name: "Marcus Lee", email: "marcus@frontierclinic.com", role: "staff", status: "active", accessEnabled: true },
  { id: "3", name: "Dr. Amira Patel", email: "amira@frontierclinic.com", role: "associate_provider", status: "pending", accessEnabled: false },
];

function StatusPill({ status }: { status: OrgUser["status"] }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
        status === "active"
          ? "bg-pacific-teal/10 text-pacific-teal"
          : "bg-coral-blush text-deep-teal/70"
      }`}
    >
      {status === "active" ? "Active" : "Pending"}
    </span>
  );
}

export function OrganizationUsers() {
  const [tab, setTab] = useState<"all" | "pending">("all");
  const [users, setUsers] = useState(INITIAL_USERS);
  const [inviteOpen, setInviteOpen] = useState(false);

  const filtered = users.filter((user) =>
    tab === "pending" ? user.status === "pending" : true,
  );

  function handleInvite(email: string, role: OrgUserRole) {
    setUsers((current) => [
      ...current,
      {
        id: String(Date.now()),
        name: email.split("@")[0],
        email,
        role,
        status: "pending",
        accessEnabled: false,
      },
    ]);
    toast.success(`Invite sent to ${email}.`);
  }

  return (
    <>
      <div className="rounded-[2rem] border border-deep-teal/10 bg-pure-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-deep-teal/10 p-4 sm:p-6">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab("all")}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                tab === "all" ? "bg-deep-teal text-pure-white" : "text-deep-teal/65 hover:bg-deep-teal/5"
              }`}
            >
              All Organization Users
            </button>
            <button
              type="button"
              onClick={() => setTab("pending")}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                tab === "pending" ? "bg-deep-teal text-pure-white" : "text-deep-teal/65 hover:bg-deep-teal/5"
              }`}
            >
              Pending Invites
            </button>
          </div>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white hover:bg-pacific-teal"
          >
            Invite user
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-deep-teal/10 text-xs uppercase tracking-wide text-deep-teal/45">
              <tr>
                <th className="px-4 py-3 font-medium sm:px-6">Name</th>
                <th className="px-4 py-3 font-medium sm:px-6">Email</th>
                <th className="px-4 py-3 font-medium sm:px-6">Role</th>
                <th className="px-4 py-3 font-medium sm:px-6">Status</th>
                <th className="px-4 py-3 font-medium sm:px-6">Access</th>
                <th className="px-4 py-3 font-medium sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-deep-teal/5 last:border-0">
                  <td className="px-4 py-3 font-medium sm:px-6">{user.name}</td>
                  <td className="px-4 py-3 text-deep-teal/70 sm:px-6">{user.email}</td>
                  <td className="px-4 py-3 sm:px-6">{ORG_ROLE_LABELS[user.role]}</td>
                  <td className="px-4 py-3 sm:px-6"><StatusPill status={user.status} /></td>
                  <td className="px-4 py-3 sm:px-6">
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={user.accessEnabled}
                        onChange={() =>
                          setUsers((current) =>
                            current.map((item) =>
                              item.id === user.id
                                ? { ...item, accessEnabled: !item.accessEnabled }
                                : item,
                            ),
                          )
                        }
                        className="size-4 rounded border-deep-teal/20 text-pacific-teal"
                      />
                      <span className="text-xs text-deep-teal/55">
                        {user.accessEnabled ? "On" : "Off"}
                      </span>
                    </label>
                  </td>
                  <td className="px-4 py-3 sm:px-6">
                    <div className="flex gap-2">
                      <button type="button" className="text-xs font-medium text-pacific-teal hover:underline">
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setUsers((current) => current.filter((item) => item.id !== user.id))
                        }
                        className="text-xs font-medium text-deep-teal/45 hover:text-deep-teal"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInvite}
      />
    </>
  );
}
