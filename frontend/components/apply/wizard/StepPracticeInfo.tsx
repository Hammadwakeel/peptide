"use client";

import {
  authInputCompactClassName,
  authLabelCompactClassName,
} from "@/components/auth/AuthShell";
import { PasswordStrengthIndicator } from "@/components/apply/PasswordStrengthIndicator";
import type { PracticeInfo } from "@/lib/apply/types";

type StepPracticeInfoProps = {
  value: PracticeInfo;
  onChange: (value: PracticeInfo) => void;
};

export function StepPracticeInfo({ value, onChange }: StepPracticeInfoProps) {
  function update<K extends keyof PracticeInfo>(key: K, fieldValue: PracticeInfo[K]) {
    onChange({ ...value, [key]: fieldValue });
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="clinicName" className={authLabelCompactClassName}>Clinic name</label>
          <input id="clinicName" required value={value.clinicName} onChange={(e) => update("clinicName", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="npi" className={authLabelCompactClassName}>NPI #</label>
          <input id="npi" required value={value.npi} onChange={(e) => update("npi", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="dea" className={authLabelCompactClassName}>DEA #</label>
          <input id="dea" required value={value.dea} onChange={(e) => update("dea", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="stateLicense" className={authLabelCompactClassName}>State license #</label>
          <input id="stateLicense" required value={value.stateLicense} onChange={(e) => update("stateLicense", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="businessAddress" className={authLabelCompactClassName}>Business address</label>
          <input id="businessAddress" required value={value.businessAddress} onChange={(e) => update("businessAddress", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="phone" className={authLabelCompactClassName}>Phone</label>
          <input id="phone" type="tel" required value={value.phone} onChange={(e) => update("phone", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="contactName" className={authLabelCompactClassName}>Primary contact name</label>
          <input id="contactName" required value={value.contactName} onChange={(e) => update("contactName", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="email" className={authLabelCompactClassName}>Email</label>
          <input id="email" type="email" required value={value.email} onChange={(e) => update("email", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="password" className={authLabelCompactClassName}>Password</label>
          <input id="password" type="password" required value={value.password} onChange={(e) => update("password", e.target.value)} className={authInputCompactClassName} autoComplete="new-password" />
          <PasswordStrengthIndicator password={value.password} />
        </div>
        <div>
          <label htmlFor="confirmPassword" className={authLabelCompactClassName}>Confirm password</label>
          <input id="confirmPassword" type="password" required value={value.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} className={authInputCompactClassName} autoComplete="new-password" />
        </div>
      </div>
    </div>
  );
}
