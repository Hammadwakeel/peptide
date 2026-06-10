"use client";

import {
  authInputCompactClassName,
  authLabelCompactClassName,
} from "@/components/auth/AuthShell";
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
          <label htmlFor="firstName" className={authLabelCompactClassName}>First name</label>
          <input id="firstName" required value={value.firstName} onChange={(e) => update("firstName", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="lastName" className={authLabelCompactClassName}>Last name</label>
          <input id="lastName" required value={value.lastName} onChange={(e) => update("lastName", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="clinicName" className={authLabelCompactClassName}>Clinic name</label>
          <input id="clinicName" required minLength={2} value={value.clinicName} onChange={(e) => update("clinicName", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="website" className={authLabelCompactClassName}>Website</label>
          <input id="website" required type="url" placeholder="https://example.com" value={value.website} onChange={(e) => update("website", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="taxId" className={authLabelCompactClassName}>Tax ID</label>
          <input id="taxId" required value={value.taxId} onChange={(e) => update("taxId", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="resellerPermitNumber" className={authLabelCompactClassName}>Reseller permit #</label>
          <input id="resellerPermitNumber" required value={value.resellerPermitNumber} onChange={(e) => update("resellerPermitNumber", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="npi" className={authLabelCompactClassName}>NPI # (optional)</label>
          <input id="npi" value={value.npi} onChange={(e) => update("npi", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="dea" className={authLabelCompactClassName}>DEA # (optional)</label>
          <input id="dea" value={value.dea} onChange={(e) => update("dea", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="stateLicense" className={authLabelCompactClassName}>State license # (optional)</label>
          <input id="stateLicense" value={value.stateLicense} onChange={(e) => update("stateLicense", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="address1" className={authLabelCompactClassName}>Street address</label>
          <input id="address1" required value={value.address1} onChange={(e) => update("address1", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="address2" className={authLabelCompactClassName}>Suite / unit (optional)</label>
          <input id="address2" value={value.address2} onChange={(e) => update("address2", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="city" className={authLabelCompactClassName}>City</label>
          <input id="city" required value={value.city} onChange={(e) => update("city", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="state" className={authLabelCompactClassName}>State</label>
          <input id="state" required maxLength={2} value={value.state} onChange={(e) => update("state", e.target.value.toUpperCase())} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="zip" className={authLabelCompactClassName}>ZIP code</label>
          <input id="zip" required value={value.zip} onChange={(e) => update("zip", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div>
          <label htmlFor="phone" className={authLabelCompactClassName}>Phone</label>
          <input id="phone" type="tel" required value={value.phone} onChange={(e) => update("phone", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="email" className={authLabelCompactClassName}>Email</label>
          <input id="email" type="email" required value={value.email} onChange={(e) => update("email", e.target.value)} className={authInputCompactClassName} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="affiliateCode" className={authLabelCompactClassName}>Affiliate code (optional)</label>
          <input
            id="affiliateCode"
            maxLength={8}
            value={value.affiliateCode}
            onChange={(e) => update("affiliateCode", e.target.value)}
            className={authInputCompactClassName}
          />
          <p className="mt-1 text-xs text-deep-teal/50">8-character code from your referring affiliate.</p>
        </div>
      </div>
    </div>
  );
}
