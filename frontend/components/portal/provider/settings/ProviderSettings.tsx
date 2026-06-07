"use client";

import { useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { StorefrontBrandingPanel } from "@/components/portal/provider/settings/StorefrontBrandingPanel";
import { toast } from "@/lib/toast";

const SETTINGS_TABS = [
  "Practice Info",
  "Storefront Branding",
  "Banking",
  "Notifications",
  "Security",
] as const;

type SettingsTab = (typeof SETTINGS_TABS)[number];

export function ProviderSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("Practice Info");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  function handleSave() {
    toast.success("Settings saved.");
  }

  return (
    <div className="rounded-[2rem] border border-deep-teal/10 bg-pure-white shadow-sm">
      <div className="flex flex-wrap gap-2 border-b border-deep-teal/10 p-4 sm:p-6">
        {SETTINGS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 text-xs font-medium transition-colors sm:text-sm ${
              activeTab === tab
                ? "bg-deep-teal text-pure-white"
                : "text-deep-teal/65 hover:bg-deep-teal/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        {activeTab === "Practice Info" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={authLabelClassName}>Clinic name</label>
              <input defaultValue="Frontier Wellness Clinic" className={authInputClassName} />
            </div>
            <div>
              <label className={authLabelClassName}>NPI #</label>
              <input defaultValue="1234567890" className={authInputClassName} />
            </div>
            <div className="sm:col-span-2">
              <label className={authLabelClassName}>Business address</label>
              <input defaultValue="1200 Market St, San Francisco, CA" className={authInputClassName} />
            </div>
          </div>
        ) : null}

        {activeTab === "Storefront Branding" ? <StorefrontBrandingPanel /> : null}

        {activeTab === "Banking" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={authLabelClassName}>Bank name</label>
              <input defaultValue="First National Trust" className={authInputClassName} />
            </div>
            <div>
              <label className={authLabelClassName}>Account type</label>
              <select className={authInputClassName} defaultValue="checking">
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </select>
            </div>
            <div>
              <label className={authLabelClassName}>Routing number</label>
              <input defaultValue="021000021" className={authInputClassName} />
            </div>
            <div>
              <label className={authLabelClassName}>Account number</label>
              <input defaultValue="••••••4821" className={authInputClassName} />
            </div>
          </div>
        ) : null}

        {activeTab === "Notifications" ? (
          <div className="space-y-3">
            {["Order updates", "Inventory alerts", "Compliance reminders", "Team activity"].map((item) => (
              <label key={item} className="flex items-center justify-between rounded-xl border border-deep-teal/10 px-4 py-3">
                <span className="text-sm text-deep-teal">{item}</span>
                <input type="checkbox" defaultChecked className="size-4 rounded border-deep-teal/20 text-pacific-teal" />
              </label>
            ))}
          </div>
        ) : null}

        {activeTab === "Security" ? (
          <div className="space-y-4">
            <div>
              <label className={authLabelClassName}>Current password</label>
              <input type="password" className={authInputClassName} />
            </div>
            <div>
              <label className={authLabelClassName}>New password</label>
              <input type="password" className={authInputClassName} />
            </div>
            <label className="flex items-center justify-between rounded-xl border border-deep-teal/10 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-deep-teal">Two-factor authentication</p>
                <p className="text-xs text-deep-teal/50">Require a code at sign in.</p>
              </div>
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                className="size-4 rounded border-deep-teal/20 text-pacific-teal"
              />
            </label>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleSave}
          className="rounded-full bg-deep-teal px-5 py-2.5 text-sm font-medium text-pure-white hover:bg-pacific-teal"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}
