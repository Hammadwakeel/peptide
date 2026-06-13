"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Send, UserPlus, UsersRound } from "lucide-react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { MainAffiliateOnly } from "@/components/portal/affiliate/AffiliatePortalLayout";
import { inviteSubAffiliate, listSubAffiliates } from "@/lib/affiliate/api";
import type { SubAffiliate } from "@/lib/affiliate/types";
import { useAffiliatePortal } from "@/context/AffiliatePortalProvider";
import { showError, toast } from "@/lib/toast";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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
      await Promise.all([loadSubAffiliates(), refreshProfile({ force: true })]);
    } catch (error) {
      showError(error, "Unable to invite sub-affiliate.");
    } finally {
      setIsInviting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-2xl border border-deep-teal/20 bg-pure-white px-4 py-2.5 shadow-[0_2px_12px_rgba(1,26,36,0.08)] sm:px-5">
        <h1 className="shrink-0 font-sans text-xl font-light text-deep-teal sm:text-2xl">Sub-Affiliates</h1>
        <div className="min-w-4 flex-1" aria-hidden="true" />
        <button
          type="button"
          onClick={() => void loadSubAffiliates()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-full bg-deep-teal px-4 py-2 text-sm font-light text-pure-white transition-opacity hover:opacity-90 disabled:opacity-50"
          aria-label="Refresh sub-affiliates"
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
        </button>
      </div>

      <section className="overflow-hidden rounded-2xl border border-deep-teal/25 bg-pure-white shadow-[0_4px_24px_rgba(1,26,36,0.12)]">
        <div className="bg-deep-teal px-5 py-4 text-pure-white">
          <div className="flex items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-pure-white/15"
              aria-hidden="true"
            >
              <UserPlus className="size-4" />
            </div>
            <div>
              <h2 className="font-sans text-lg font-light">Invite sub-affiliate</h2>
              <p className="text-xs text-pure-white/75">A set-password email will be sent to the invitee</p>
            </div>
          </div>
        </div>

        <form onSubmit={(event) => void handleInvite(event)} className="space-y-4 p-5">
          <div className="max-w-md">
            <label htmlFor="sub-email" className={authLabelClassName}>Email</label>
            <input
              id="sub-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="affiliate@example.com"
              className={authInputClassName}
            />
          </div>
          <button
            type="submit"
            disabled={isInviting}
            className="inline-flex items-center gap-2 rounded-full bg-deep-teal px-5 py-2.5 text-sm font-light text-pure-white hover:opacity-90 disabled:opacity-60"
          >
            <Send className="size-4" aria-hidden="true" />
            {isInviting ? "Inviting…" : "Send invite"}
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-deep-teal/25 bg-pure-white shadow-[0_4px_24px_rgba(1,26,36,0.12)]">
        <div className="bg-deep-teal px-5 py-4 text-pure-white">
          <div className="flex items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-pure-white/15"
              aria-hidden="true"
            >
              <UsersRound className="size-4" />
            </div>
            <div>
              <h2 className="font-sans text-lg font-light">Network members</h2>
              <p className="text-xs text-pure-white/75">
                {isLoading ? "Loading…" : `${subAffiliates.length} sub-affiliate${subAffiliates.length === 1 ? "" : "s"}`}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-deep-teal/10 bg-surface-muted/50 text-xs uppercase tracking-wide text-deep-teal/45">
              <tr>
                <th className="px-4 py-3 font-light">Email</th>
                <th className="px-4 py-3 font-light">Code</th>
                <th className="px-4 py-3 font-light">Clinics referred</th>
                <th className="px-4 py-3 font-light">Margin %</th>
                <th className="px-4 py-3 font-light">Status</th>
                <th className="px-4 py-3 font-light">Joined</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-deep-teal/50">
                    Loading sub-affiliates…
                  </td>
                </tr>
              ) : subAffiliates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-deep-teal/50">
                    No sub-affiliates yet.
                  </td>
                </tr>
              ) : (
                subAffiliates.map((sub) => (
                  <tr key={sub.id} className="border-b border-deep-teal/5">
                    <td className="px-4 py-3 font-light text-deep-teal">{sub.email}</td>
                    <td className="px-4 py-3 font-mono text-xs text-deep-teal/70">{sub.affiliate_code}</td>
                    <td className="px-4 py-3 text-deep-teal/70">{sub.clinic_referral_count}</td>
                    <td className="px-4 py-3 text-deep-teal/70">{sub.profit_margin_percent}%</td>
                    <td className="px-4 py-3 capitalize text-deep-teal/70">{sub.status}</td>
                    <td className="px-4 py-3 text-deep-teal/70">{formatDate(sub.created_at)}</td>
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

export function AffiliateSubAffiliates() {
  return (
    <MainAffiliateOnly>
      <SubAffiliateContent />
    </MainAffiliateOnly>
  );
}
