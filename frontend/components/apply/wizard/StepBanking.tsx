"use client";

import {
  authInputCompactClassName,
  authLabelCompactClassName,
} from "@/components/auth/AuthShell";
import { mockPlaidConnect } from "@/lib/apply/mock-submit";
import type { BankingInfo } from "@/lib/apply/types";
import { toast } from "@/lib/toast";

type StepBankingProps = {
  value: BankingInfo;
  onChange: (value: BankingInfo) => void;
};

export function StepBanking({ value, onChange }: StepBankingProps) {
  function update<K extends keyof BankingInfo>(key: K, fieldValue: BankingInfo[K]) {
    onChange({ ...value, [key]: fieldValue });
  }

  async function handlePlaidConnect() {
    const toastId = toast.loading("Connecting to Plaid…");
    try {
      await mockPlaidConnect();
      toast.dismiss(toastId);
      toast.success("Bank account connected via Plaid.");
      onChange({
        ...value,
        plaidConnected: true,
        bankName: "First National Trust",
        routingNumber: "021000021",
        accountNumber: "••••••4821",
        accountType: "checking",
      });
    } catch {
      toast.dismiss(toastId);
      toast.error("Plaid connection failed.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-pacific-teal/15 bg-pacific-teal/5 p-4">
        <p className="text-sm font-medium text-deep-teal">Connect with Plaid</p>
        <p className="mt-1 text-xs text-deep-teal/60">
          Optional scaffold — securely link your clinic bank account without manual entry.
        </p>
        <button
          type="button"
          onClick={() => void handlePlaidConnect()}
          disabled={value.plaidConnected}
          className="mt-3 rounded-full border border-deep-teal/15 bg-pure-white px-4 py-2 text-xs font-medium text-deep-teal transition-colors hover:border-pacific-teal disabled:opacity-60"
        >
          {value.plaidConnected ? "Plaid connected" : "Connect with Plaid"}
        </button>
      </div>

      <div className={`grid gap-3 sm:grid-cols-2 ${value.plaidConnected ? "opacity-60" : ""}`}>
        <div>
          <label htmlFor="bankName" className={authLabelCompactClassName}>Bank name</label>
          <input id="bankName" value={value.bankName} onChange={(e) => update("bankName", e.target.value)} disabled={value.plaidConnected} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="routingNumber" className={authLabelCompactClassName}>Routing number</label>
          <input id="routingNumber" value={value.routingNumber} onChange={(e) => update("routingNumber", e.target.value)} disabled={value.plaidConnected} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="accountNumber" className={authLabelCompactClassName}>Account number</label>
          <input id="accountNumber" value={value.accountNumber} onChange={(e) => update("accountNumber", e.target.value)} disabled={value.plaidConnected} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="accountType" className={authLabelCompactClassName}>Account type</label>
          <select
            id="accountType"
            value={value.accountType}
            onChange={(e) => update("accountType", e.target.value as BankingInfo["accountType"])}
            disabled={value.plaidConnected}
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
