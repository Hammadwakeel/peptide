"use client";

import { useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { MOCK_STAFF_ROLES } from "@/lib/admin/mock-data";
import { ALL_PERMISSIONS, SETTINGS_TABS, type Permission, type SettingsTab, type StaffRole } from "@/lib/admin/types";
import { toast } from "@/lib/toast";

export function AdminPlatformSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("Commission & Fees");
  const [roles, setRoles] = useState(MOCK_STAFF_ROLES);
  const [creatingRole, setCreatingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePerms, setNewRolePerms] = useState<Permission[]>([]);

  function handleSave() {
    toast.success("Settings saved.");
  }

  function createRole() {
    if (!newRoleName.trim()) return;
    const role: StaffRole = {
      id: `role-${Date.now()}`,
      name: newRoleName.trim(),
      description: "Custom sub-role",
      permissions: newRolePerms,
      memberCount: 0,
    };
    setRoles((current) => [...current, role]);
    setCreatingRole(false);
    setNewRoleName("");
    setNewRolePerms([]);
    toast.success("Role created.");
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-light text-deep-teal">Platform Settings</h1>
        <p className="mt-1 text-sm text-deep-teal/55">Commission, payouts, shipping, email, and staff access</p>
      </div>

      <div className="rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
        <div className="flex flex-wrap gap-2 border-b border-deep-teal/10 p-4">
          {SETTINGS_TABS.map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-full px-3 py-1.5 text-xs font-medium sm:text-sm ${activeTab === tab ? "bg-deep-teal text-pure-white" : "text-deep-teal/65 hover:bg-deep-teal/5"}`}>{tab}</button>
          ))}
        </div>

        <div className="space-y-4 p-4 sm:p-6">
          {activeTab === "Commission & Fees" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={authLabelClassName}>Platform commission (%)</label><input type="number" defaultValue="10" className={authInputClassName} /></div>
              <div><label className={authLabelClassName}>Affiliate referral fee (%)</label><input type="number" defaultValue="5" className={authInputClassName} /></div>
            </div>
          ) : null}

          {activeTab === "Payout Schedule" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={authLabelClassName}>Payout frequency</label><select className={authInputClassName} defaultValue="biweekly"><option value="weekly">Weekly</option><option value="biweekly">Bi-weekly</option><option value="monthly">Monthly</option></select></div>
              <div><label className={authLabelClassName}>Minimum payout threshold ($)</label><input type="number" defaultValue="500" className={authInputClassName} /></div>
            </div>
          ) : null}

          {activeTab === "Shipping & Tax" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={authLabelClassName}>Default shipping rate ($)</label><input type="number" defaultValue="12" className={authInputClassName} /></div>
              <div><label className={authLabelClassName}>Tax calculation</label><select className={authInputClassName} defaultValue="auto"><option value="auto">Auto by state</option><option value="manual">Manual</option></select></div>
            </div>
          ) : null}

          {activeTab === "Email Templates" ? (
            <div className="space-y-4">
              {["Order confirmation", "Payout notice", "Application approved", "Password reset"].map((template) => (
                <div key={template}>
                  <label className={authLabelClassName}>{template}</label>
                  <textarea rows={3} defaultValue={`Default ${template} template body…`} className={`${authInputClassName} resize-none`} />
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === "Staff Roles & Permissions" ? (
            <div className="space-y-5">
              <div className="overflow-x-auto rounded-xl border border-deep-teal/10">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase text-deep-teal/45">
                    <tr><th className="px-4 py-3 text-left">Role</th><th className="px-4 py-3 text-left">Members</th><th className="px-4 py-3 text-left">Permissions</th></tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => (
                      <tr key={role.id} className="border-b border-deep-teal/5">
                        <td className="px-4 py-3"><p className="font-medium text-deep-teal">{role.name}</p><p className="text-xs text-deep-teal/50">{role.description}</p></td>
                        <td className="px-4 py-3 text-deep-teal">{role.memberCount}</td>
                        <td className="px-4 py-3 text-xs text-deep-teal/60">{role.permissions.length} permissions</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {creatingRole ? (
                <div className="rounded-xl border border-dashed border-deep-teal/20 p-4">
                  <label className={authLabelClassName}>New sub-role name</label>
                  <input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} className={authInputClassName} />
                  <p className={`${authLabelClassName} mt-4`}>Permissions</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {ALL_PERMISSIONS.map((perm) => (
                      <label key={perm} className="flex items-center gap-2 text-sm text-deep-teal">
                        <input type="checkbox" checked={newRolePerms.includes(perm)} onChange={(e) => setNewRolePerms((current) => e.target.checked ? [...current, perm] : current.filter((p) => p !== perm))} />
                        {perm.replace(/_/g, " ")}
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={createRole} className="rounded-full bg-deep-teal px-4 py-2 text-sm text-pure-white">Create role</button>
                    <button type="button" onClick={() => setCreatingRole(false)} className="text-sm text-deep-teal/50">Cancel</button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setCreatingRole(true)} className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm font-medium text-deep-teal">Create new sub-role</button>
              )}
            </div>
          ) : null}

          {activeTab !== "Staff Roles & Permissions" ? (
            <button type="button" onClick={handleSave} className="rounded-full bg-deep-teal px-5 py-2.5 text-sm font-medium text-pure-white">Save changes</button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
