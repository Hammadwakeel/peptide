"use client";

import { ApplyField, applyInputClassName, applySelectClassName } from "@/components/apply/wizard/ApplyField";
import type { BankingInfo } from "@/lib/apply/types";

type StepBankingProps = {
  value: BankingInfo;
  onChange: (value: BankingInfo) => void;
};

export function StepBanking({ value, onChange }: StepBankingProps) {
  function update<K extends keyof BankingInfo>(key: K, fieldValue: BankingInfo[K]) {
    onChange({ ...value, [key]: fieldValue });
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="shrink-0 rounded-[1.25rem] border border-pacific-teal/15 bg-gradient-to-br from-pacific-teal/[0.07] to-pure-white p-5">
        <div className="flex gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-pacific-teal/10 text-pacific-teal">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 3 3 8v2h18V8l-9-5Zm-7 8v8h14v-8H5Zm2 2h2v4H7v-4Zm4 0h2v4h-2v-4Zm4 0h2v4h-2v-4Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-light text-deep-teal">Secure payout account</p>
            <p className="mt-1 text-sm leading-relaxed text-deep-teal/60">
              Banking details are encrypted before storage. You&apos;ll set login credentials
              after admin approval.
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 rounded-[1.25rem] border border-deep-teal/10 bg-pure-white p-5 shadow-sm shadow-deep-teal/[0.04] sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <ApplyField label="Bank name" htmlFor="bankName" className="sm:col-span-2">
            <input
              id="bankName"
              required
              value={value.bankName}
              onChange={(e) => update("bankName", e.target.value)}
              className={applyInputClassName}
              placeholder="First National Bank"
            />
          </ApplyField>
          <ApplyField label="Account number" htmlFor="accountNumber">
            <input
              id="accountNumber"
              required
              minLength={4}
              value={value.accountNumber}
              onChange={(e) => update("accountNumber", e.target.value)}
              className={applyInputClassName}
              inputMode="numeric"
            />
          </ApplyField>
          <ApplyField label="Account type" htmlFor="accountType">
            <select
              id="accountType"
              value={value.accountType}
              onChange={(e) => update("accountType", e.target.value as BankingInfo["accountType"])}
              className={applySelectClassName}
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </ApplyField>
        </div>
      </div>
    </div>
  );
}
