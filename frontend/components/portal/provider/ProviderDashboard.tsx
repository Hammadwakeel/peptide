"use client";

import { ProviderMetricsBar } from "@/components/portal/provider/ProviderMetricsBar";

export function ProviderDashboard() {
  return (
    <div className="space-y-6">
      <ProviderMetricsBar />

      <div className="rounded-[2rem] border border-deep-teal/10 bg-pure-white p-6 shadow-sm sm:p-8">
        <p className="max-w-2xl text-sm leading-relaxed text-deep-teal/65">
          Welcome to your provider workspace. Orders, verification workflows, and clinic
          analytics will live here once backend services are connected.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Open orders", value: "12" },
            { label: "Pending verifications", value: "3" },
            { label: "Team members", value: "8" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-deep-teal/10 bg-deep-teal/[0.02] px-4 py-5"
            >
              <p className="text-xs uppercase tracking-wide text-deep-teal/45">{stat.label}</p>
              <p className="mt-2 font-serif text-3xl font-light text-deep-teal">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
