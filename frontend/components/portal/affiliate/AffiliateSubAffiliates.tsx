"use client";

import { useCallback, useEffect, useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { MainAffiliateOnly } from "@/components/portal/affiliate/AffiliatePortalLayout";
import { inviteSubAffiliate, listSubAffiliates } from "@/lib/affiliate/api";
import type { SubAffiliate } from "@/lib/affiliate/types";
import { useAffiliatePortal } from "@/context/AffiliatePortalProvider";
import { showError, toast } from "@/lib/toast";

function SubAffiliateContent() {
  const { refreshProfile } = useAffiliatePortal();
  const [subAffiliates, setSubAffiliates] = useState<SubAffiliate[]>([]);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);

  const loadSubAffiliates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await listSubAffiliates({ page: 1, limit: 100 });
      setSubAffiliates(response.sub_affiliates);
    } catch (error) {
      showError(error, "Unable to load sub-affiliates.");
      setSubAffiliates([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSubAffiliates();
  }, [loadSubAffiliates]);

  async function handleInvite(event: React.FormEvent) {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }

    setIsInviting(true);
    try {
      const result = await inviteSubAffiliate({ email: email.trim() });
      toast.success(result.message);
      setEmail("");
      await Promise.all([loadSubAffiliates(), refreshProfile()]);
    } catch (error) {
      showError(error, "Unable to invite sub-affiliate.");
    } finally {
      setIsInviting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-light text-deep-teal">Sub-Affiliates</h1>
        <p className="mt-1 text-sm text-deep-teal/55">
          Invite and manage sub-affiliates in your network.
        </p>
      </div>

      <form
        onSubmit={(event) => void handleInvite(event)}
        className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm"
      >
        <h2 className="text-sm font-medium text-deep-teal">Invite sub-affiliate</h2>
        <p className="mt-1 text-sm text-deep-teal/55">
          A set-password email will be sent to the new sub-affiliate.
        </p>
        <div className="mt-4 max-w-md">
          <label htmlFor="sub-email" className={authLabelClassName}>Email</label>
          <input
            id="sub-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClassName}
          />
        </div>
        <button
          type="submit"
          disabled={isInviting}
          className="mt-4 rounded-full bg-deep-teal px-5 py-2.5 text-sm font-medium text-pure-white hover:bg-pacific-teal disabled:opacity-60"
        >
          {isInviting ? "Inviting…" : "Send invite"}
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-deep-teal/10 bg-pure-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-deep-teal/10 bg-deep-teal/[0.02] text-xs uppercase tracking-wide text-deep-teal/45">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Clinics referred</th>
              <th className="px-4 py-3">Margin %</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-deep-teal/50">
                  Loading sub-affiliates…
                </td>
              </tr>
            ) : subAffiliates.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-deep-teal/50">
                  No sub-affiliates yet.
                </td>
              </tr>
            ) : (
              subAffiliates.map((sub) => (
                <tr key={sub.id} className="border-b border-deep-teal/5">
                  <td className="px-4 py-3 font-medium text-deep-teal">{sub.email}</td>
                  <td className="px-4 py-3 font-mono text-xs text-deep-teal/70">{sub.affiliate_code}</td>
                  <td className="px-4 py-3 text-deep-teal/70">{sub.clinic_referral_count}</td>
                  <td className="px-4 py-3 text-deep-teal/70">{sub.profit_margin_percent}%</td>
                  <td className="px-4 py-3 capitalize text-deep-teal/70">{sub.status}</td>
                  <td className="px-4 py-3 text-deep-teal/70">
                    {new Date(sub.created_at).toLocaleDateString()}
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

export function AffiliateSubAffiliates() {
  return (
    <MainAffiliateOnly>
      <SubAffiliateContent />
    </MainAffiliateOnly>
  );
}
