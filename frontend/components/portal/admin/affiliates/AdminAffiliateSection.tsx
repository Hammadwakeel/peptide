"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import {
  createAffiliate,
  listAffiliates,
  updateAffiliateProfitMargin,
  updateAffiliateSubAffiliateLimit,
} from "@/lib/admin/api";
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

function EditAffiliateModal({
  affiliate,
  onClose,
  onSaved,
}: {
  affiliate: AdminAffiliate;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [profitMargin, setProfitMargin] = useState(
    String(affiliate.profit_margin_percent ?? 0),
  );
  const [subLimit, setSubLimit] = useState(
    affiliate.max_sub_affiliates === null ? "" : String(affiliate.max_sub_affiliates),
  );
  const [unlimitedSubs, setUnlimitedSubs] = useState(affiliate.max_sub_affiliates === null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    const margin = Number(profitMargin);
    if (Number.isNaN(margin) || margin < 0 || margin > 100) {
      toast.error("Profit margin must be between 0 and 100.");
      return;
    }

    let maxSubAffiliates: number | null = null;
    if (!unlimitedSubs) {
      const parsed = Number(subLimit);
      if (Number.isNaN(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
        toast.error("Sub-affiliate limit must be a whole number of 0 or greater.");
        return;
      }
      maxSubAffiliates = parsed;
    }

    setIsSaving(true);
    try {
      const marginResult = await updateAffiliateProfitMargin(affiliate.id, {
        profit_margin_percent: margin,
      });
      const limitResult = await updateAffiliateSubAffiliateLimit(affiliate.id, {
        max_sub_affiliates: maxSubAffiliates,
      });
      toast.success(`${marginResult.message} ${limitResult.message}`);
      await onSaved();
      onClose();
    } catch (error) {
      showError(error, "Unable to update affiliate settings.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-deep-teal/40 p-4 sm:items-center">
      <button type="button" aria-label="Close" className="absolute inset-0" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-2xl border border-deep-teal/10 bg-pure-white p-6 shadow-xl"
      >
        <h2 className="font-serif text-xl font-light text-deep-teal">Affiliate settings</h2>
        <p className="mt-2 text-sm text-deep-teal/60">
          {affiliate.email} · {affiliate.affiliate_code}
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="profit-margin" className={authLabelClassName}>
              Profit margin (%)
            </label>
            <input
              id="profit-margin"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={profitMargin}
              onChange={(e) => setProfitMargin(e.target.value)}
              className={authInputClassName}
            />
            <p className="mt-1 text-xs text-deep-teal/50">
              Applies to this main affiliate and all of its sub-affiliates.
            </p>
          </div>

          <div>
            <label htmlFor="sub-limit" className={authLabelClassName}>
              Sub-affiliate invite limit
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm text-deep-teal/75">
              <input
                type="checkbox"
                checked={unlimitedSubs}
                onChange={(e) => setUnlimitedSubs(e.target.checked)}
                className="size-4 rounded"
              />
              Unlimited sub-affiliates
            </label>
            {!unlimitedSubs ? (
              <input
                id="sub-limit"
                type="number"
                min={0}
                step={1}
                value={subLimit}
                onChange={(e) => setSubLimit(e.target.value)}
                className={`${authInputClassName} mt-2`}
              />
            ) : null}
            <p className="mt-1 text-xs text-deep-teal/50">
              {affiliate.sub_affiliate_count} sub-affiliate
              {affiliate.sub_affiliate_count === 1 ? "" : "s"} currently invited.
            </p>
          </div>
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
            disabled={isSaving}
            onClick={() => void handleSave()}
            className="rounded-full bg-deep-teal px-4 py-2 text-sm text-pure-white disabled:opacity-60"
          >
            {isSaving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminAffiliateSection() {
  const [affiliates, setAffiliates] = useState<AdminAffiliate[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [email, setEmail] = useState("");
  const [editingAffiliate, setEditingAffiliate] = useState<AdminAffiliate | null>(null);

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

    setIsCreating(true);
    const toastId = toast.loading("Creating affiliate…");

    try {
      const result = await createAffiliate({ email: email.trim() });
      toast.dismiss(toastId);
      toast.success(result.message);
      setEmail("");
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
            Create affiliate accounts, set profit margins, and manage sub-affiliate limits
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
          <p className="mt-1 text-sm text-deep-teal/55">
            A set-password email will be sent to the affiliate after creation.
          </p>
          <div className="mt-4">
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
              <th className="px-4 py-3">Margin %</th>
              <th className="px-4 py-3">Sub limit</th>
              <th className="px-4 py-3">Clinics referred</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-deep-teal/50">
                  Loading affiliates…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-deep-teal/50">
                  No affiliates found.
                </td>
              </tr>
            ) : (
              filtered.map((affiliate) => (
                <tr key={affiliate.id} className="border-b border-deep-teal/5">
                  <td className="px-4 py-3 font-medium text-deep-teal">{affiliate.email}</td>
                  <td className="px-4 py-3 font-mono text-deep-teal/70">{affiliate.affiliate_code}</td>
                  <td className="px-4 py-3 capitalize text-deep-teal/70">{affiliate.affiliate_type}</td>
                  <td className="px-4 py-3 text-deep-teal/70">
                    {affiliate.profit_margin_percent}%
                  </td>
                  <td className="px-4 py-3 text-deep-teal/70">
                    {affiliate.affiliate_type === "main"
                      ? affiliate.max_sub_affiliates === null
                        ? "Unlimited"
                        : `${affiliate.sub_affiliate_count}/${affiliate.max_sub_affiliates}`
                      : affiliate.parent_affiliate_code ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-deep-teal/70">{affiliate.clinic_referral_count}</td>
                  <td className="px-4 py-3 text-deep-teal/70">
                    {new Date(affiliate.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={affiliate.status} />
                  </td>
                  <td className="px-4 py-3">
                    {affiliate.affiliate_type === "main" ? (
                      <button
                        type="button"
                        onClick={() => setEditingAffiliate(affiliate)}
                        className="text-xs text-pacific-teal hover:underline"
                      >
                        Edit settings
                      </button>
                    ) : (
                      <span className="text-xs text-deep-teal/40">Inherited</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingAffiliate ? (
        <EditAffiliateModal
          affiliate={editingAffiliate}
          onClose={() => setEditingAffiliate(null)}
          onSaved={loadAffiliates}
        />
      ) : null}
    </div>
  );
}
