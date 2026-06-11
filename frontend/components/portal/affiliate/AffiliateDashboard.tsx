"use client";

import Link from "next/link";
import { useCallback } from "react";
import {
  Copy,
  LayoutGrid,
  RefreshCw,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react";
import { RoleOnboardingChecklist } from "@/components/onboarding/RoleOnboardingChecklist";
import { useAffiliatePortal } from "@/context/AffiliatePortalProvider";
import { toast } from "@/lib/toast";

function DetailCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border border-deep-teal/10 bg-surface-muted/40 px-3 py-2.5">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-deep-teal/45">{label}</dt>
      <dd className="mt-1 truncate text-sm font-medium text-deep-teal">{value}</dd>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-deep-teal/10 bg-pure-white px-4 py-3 text-center shadow-sm">
      <p className="text-[10px] font-medium uppercase tracking-wide text-deep-teal/45">{label}</p>
      <p className="mt-1 font-serif text-2xl font-light text-deep-teal">{value}</p>
    </div>
  );
}

export function AffiliateDashboard() {
  const { profile, isMain, isLoading, refreshProfile } = useAffiliatePortal();

  const copyReferralLink = useCallback(async () => {
    if (!profile?.referral_link) return;
    try {
      await navigator.clipboard.writeText(profile.referral_link);
      toast.success("Referral link copied.");
    } catch {
      toast.error("Unable to copy link.");
    }
  }, [profile?.referral_link]);

  if (isLoading) {
    return <p className="py-12 text-center text-sm text-deep-teal/50">Loading your affiliate account…</p>;
  }

  if (!profile) {
    return <p className="py-12 text-center text-sm text-deep-teal/50">Unable to load affiliate profile.</p>;
  }

  const toolbarActions = [
    {
      href: "/portal/affiliate/clinics/invite",
      label: "Invite clinic",
      icon: UserPlus,
      primary: true,
    },
    {
      href: "/portal/affiliate/referrals",
      label: "Referrals",
      icon: Users,
      primary: false,
    },
    ...(isMain
      ? [
          {
            href: "/portal/affiliate/sub-affiliates",
            label: "Sub-affiliates",
            icon: UsersRound,
            primary: false,
          },
        ]
      : []),
  ] as const;

  return (
    <div className="space-y-5">
      <RoleOnboardingChecklist
        role="affiliate"
        filterStepIds={isMain ? undefined : ["sub-affiliates"]}
      />

      <div className="flex items-center gap-4 rounded-2xl border border-deep-teal/20 bg-pure-white px-4 py-3 shadow-[0_2px_12px_rgba(1,26,36,0.08)] sm:px-5">
        <h1 className="shrink-0 font-serif text-xl font-light text-deep-teal sm:text-2xl">Dashboard</h1>
        <div className="min-w-4 flex-1" aria-hidden="true" />
        <div className="flex flex-wrap items-center justify-end gap-2">
          {toolbarActions.map(({ href, label, icon: Icon, primary }) => (
            <Link
              key={href}
              href={href}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                primary
                  ? "bg-deep-teal text-pure-white hover:opacity-90"
                  : "border border-deep-teal/25 text-deep-teal hover:bg-deep-teal/5"
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
          <button
            type="button"
            onClick={() => void copyReferralLink()}
            className="inline-flex items-center gap-2 rounded-full border border-deep-teal/25 px-4 py-2 text-sm font-medium text-deep-teal transition-colors hover:bg-deep-teal/5"
          >
            <Copy className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Copy link</span>
          </button>
          <button
            type="button"
            onClick={() => void refreshProfile({ force: true })}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-full border border-deep-teal/25 px-4 py-2 text-sm font-medium text-deep-teal transition-colors hover:bg-deep-teal/5 disabled:opacity-50"
            aria-label="Refresh dashboard"
          >
            <RefreshCw className="size-4" aria-hidden="true" />
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
              <LayoutGrid className="size-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-light">Account</h2>
              <p className="text-xs text-pure-white/75">{profile.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailCell label="Email" value={profile.email} />
            <DetailCell label="Type" value={<span className="capitalize">{profile.affiliate_type}</span>} />
            <DetailCell label="Status" value={<span className="capitalize">{profile.status}</span>} />
            <DetailCell label="Affiliate code" value={<span className="font-mono">{profile.affiliate_code}</span>} />
            <DetailCell label="Profit margin" value={`${profile.profit_margin_percent}%`} />
            {isMain ? (
              <DetailCell
                label="Sub-affiliate limit"
                value={
                  profile.max_sub_affiliates === null
                    ? "Unlimited"
                    : `${profile.stats.sub_affiliate_count} / ${profile.max_sub_affiliates}`
                }
              />
            ) : profile.parent_affiliate ? (
              <DetailCell
                label="Parent affiliate"
                value={`${profile.parent_affiliate.affiliate_code} · ${profile.parent_affiliate.email}`}
              />
            ) : (
              <DetailCell label="Parent affiliate" value="—" />
            )}
          </dl>

          <div className="rounded-xl border border-deep-teal/10 bg-surface-muted/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-deep-teal/45">Referral link</p>
              <button
                type="button"
                onClick={() => void copyReferralLink()}
                className="inline-flex items-center gap-1.5 rounded-full border border-deep-teal/15 px-3 py-1 text-xs font-medium text-deep-teal hover:border-pacific-teal"
              >
                <Copy className="size-3" aria-hidden="true" />
                Copy
              </button>
            </div>
            <p className="mt-2 break-all font-mono text-xs text-deep-teal/80">{profile.referral_link}</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-deep-teal/25 bg-pure-white shadow-[0_4px_24px_rgba(1,26,36,0.12)]">
        <div className="bg-deep-teal px-5 py-4 text-pure-white">
          <div className="flex items-center gap-3">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-pure-white/15"
              aria-hidden="true"
            >
              <Users className="size-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-light">Referral stats</h2>
              <p className="text-xs text-pure-white/75">Your network at a glance</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCell label="My clinic referrals" value={profile.stats.own_clinic_referrals} />
          {isMain ? (
            <>
              <StatCell label="Total network referrals" value={profile.stats.total_clinic_referrals} />
              <StatCell label="Sub-affiliates" value={profile.stats.sub_affiliate_count} />
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
