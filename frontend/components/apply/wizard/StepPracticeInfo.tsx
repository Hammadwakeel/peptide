"use client";

import { useState } from "react";
import { ApplyField, applyInputClassName } from "@/components/apply/wizard/ApplyField";
import { ApplyTabs } from "@/components/apply/wizard/ApplyTabs";
import type { PracticeInfo } from "@/lib/apply/types";

const PRACTICE_TABS = [
  { id: "contact", label: "Contact" },
  { id: "practice", label: "Practice" },
  { id: "credentials", label: "Licenses" },
  { id: "address", label: "Address" },
] as const;

type PracticeTabId = (typeof PRACTICE_TABS)[number]["id"];

type StepPracticeInfoProps = {
  value: PracticeInfo;
  onChange: (value: PracticeInfo) => void;
};

export function StepPracticeInfo({ value, onChange }: StepPracticeInfoProps) {
  const [activeTab, setActiveTab] = useState<PracticeTabId>("contact");

  function update<K extends keyof PracticeInfo>(key: K, fieldValue: PracticeInfo[K]) {
    onChange({ ...value, [key]: fieldValue });
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ApplyTabs
        tabs={[...PRACTICE_TABS]}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as PracticeTabId)}
        variant="secondary"
        className="shrink-0"
      />

      <div
        role="tabpanel"
        className="mt-5 min-h-0 flex-1 rounded-[1.25rem] border border-deep-teal/10 bg-pure-white p-5 shadow-sm shadow-deep-teal/[0.04] sm:p-6"
      >
        {activeTab === "contact" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <ApplyField label="First name" htmlFor="firstName">
              <input
                id="firstName"
                required
                value={value.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                className={applyInputClassName}
                placeholder="Jane"
              />
            </ApplyField>
            <ApplyField label="Last name" htmlFor="lastName">
              <input
                id="lastName"
                required
                value={value.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                className={applyInputClassName}
                placeholder="Smith"
              />
            </ApplyField>
            <ApplyField label="Email" htmlFor="email" className="sm:col-span-2">
              <input
                id="email"
                type="email"
                required
                value={value.email}
                onChange={(e) => update("email", e.target.value)}
                className={applyInputClassName}
                placeholder="contact@clinic.com"
              />
            </ApplyField>
            <ApplyField label="Phone" htmlFor="phone" className="sm:col-span-2">
              <input
                id="phone"
                type="tel"
                required
                value={value.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={applyInputClassName}
                placeholder="(555) 000-0000"
              />
            </ApplyField>
          </div>
        ) : null}

        {activeTab === "practice" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <ApplyField label="Clinic name" htmlFor="clinicName" className="sm:col-span-2">
              <input
                id="clinicName"
                required
                minLength={2}
                value={value.clinicName}
                onChange={(e) => update("clinicName", e.target.value)}
                className={applyInputClassName}
                placeholder="Frontier Wellness Clinic"
              />
            </ApplyField>
            <ApplyField label="Website" htmlFor="website">
              <input
                id="website"
                required
                type="url"
                value={value.website}
                onChange={(e) => update("website", e.target.value)}
                className={applyInputClassName}
                placeholder="https://yourclinic.com"
              />
            </ApplyField>
            <ApplyField label="Tax ID" htmlFor="taxId">
              <input
                id="taxId"
                required
                value={value.taxId}
                onChange={(e) => update("taxId", e.target.value)}
                className={applyInputClassName}
                placeholder="XX-XXXXXXX"
              />
            </ApplyField>
            <ApplyField
              label="Reseller permit number"
              htmlFor="resellerPermitNumber"
              className="sm:col-span-2"
            >
              <input
                id="resellerPermitNumber"
                required
                value={value.resellerPermitNumber}
                onChange={(e) => update("resellerPermitNumber", e.target.value)}
                className={applyInputClassName}
              />
            </ApplyField>
            <ApplyField
              label="Affiliate referral code"
              htmlFor="affiliateCode"
              optional
              hint="8-character code from your referring affiliate, if applicable."
              className="sm:col-span-2"
            >
              <input
                id="affiliateCode"
                maxLength={8}
                value={value.affiliateCode}
                onChange={(e) => update("affiliateCode", e.target.value.toUpperCase())}
                className={applyInputClassName}
                placeholder="AB12CD34"
              />
            </ApplyField>
          </div>
        ) : null}

        {activeTab === "credentials" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ApplyField label="NPI number" htmlFor="npi" optional>
              <input
                id="npi"
                value={value.npi}
                onChange={(e) => update("npi", e.target.value)}
                className={applyInputClassName}
                placeholder="1234567890"
              />
            </ApplyField>
            <ApplyField label="DEA number" htmlFor="dea" optional>
              <input
                id="dea"
                value={value.dea}
                onChange={(e) => update("dea", e.target.value)}
                className={applyInputClassName}
              />
            </ApplyField>
            <ApplyField label="State license" htmlFor="stateLicense" optional>
              <input
                id="stateLicense"
                value={value.stateLicense}
                onChange={(e) => update("stateLicense", e.target.value)}
                className={applyInputClassName}
              />
            </ApplyField>
          </div>
        ) : null}

        {activeTab === "address" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <ApplyField label="Street address" htmlFor="address1" className="sm:col-span-2">
              <input
                id="address1"
                required
                value={value.address1}
                onChange={(e) => update("address1", e.target.value)}
                className={applyInputClassName}
                placeholder="123 Main Street"
              />
            </ApplyField>
            <ApplyField label="Suite or unit" htmlFor="address2" optional className="sm:col-span-2">
              <input
                id="address2"
                value={value.address2}
                onChange={(e) => update("address2", e.target.value)}
                className={applyInputClassName}
                placeholder="Suite 200"
              />
            </ApplyField>
            <ApplyField label="City" htmlFor="city">
              <input
                id="city"
                required
                value={value.city}
                onChange={(e) => update("city", e.target.value)}
                className={applyInputClassName}
              />
            </ApplyField>
            <div className="grid grid-cols-2 gap-4">
              <ApplyField label="State" htmlFor="state">
                <input
                  id="state"
                  required
                  maxLength={2}
                  value={value.state}
                  onChange={(e) => update("state", e.target.value.toUpperCase())}
                  className={applyInputClassName}
                  placeholder="CA"
                />
              </ApplyField>
              <ApplyField label="ZIP" htmlFor="zip">
                <input
                  id="zip"
                  required
                  value={value.zip}
                  onChange={(e) => update("zip", e.target.value)}
                  className={applyInputClassName}
                  placeholder="90210"
                />
              </ApplyField>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
