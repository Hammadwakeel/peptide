"use client";

import { useCallback, useEffect, useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import {
  cancelClinicInvitation,
  inviteClinicMember,
  listClinicMembers,
  removeClinicMember,
  updateClinicMember,
} from "@/lib/doctor/api";
import {
  ACCESS_LEVEL_LABELS,
  type ClinicMember,
  type InvitableAccessLevel,
} from "@/lib/doctor/clinic-types";
import { showError, toast } from "@/lib/toast";

type InviteUserModalProps = {
  open: boolean;
  onClose: () => void;
  onInvite: (email: string, accessLevel: InvitableAccessLevel) => void;
};

function InviteUserModal({ open, onClose, onInvite }: InviteUserModalProps) {
  const [email, setEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState<InvitableAccessLevel>("staff");

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Enter a valid email address.");
      return;
    }
    onInvite(email, accessLevel);
    setEmail("");
    setAccessLevel("staff");
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
          Invite organization member
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
            <label htmlFor="invite-role" className={authLabelClassName}>Role & permissions</label>
            <select
              id="invite-role"
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value as InvitableAccessLevel)}
              className={authInputClassName}
            >
              <option value="admin">Admin — full clinic management</option>
              <option value="staff">Staff — view patients & clinic</option>
              <option value="associate_provider">Associate Provider — view & invite patients</option>
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

function StatusPill({ status }: { status: ClinicMember["status"] }) {
  const styles =
    status === "active"
      ? "bg-pacific-teal/10 text-pacific-teal"
      : status === "pending"
        ? "bg-coral-blush text-deep-teal/70"
        : "bg-deep-teal/5 text-deep-teal/60";
  const label = status === "active" ? "Active" : status === "pending" ? "Pending" : "Inactive";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${styles}`}>
      {label}
    </span>
  );
}

export function OrganizationUsers() {
  const [tab, setTab] = useState<"all" | "pending">("all");
  const [members, setMembers] = useState<ClinicMember[]>([]);
  const [pending, setPending] = useState<ClinicMember[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await listClinicMembers();
      setMembers(response.members);
      setPending(response.pending_invitations);
      setCanManage(response.membership.permissions.includes("manage_members"));
    } catch (error) {
      showError(error, "Unable to load organization members.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const allRows = [...members, ...pending];
  const filtered = allRows.filter((user) =>
    tab === "pending" ? user.status === "pending" : true,
  );

  async function handleInvite(email: string, accessLevel: InvitableAccessLevel) {
    try {
      const result = await inviteClinicMember({ email, access_level: accessLevel });
      toast.success(result.message);
      await loadMembers();
    } catch (error) {
      showError(error, "Unable to send invitation.");
    }
  }

  async function handleToggleAccess(user: ClinicMember) {
    if (user.status === "pending" || !canManage) return;
    try {
      await updateClinicMember(user.id, { is_active: !user.is_active });
      await loadMembers();
      toast.success("Member access updated.");
    } catch (error) {
      showError(error, "Unable to update member.");
    }
  }

  async function handleRemove(user: ClinicMember) {
    if (!canManage) return;
    try {
      if (user.status === "pending") {
        await cancelClinicInvitation(user.id);
      } else {
        await removeClinicMember(user.id);
      }
      await loadMembers();
      toast.success(user.status === "pending" ? "Invitation cancelled." : "Member removed.");
    } catch (error) {
      showError(error, "Unable to remove member.");
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-[2rem] border border-deep-teal/10 bg-pure-white p-8 text-sm text-deep-teal/55 shadow-sm">
        Loading organization members…
      </div>
    );
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
              All members
            </button>
            <button
              type="button"
              onClick={() => setTab("pending")}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                tab === "pending" ? "bg-deep-teal text-pure-white" : "text-deep-teal/65 hover:bg-deep-teal/5"
              }`}
            >
              Pending invites ({pending.length})
            </button>
          </div>
          {canManage ? (
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white hover:bg-pacific-teal"
            >
              Invite member
            </button>
          ) : null}
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
                {canManage ? <th className="px-4 py-3 font-medium sm:px-6">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 6 : 5} className="px-6 py-8 text-center text-deep-teal/50">
                    No members found.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="border-b border-deep-teal/5 last:border-0">
                    <td className="px-4 py-3 font-medium sm:px-6">{user.name}</td>
                    <td className="px-4 py-3 text-deep-teal/70 sm:px-6">{user.email}</td>
                    <td className="px-4 py-3 sm:px-6">
                      {ACCESS_LEVEL_LABELS[user.access_level]}
                    </td>
                    <td className="px-4 py-3 sm:px-6"><StatusPill status={user.status} /></td>
                    <td className="px-4 py-3 sm:px-6">
                      {user.status === "pending" ? (
                        <span className="text-xs text-deep-teal/45">Awaiting accept</span>
                      ) : (
                        <label className="inline-flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={user.is_active}
                            disabled={!canManage || user.access_level === "owner"}
                            onChange={() => void handleToggleAccess(user)}
                            className="size-4 rounded border-deep-teal/20 text-pacific-teal"
                          />
                          <span className="text-xs text-deep-teal/55">
                            {user.is_active ? "On" : "Off"}
                          </span>
                        </label>
                      )}
                    </td>
                    {canManage ? (
                      <td className="px-4 py-3 sm:px-6">
                        {user.access_level !== "owner" ? (
                          <button
                            type="button"
                            onClick={() => void handleRemove(user)}
                            className="text-xs font-medium text-deep-teal/45 hover:text-deep-teal"
                          >
                            {user.status === "pending" ? "Cancel" : "Remove"}
                          </button>
                        ) : (
                          <span className="text-xs text-deep-teal/35">—</span>
                        )}
                      </td>
                    ) : null}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={(email, accessLevel) => void handleInvite(email, accessLevel)}
      />
    </>
  );
}
