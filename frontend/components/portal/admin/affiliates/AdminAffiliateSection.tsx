"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { createAffiliate, listAffiliates } from "@/lib/admin/api";
import type { AdminAffiliate } from "@/lib/admin/types";
import { showError, toast } from "@/lib/toast";

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const styles =
    normalized === "active"
      ? "bg-pacific-teal/10 text-pacific-teal"
      : normalized === "pending"
        ? "bg-coral-blush text-deep-teal/70"
        : "bg-deep-teal/5 text-deep-teal/60";

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles}`}>
      {status}
    </span>
  );
}

export function AdminAffiliateSection() {
  const [affiliates, setAffiliates] = useState<AdminAffiliate[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);

  const loadAffiliates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await listAffiliates({ page: 1, limit: 100 });
      setAffiliates(response.affiliates);
    } catch (error) {
      showError(error, "Unable to load affiliates.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAffiliates();
  }, [loadAffiliates]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return affiliates;
    return affiliates.filter(
      (affiliate) =>
        affiliate.email.toLowerCase().includes(query) ||
        affiliate.affiliate_code.toLowerCase().includes(query),
    );
  }, [affiliates, search]);

  const activeCount = affiliates.filter((a) => a.status === "active").length;
  const totalReferrals = affiliates.reduce((sum, a) => sum + a.clinic_referral_count, 0);

  async function handleCreateAffiliate(event: React.FormEvent) {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }

    if (!autoGeneratePassword && password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setIsCreating(true);
    const toastId = toast.loading("Creating affiliate…");

    try {
      const result = await createAffiliate({
        email: email.trim(),
        auto_generate_password: autoGeneratePassword,
        ...(autoGeneratePassword ? {} : { password }),
      });
      toast.dismiss(toastId);
      toast.success(result.message);
      setEmail("");
      setPassword("");
      setAutoGeneratePassword(true);
      setShowCreateForm(false);
      await loadAffiliates();
    } catch (error) {
      toast.dismiss(toastId);
      showError(error, "Unable to create affiliate.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-light text-deep-teal">Affiliates</h1>
          <p className="mt-1 text-sm text-deep-teal/55">
            Create affiliate accounts and track clinic referrals
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateForm((value) => !value)}
          className="rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white hover:bg-pacific-teal"
        >
          {showCreateForm ? "Cancel" : "Create affiliate"}
        </button>
      </div>

      {showCreateForm ? (
        <form
          onSubmit={(event) => void handleCreateAffiliate(event)}
          className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm"
        >
          <h2 className="font-serif text-lg font-light text-deep-teal">New affiliate</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="affiliate-email" className={authLabelClassName}>Email</label>
              <input
                id="affiliate-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={authInputClassName}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-deep-teal/75 sm:col-span-2">
              <input
                type="checkbox"
                checked={autoGeneratePassword}
                onChange={(e) => setAutoGeneratePassword(e.target.checked)}
                className="size-4 rounded"
              />
              Auto-generate password and email credentials
            </label>
            {!autoGeneratePassword ? (
              <div className="sm:col-span-2">
                <label htmlFor="affiliate-password" className={authLabelClassName}>Password</label>
                <input
                  id="affiliate-password"
                  type="password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={authInputClassName}
                />
              </div>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="mt-4 rounded-full bg-pacific-teal px-5 py-2.5 text-sm font-medium text-pure-white hover:bg-deep-teal disabled:opacity-60"
          >
            {isCreating ? "Creating…" : "Create affiliate"}
          </button>
        </form>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Active affiliates", value: activeCount.toString() },
          { label: "Total affiliates", value: affiliates.length.toString() },
          { label: "Clinic referrals", value: totalReferrals.toString() },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-deep-teal/10 bg-pure-white px-4 py-5 shadow-sm"
          >
            <p className="text-xs uppercase tracking-wide text-deep-teal/45">{kpi.label}</p>
            <p className="mt-2 font-serif text-3xl font-light text-deep-teal">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-medium text-deep-teal">Affiliate accounts</h2>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or code…"
          className="w-full rounded-xl border border-deep-teal/15 px-3 py-2 text-sm sm:max-w-xs"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase tracking-wide text-deep-teal/45">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Clinics referred</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-deep-teal/50">
                  Loading affiliates…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-deep-teal/50">
                  No affiliates found.
                </td>
              </tr>
            ) : (
              filtered.map((affiliate) => (
                <tr key={affiliate.id} className="border-b border-deep-teal/5">
                  <td className="px-4 py-3 font-medium text-deep-teal">{affiliate.email}</td>
                  <td className="px-4 py-3 font-mono text-deep-teal/70">{affiliate.affiliate_code}</td>
                  <td className="px-4 py-3 capitalize text-deep-teal/70">{affiliate.affiliate_type}</td>
                  <td className="px-4 py-3 text-deep-teal/70">{affiliate.clinic_referral_count}</td>
                  <td className="px-4 py-3 text-deep-teal/70">
                    {new Date(affiliate.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={affiliate.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
