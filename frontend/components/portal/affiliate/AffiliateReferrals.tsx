"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, RefreshCw } from "lucide-react";
import { listClinicReferrals } from "@/lib/affiliate/api";
import type { ClinicReferral, ReferralScope } from "@/lib/affiliate/types";
import { useAffiliatePortal } from "@/context/AffiliatePortalProvider";
import { showError } from "@/lib/toast";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AffiliateReferrals() {
  const { isMain } = useAffiliatePortal();
  const [referrals, setReferrals] = useState<ClinicReferral[]>([]);
  const [scope, setScope] = useState<ReferralScope>("own");
  const [isLoading, setIsLoading] = useState(true);

  const loadReferrals = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await listClinicReferrals({
        page: 1,
        limit: 100,
        scope: isMain ? scope : "own",
      });
      setReferrals(response.referrals);
    } catch (error) {
      showError(error, "Unable to load clinic referrals.");
      setReferrals([]);
    } finally {
      setIsLoading(false);
    }
  }, [isMain, scope]);

  useEffect(() => {
    void loadReferrals();
  }, [loadReferrals]);

  const colSpan = isMain && scope === "all" ? 6 : 5;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-2xl border border-deep-teal/20 bg-pure-white px-4 py-2.5 shadow-[0_2px_12px_rgba(1,26,36,0.08)] sm:px-5">
        <h1 className="shrink-0 font-sans text-xl font-semibold text-deep-teal sm:text-2xl">Clinic Referrals</h1>
        <div className="min-w-4 flex-1" aria-hidden="true" />
        <div className="flex flex-wrap items-center justify-end gap-2">
          {isMain ? (
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as ReferralScope)}
              className="rounded-full border border-deep-teal/25 bg-pure-white px-4 py-2 text-sm text-deep-teal outline-none focus:border-deep-teal"
            >
              <option value="own">My referrals</option>
              <option value="all">All network</option>
            </select>
          ) : null}
          <button
            type="button"
            onClick={() => void loadReferrals()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-full bg-deep-teal px-4 py-2 text-sm font-medium text-pure-white transition-opacity hover:opacity-90 disabled:opacity-50"
            aria-label="Refresh referrals"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-deep-teal/25 bg-pure-white shadow-[0_4px_24px_rgba(1,26,36,0.12)]">
        <div className="bg-deep-teal px-5 py-4 text-pure-white">
          <div className="flex items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-pure-white/15"
              aria-hidden="true"
            >
              <Building2 className="size-4" />
            </div>
            <div>
              <h2 className="font-sans text-lg font-semibold">Referred clinics</h2>
              <p className="text-xs text-pure-white/75">
                {isLoading ? "Loading…" : `${referrals.length} referral${referrals.length === 1 ? "" : "s"}`}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-deep-teal/10 bg-surface-muted/50 text-xs uppercase tracking-wide text-deep-teal/45">
              <tr>
                <th className="px-4 py-3 font-medium">Clinic</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Clinic status</th>
                <th className="px-4 py-3 font-medium">Referral status</th>
                {isMain && scope === "all" ? (
                  <th className="px-4 py-3 font-medium">Referred by</th>
                ) : null}
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-10 text-center text-deep-teal/50">
                    Loading referrals…
                  </td>
                </tr>
              ) : referrals.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-10 text-center text-deep-teal/50">
                    No clinic referrals found.
                  </td>
                </tr>
              ) : (
                referrals.map((referral) => (
                  <tr key={referral.id} className="border-b border-deep-teal/5">
                    <td className="px-4 py-3 font-medium text-deep-teal">{referral.clinic.clinic_name}</td>
                    <td className="px-4 py-3 text-deep-teal/70">{referral.clinic.email}</td>
                    <td className="px-4 py-3 capitalize text-deep-teal/70">{referral.clinic.status}</td>
                    <td className="px-4 py-3 capitalize text-deep-teal/70">{referral.status}</td>
                    {isMain && scope === "all" ? (
                      <td className="px-4 py-3 font-mono text-xs text-deep-teal/70">
                        {referral.referred_by.affiliate_code}
                      </td>
                    ) : null}
                    <td className="px-4 py-3 text-deep-teal/70">{formatDate(referral.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
