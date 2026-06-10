"use client";

import { useAffiliatePortal } from "@/context/AffiliatePortalProvider";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-deep-teal/10 bg-pure-white px-4 py-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-deep-teal/45">{label}</p>
      <p className="mt-2 font-serif text-3xl font-light text-deep-teal">{value}</p>
    </div>
  );
}

export function AffiliateDashboard() {
  const { profile, isMain, isLoading } = useAffiliatePortal();

  if (isLoading) {
    return (
      <p className="text-sm text-deep-teal/50">Loading your affiliate account…</p>
    );
  }

  if (!profile) {
    return (
      <p className="text-sm text-deep-teal/50">Unable to load affiliate profile.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-light text-deep-teal">Dashboard</h1>
        <p className="mt-1 text-sm text-deep-teal/55">
          {isMain
            ? "Manage your affiliate network, clinic referrals, and sub-affiliates."
            : "View your account and invite clinics to join Frontier Biomed."}
        </p>
      </div>

      <div className="rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-sm">
        <h2 className="text-sm font-medium text-deep-teal">Account</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-deep-teal/45">Email</dt>
            <dd className="text-deep-teal">{profile.email}</dd>
          </div>
          <div>
            <dt className="text-deep-teal/45">Affiliate code</dt>
            <dd className="font-mono text-deep-teal">{profile.affiliate_code}</dd>
          </div>
          <div>
            <dt className="text-deep-teal/45">Type</dt>
            <dd className="capitalize text-deep-teal">{profile.affiliate_type}</dd>
          </div>
          <div>
            <dt className="text-deep-teal/45">Status</dt>
            <dd className="capitalize text-deep-teal">{profile.status}</dd>
          </div>
          <div>
            <dt className="text-deep-teal/45">Profit margin</dt>
            <dd className="text-deep-teal">{profile.profit_margin_percent}%</dd>
          </div>
          {profile.parent_affiliate ? (
            <div>
              <dt className="text-deep-teal/45">Parent affiliate</dt>
              <dd className="text-deep-teal">
                {profile.parent_affiliate.affiliate_code} · {profile.parent_affiliate.email}
              </dd>
            </div>
          ) : null}
          {isMain ? (
            <div>
              <dt className="text-deep-teal/45">Sub-affiliate limit</dt>
              <dd className="text-deep-teal">
                {profile.max_sub_affiliates === null
                  ? "Unlimited"
                  : `${profile.stats.sub_affiliate_count} / ${profile.max_sub_affiliates}`}
              </dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-wide text-deep-teal/45">Referral link</p>
          <p className="mt-2 break-all rounded-xl bg-deep-teal/[0.03] px-3 py-2 font-mono text-xs text-deep-teal">
            {profile.referral_link}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="My clinic referrals" value={profile.stats.own_clinic_referrals} />
        {isMain ? (
          <>
            <StatCard label="Total network referrals" value={profile.stats.total_clinic_referrals} />
            <StatCard label="Sub-affiliates" value={profile.stats.sub_affiliate_count} />
          </>
        ) : null}
      </div>
    </div>
  );
}
