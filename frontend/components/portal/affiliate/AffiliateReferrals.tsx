"use client";

import { useCallback, useEffect, useState } from "react";
import { listClinicReferrals } from "@/lib/affiliate/api";
import type { ClinicReferral, ReferralScope } from "@/lib/affiliate/types";
import { useAffiliatePortal } from "@/context/AffiliatePortalProvider";
import { showError } from "@/lib/toast";

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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-light text-deep-teal">Clinic Referrals</h1>
          <p className="mt-1 text-sm text-deep-teal/55">
            {isMain
              ? "View your own referrals or the full network."
              : "Clinics you have referred to Frontier Biomed."}
          </p>
        </div>
        {isMain ? (
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as ReferralScope)}
            className="rounded-xl border border-deep-teal/15 px-3 py-2 text-sm"
          >
            <option value="own">My referrals</option>
            <option value="all">All network referrals</option>
          </select>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase tracking-wide text-deep-teal/45">
            <tr>
              <th className="px-4 py-3">Clinic</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Clinic status</th>
              <th className="px-4 py-3">Referral status</th>
              {isMain && scope === "all" ? (
                <th className="px-4 py-3">Referred by</th>
              ) : null}
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={isMain && scope === "all" ? 6 : 5} className="px-4 py-8 text-center text-deep-teal/50">
                  Loading referrals…
                </td>
              </tr>
            ) : referrals.length === 0 ? (
              <tr>
                <td colSpan={isMain && scope === "all" ? 6 : 5} className="px-4 py-8 text-center text-deep-teal/50">
                  No clinic referrals found.
                </td>
              </tr>
            ) : (
              referrals.map((referral) => (
                <tr key={referral.id} className="border-b border-deep-teal/5">
                  <td className="px-4 py-3 font-medium text-deep-teal">
                    {referral.clinic.clinic_name}
                  </td>
                  <td className="px-4 py-3 text-deep-teal/70">{referral.clinic.email}</td>
                  <td className="px-4 py-3 capitalize text-deep-teal/70">
                    {referral.clinic.status}
                  </td>
                  <td className="px-4 py-3 capitalize text-deep-teal/70">{referral.status}</td>
                  {isMain && scope === "all" ? (
                    <td className="px-4 py-3 text-deep-teal/70">
                      {referral.referred_by.affiliate_code}
                    </td>
                  ) : null}
                  <td className="px-4 py-3 text-deep-teal/70">
                    {new Date(referral.created_at).toLocaleDateString()}
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
