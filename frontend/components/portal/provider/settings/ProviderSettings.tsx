"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Settings } from "lucide-react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { ProviderPageSection } from "@/components/portal/provider/shared/ProviderPageSection";
import {
  ProviderPageToolbar,
  toolbarBtnClass,
  toolbarBtnPrimaryClass,
} from "@/components/portal/provider/shared/ProviderPageToolbar";
import {
  getClinicProfile,
  updateClinicAddress,
  updateClinicBanking,
  updateClinicBranding,
  updateClinicProfile,
  updateClinicSettings,
  uploadClinicLogo,
} from "@/lib/doctor/api";
import type {
  ClinicPermission,
  ClinicProfileResponse,
} from "@/lib/doctor/clinic-types";
import { DEFAULT_THEME_COLOR } from "@/lib/brand/colors";
import { showError, toast } from "@/lib/toast";

const SETTINGS_TABS = [
  "Practice Info",
  "Storefront Branding",
  "Banking",
  "Notifications",
] as const;

type SettingsTab = (typeof SETTINGS_TABS)[number];

function hasPermission(permissions: ClinicPermission[], permission: ClinicPermission) {
  return permissions.includes(permission);
}

export function ProviderSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("Practice Info");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ClinicProfileResponse | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [practice, setPractice] = useState({
    clinic_name: "",
    phone: "",
    website: "",
    npi_number: "",
    dea_number: "",
    state_license_number: "",
    tax_id: "",
    first_name: "",
    last_name: "",
  });
  const [address, setAddress] = useState({
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });
  const [branding, setBranding] = useState<{
    tagline: string;
    theme_color: string;
    logo_url: string | null;
  }>({
    tagline: "",
    theme_color: DEFAULT_THEME_COLOR,
    logo_url: null,
  });
  const [banking, setBanking] = useState({
    bank_name: "",
    account_type: "checking" as "checking" | "savings",
    routing_number: "",
    account_number: "",
  });
  const [settings, setSettings] = useState({
    notification_email: true,
    notification_sms: false,
    auto_approve_requests: false,
    payout_schedule_days: 3,
    timezone: "America/New_York",
  });

  const applyProfile = useCallback((data: ClinicProfileResponse) => {
    setProfile(data);
    setPractice({
      clinic_name: data.clinic.clinic_name || "",
      phone: data.clinic.phone || "",
      website: data.clinic.website || "",
      npi_number: data.clinic.npi_number || "",
      dea_number: data.clinic.dea_number || "",
      state_license_number: data.clinic.state_license_number || "",
      tax_id: data.clinic.tax_id || "",
      first_name: data.clinic.first_name || "",
      last_name: data.clinic.last_name || "",
    });
    if (data.address) {
      setAddress({
        address1: data.address.address1,
        address2: data.address.address2 || "",
        city: data.address.city,
        state: data.address.state,
        zip: data.address.zip,
        country: data.address.country || "US",
      });
    }
    setBranding({
      tagline: data.branding.tagline || "",
      theme_color: data.branding.theme_color || DEFAULT_THEME_COLOR,
      logo_url: data.branding.logo_url,
    });
    if (data.banking) {
      setBanking((current) => ({
        ...current,
        bank_name: data.banking?.bank_name || "",
        account_type: (data.banking?.account_type as "checking" | "savings") || "checking",
        routing_number: "",
        account_number: "",
      }));
    }
    setSettings(data.settings);
    setLogoFile(null);
  }, []);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getClinicProfile();
      applyProfile(data);
    } catch (error) {
      showError(error, "Unable to load clinic profile.");
    } finally {
      setIsLoading(false);
    }
  }, [applyProfile]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const permissions = profile?.membership.permissions ?? [];
  const canEdit = (permission: ClinicPermission) => hasPermission(permissions, permission);

  async function handleSave() {
    if (!profile) return;
    setIsSaving(true);
    try {
      let updated: ClinicProfileResponse | null = null;

      if (activeTab === "Practice Info") {
        if (!canEdit("edit_clinic")) {
          toast.error("You do not have permission to edit practice info.");
          return;
        }
        updated = await updateClinicProfile(practice);
        updated = await updateClinicAddress({
          address1: address.address1,
          address2: address.address2 || null,
          city: address.city,
          state: address.state,
          zip: address.zip,
          country: address.country,
        });
      } else if (activeTab === "Storefront Branding") {
        if (!canEdit("edit_branding")) {
          toast.error("You do not have permission to edit branding.");
          return;
        }
        if (logoFile) {
          updated = await uploadClinicLogo(logoFile);
        }
        updated = await updateClinicBranding({
          tagline: branding.tagline || null,
          theme_color: branding.theme_color,
        });
      } else if (activeTab === "Banking") {
        if (!canEdit("edit_banking")) {
          toast.error("You do not have permission to edit banking.");
          return;
        }
        if (banking.routing_number.length !== 9) {
          toast.error("Routing number must be 9 digits.");
          return;
        }
        if (banking.account_number.length < 4) {
          toast.error("Account number must be at least 4 characters.");
          return;
        }
        updated = await updateClinicBanking(banking);
      } else if (activeTab === "Notifications") {
        if (!canEdit("edit_settings")) {
          toast.error("You do not have permission to edit settings.");
          return;
        }
        updated = await updateClinicSettings(settings);
      }

      if (updated) {
        applyProfile(updated);
      }
      toast.success("Settings saved.");
    } catch (error) {
      showError(error, "Unable to save settings.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="py-12 text-center text-sm text-deep-teal/50">Loading clinic profile…</p>;
  }

  if (!profile) {
    return <p className="py-12 text-center text-sm text-deep-teal/50">Clinic profile unavailable.</p>;
  }

  const logoPreview = logoFile ? URL.createObjectURL(logoFile) : branding.logo_url;
  const readOnlyPractice = !canEdit("edit_clinic");
  const readOnlyBranding = !canEdit("edit_branding");
  const readOnlyBanking = !canEdit("edit_banking");
  const readOnlySettings = !canEdit("edit_settings");

  const canSaveCurrentTab =
    (activeTab === "Practice Info" && !readOnlyPractice) ||
    (activeTab === "Storefront Branding" && !readOnlyBranding) ||
    (activeTab === "Banking" && !readOnlyBanking) ||
    (activeTab === "Notifications" && !readOnlySettings);

  return (
    <div className="space-y-5">
      <ProviderPageToolbar title="Settings">
        <button
          type="button"
          onClick={() => void loadProfile()}
          disabled={isLoading}
          className={toolbarBtnClass}
          aria-label="Refresh settings"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
        </button>
        {canSaveCurrentTab ? (
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className={toolbarBtnPrimaryClass}
          >
            {isSaving ? "Saving…" : "Save changes"}
          </button>
        ) : null}
      </ProviderPageToolbar>

      <ProviderPageSection
        icon={Settings}
        title={profile.clinic.clinic_name}
        subtitle={`${profile.clinic.email} · ${profile.membership.access_level.replace("_", " ")}`}
      >
      <div className="flex flex-wrap gap-2 border-b border-deep-teal/10 pb-5">
        {SETTINGS_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 text-xs font-light transition-colors sm:text-sm ${
              activeTab === tab
                ? "bg-deep-teal text-pure-white"
                : "text-deep-teal/65 hover:bg-deep-teal/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4 pt-5">
        {activeTab === "Practice Info" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={authLabelClassName}>Clinic name</label>
              <input
                value={practice.clinic_name}
                onChange={(e) => setPractice((c) => ({ ...c, clinic_name: e.target.value }))}
                disabled={readOnlyPractice}
                className={authInputClassName}
              />
            </div>
            <div>
              <label className={authLabelClassName}>Phone</label>
              <input
                value={practice.phone}
                onChange={(e) => setPractice((c) => ({ ...c, phone: e.target.value }))}
                disabled={readOnlyPractice}
                className={authInputClassName}
              />
            </div>
            <div>
              <label className={authLabelClassName}>Website</label>
              <input
                value={practice.website}
                onChange={(e) => setPractice((c) => ({ ...c, website: e.target.value }))}
                disabled={readOnlyPractice}
                className={authInputClassName}
              />
            </div>
            <div>
              <label className={authLabelClassName}>NPI #</label>
              <input
                value={practice.npi_number}
                onChange={(e) => setPractice((c) => ({ ...c, npi_number: e.target.value }))}
                disabled={readOnlyPractice}
                className={authInputClassName}
              />
            </div>
            <div>
              <label className={authLabelClassName}>DEA #</label>
              <input
                value={practice.dea_number}
                onChange={(e) => setPractice((c) => ({ ...c, dea_number: e.target.value }))}
                disabled={readOnlyPractice}
                className={authInputClassName}
              />
            </div>
            <div>
              <label className={authLabelClassName}>State license #</label>
              <input
                value={practice.state_license_number}
                onChange={(e) =>
                  setPractice((c) => ({ ...c, state_license_number: e.target.value }))
                }
                disabled={readOnlyPractice}
                className={authInputClassName}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={authLabelClassName}>Address line 1</label>
              <input
                value={address.address1}
                onChange={(e) => setAddress((c) => ({ ...c, address1: e.target.value }))}
                disabled={readOnlyPractice}
                className={authInputClassName}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={authLabelClassName}>Address line 2</label>
              <input
                value={address.address2}
                onChange={(e) => setAddress((c) => ({ ...c, address2: e.target.value }))}
                disabled={readOnlyPractice}
                className={authInputClassName}
              />
            </div>
            <div>
              <label className={authLabelClassName}>City</label>
              <input
                value={address.city}
                onChange={(e) => setAddress((c) => ({ ...c, city: e.target.value }))}
                disabled={readOnlyPractice}
                className={authInputClassName}
              />
            </div>
            <div>
              <label className={authLabelClassName}>State</label>
              <input
                value={address.state}
                onChange={(e) => setAddress((c) => ({ ...c, state: e.target.value }))}
                disabled={readOnlyPractice}
                className={authInputClassName}
              />
            </div>
            <div>
              <label className={authLabelClassName}>ZIP</label>
              <input
                value={address.zip}
                onChange={(e) => setAddress((c) => ({ ...c, zip: e.target.value }))}
                disabled={readOnlyPractice}
                className={authInputClassName}
              />
            </div>
          </div>
        ) : null}

        {activeTab === "Storefront Branding" ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-4">
              <div>
                <label className={authLabelClassName}>Clinic logo</label>
                <div className="mt-2 flex flex-wrap items-center gap-4">
                  <div className="flex size-20 items-center justify-center overflow-hidden rounded-xl border border-deep-teal/15 bg-deep-teal/[0.02]">
                    {logoPreview ? (
                      <Image
                        src={logoPreview}
                        alt="Clinic logo"
                        width={80}
                        height={80}
                        className="size-full object-contain"
                        unoptimized
                      />
                    ) : (
                      <span className="text-xs text-deep-teal/40">No logo</span>
                    )}
                  </div>
                  {!readOnlyBranding ? (
                    <>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                      />
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm font-light text-deep-teal"
                      >
                        Upload logo
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
              <div>
                <label className={authLabelClassName}>Tagline</label>
                <input
                  value={branding.tagline}
                  onChange={(e) => setBranding((c) => ({ ...c, tagline: e.target.value }))}
                  disabled={readOnlyBranding}
                  className={authInputClassName}
                />
              </div>
              <div>
                <label className={authLabelClassName}>Theme color</label>
                <input
                  value={branding.theme_color}
                  onChange={(e) => setBranding((c) => ({ ...c, theme_color: e.target.value }))}
                  disabled={readOnlyBranding}
                  className={authInputClassName}
                />
              </div>
            </div>
            <aside
              className="rounded-2xl border border-deep-teal/10 p-4"
              style={{ borderTopColor: branding.theme_color, borderTopWidth: 4 }}
            >
              <p className="text-sm font-light text-deep-teal">{practice.clinic_name}</p>
              <p className="font-sans text-xs font-light text-deep-teal/55">{branding.tagline || "Your tagline"}</p>
            </aside>
          </div>
        ) : null}

        {activeTab === "Banking" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {profile.banking ? (
              <p className="sm:col-span-2 text-xs text-deep-teal/50">
                Current account ending in {profile.banking.account_last4} · routing ending in{" "}
                {profile.banking.routing_last4}
              </p>
            ) : null}
            <div>
              <label className={authLabelClassName}>Bank name</label>
              <input
                value={banking.bank_name}
                onChange={(e) => setBanking((c) => ({ ...c, bank_name: e.target.value }))}
                disabled={readOnlyBanking}
                className={authInputClassName}
              />
            </div>
            <div>
              <label className={authLabelClassName}>Account type</label>
              <select
                value={banking.account_type}
                onChange={(e) =>
                  setBanking((c) => ({
                    ...c,
                    account_type: e.target.value as "checking" | "savings",
                  }))
                }
                disabled={readOnlyBanking}
                className={authInputClassName}
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </select>
            </div>
            <div>
              <label className={authLabelClassName}>Routing number</label>
              <input
                value={banking.routing_number}
                onChange={(e) => setBanking((c) => ({ ...c, routing_number: e.target.value }))}
                disabled={readOnlyBanking}
                className={authInputClassName}
                placeholder="9 digits"
              />
            </div>
            <div>
              <label className={authLabelClassName}>Account number</label>
              <input
                value={banking.account_number}
                onChange={(e) => setBanking((c) => ({ ...c, account_number: e.target.value }))}
                disabled={readOnlyBanking}
                className={authInputClassName}
                placeholder="Full account number"
              />
            </div>
          </div>
        ) : null}

        {activeTab === "Notifications" ? (
          <div className="space-y-3">
            {(
              [
                ["notification_email", "Email notifications"],
                ["notification_sms", "SMS notifications"],
                ["auto_approve_requests", "Auto-approve patient requests"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between rounded-xl border border-deep-teal/10 px-4 py-3"
              >
                <span className="text-sm text-deep-teal">{label}</span>
                <input
                  type="checkbox"
                  checked={settings[key]}
                  disabled={readOnlySettings}
                  onChange={(e) =>
                    setSettings((c) => ({ ...c, [key]: e.target.checked }))
                  }
                  className="size-4 rounded border-deep-teal/20 text-pacific-teal"
                />
              </label>
            ))}
            <div>
              <label className={authLabelClassName}>Timezone</label>
              <input
                value={settings.timezone}
                onChange={(e) => setSettings((c) => ({ ...c, timezone: e.target.value }))}
                disabled={readOnlySettings}
                className={authInputClassName}
              />
            </div>
          </div>
        ) : null}

        {!canSaveCurrentTab ? (
          <p className="text-sm text-deep-teal/50">View only — contact your clinic owner to make changes.</p>
        ) : null}
      </div>
      </ProviderPageSection>
    </div>
  );
}
