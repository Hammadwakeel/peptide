"use client";

import {
  authInputCompactClassName,
  authLabelCompactClassName,
} from "@/components/auth/AuthShell";
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
    <div className="space-y-4">
      <div className="rounded-xl border border-pacific-teal/15 bg-pacific-teal/5 p-4">
        <p className="text-sm font-medium text-deep-teal">Bank account details</p>
        <p className="mt-1 text-xs text-deep-teal/60">
          Routing and account numbers are encrypted before storage.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="bankName" className={authLabelCompactClassName}>Bank name</label>
          <input id="bankName" required value={value.bankName} onChange={(e) => update("bankName", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="routingNumber" className={authLabelCompactClassName}>Routing number</label>
          <input id="routingNumber" required inputMode="numeric" maxLength={9} value={value.routingNumber} onChange={(e) => update("routingNumber", e.target.value.replace(/\D/g, "").slice(0, 9))} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="accountNumber" className={authLabelCompactClassName}>Account number</label>
          <input id="accountNumber" required value={value.accountNumber} onChange={(e) => update("accountNumber", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="accountType" className={authLabelCompactClassName}>Account type</label>
          <select
            id="accountType"
            value={value.accountType}
            onChange={(e) => update("accountType", e.target.value as BankingInfo["accountType"])}
            className={authInputCompactClassName}
          >
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
          </select>
        </div>
      </div>
    </div>
  );
}
