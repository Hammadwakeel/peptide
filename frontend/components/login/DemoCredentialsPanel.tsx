"use client";

import { DEMO_ACCOUNTS, PRIMARY_DEMO_ACCOUNT } from "@/lib/auth/demo-credentials";
import type { UserRole } from "@/lib/auth/types";

type DemoCredentialsPanelProps = {
  onUseAccount: (email: string, password: string, role: UserRole) => void;
};

export function DemoCredentialsPanel({ onUseAccount }: DemoCredentialsPanelProps) {
  return (
    <div className="mt-6 rounded-xl border border-pacific-teal/15 bg-pacific-teal/5 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-pacific-teal">
        Demo credentials
      </p>
      <p className="mt-2 text-xs leading-relaxed text-deep-teal/65">
        Password for all demo accounts:{" "}
        <span className="font-mono font-medium text-deep-teal">
          {PRIMARY_DEMO_ACCOUNT.password}
        </span>
      </p>

      <ul className="mt-3 space-y-2">
        {DEMO_ACCOUNTS.map((account) => (
          <li
            key={account.email}
            className="flex flex-col gap-2 rounded-lg border border-deep-teal/10 bg-pure-white/80 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate font-mono text-[11px] text-deep-teal">{account.email}</p>
              <p className="text-[11px] text-deep-teal/50">{account.label}</p>
            </div>
            <button
              type="button"
              onClick={() => onUseAccount(account.email, account.password, account.role)}
              className="shrink-0 rounded-full border border-deep-teal/15 px-3 py-1.5 text-[11px] font-medium text-deep-teal transition-colors hover:border-pacific-teal hover:text-pacific-teal"
            >
              Use account
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
