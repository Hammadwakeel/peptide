"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { useProviderPortal } from "@/context/ProviderPortalProvider";
import { DEFAULT_THEME_COLOR } from "@/lib/brand/colors";
import { toast } from "@/lib/toast";

function isValidHex(color: string): boolean {
  return /^#([0-9A-Fa-f]{6})$/.test(color);
}

export function StorefrontBrandingPanel() {
  const { branding, updateBranding } = useProviderPortal();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateBranding({ logoUrl: url });
    toast.success("Logo uploaded.");
  }

  function handleColorChange(value: string) {
    const normalized = value.startsWith("#") ? value : `#${value}`;
    updateBranding({ themeColor: normalized });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <div>
          <label className={authLabelClassName}>Clinic logo</label>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-xl border border-deep-teal/15 bg-deep-teal/[0.02]">
              {branding.logoUrl ? (
                <Image
                  src={branding.logoUrl}
                  alt="Clinic logo preview"
                  width={80}
                  height={80}
                  className="size-full object-contain"
                  unoptimized
                />
              ) : (
                <span className="text-xs text-deep-teal/40">No logo</span>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full border border-deep-teal/15 px-4 py-2 text-sm font-light text-deep-teal hover:bg-pacific-teal/12"
              >
                Upload logo
              </button>
              {branding.logoUrl ? (
                <button
                  type="button"
                  onClick={() => updateBranding({ logoUrl: null })}
                  className="ml-2 text-sm text-deep-teal/50 hover:text-deep-teal"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div>
          <label className={authLabelClassName} htmlFor="branding-clinic-name">
            Clinic name
          </label>
          <input
            id="branding-clinic-name"
            value={branding.clinicName}
            onChange={(e) => updateBranding({ clinicName: e.target.value })}
            className={authInputClassName}
          />
        </div>

        <div>
          <label className={authLabelClassName} htmlFor="branding-tagline">
            Tagline
          </label>
          <input
            id="branding-tagline"
            value={branding.tagline}
            onChange={(e) => updateBranding({ tagline: e.target.value })}
            className={authInputClassName}
          />
        </div>

        <div>
          <label className={authLabelClassName} htmlFor="branding-theme-color">
            Theme color
          </label>
          <div className="mt-2 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="size-12 shrink-0 rounded-xl border border-deep-teal/15"
              style={{ backgroundColor: isValidHex(branding.themeColor) ? branding.themeColor : DEFAULT_THEME_COLOR }}
            />
            <input
              id="branding-theme-color"
              type="color"
              value={isValidHex(branding.themeColor) ? branding.themeColor : DEFAULT_THEME_COLOR}
              onChange={(e) => handleColorChange(e.target.value)}
              className="size-12 cursor-pointer rounded-xl border border-deep-teal/15 bg-transparent"
            />
            <input
              value={branding.themeColor}
              onChange={(e) => handleColorChange(e.target.value)}
              placeholder={DEFAULT_THEME_COLOR}
              className={`${authInputClassName} font-sans`}
            />
          </div>
        </div>
      </div>

      <aside className="rounded-2xl border border-deep-teal/10 bg-deep-teal/[0.02] p-4">
        <p className="text-[10px] font-light uppercase tracking-wide text-deep-teal/45">
          Live preview
        </p>
        <div
          className="mt-4 overflow-hidden rounded-xl border border-deep-teal/10 bg-pure-white shadow-sm"
          style={{ borderTopColor: branding.themeColor, borderTopWidth: 4 }}
        >
          <div className="px-4 py-5" style={{ backgroundColor: `${branding.themeColor}12` }}>
            <div className="flex items-center gap-3">
              {branding.logoUrl ? (
                <Image
                  src={branding.logoUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-lg object-contain"
                  unoptimized
                />
              ) : (
                <div
                  className="flex size-10 items-center justify-center rounded-lg text-xs font-light text-pure-white"
                  style={{ backgroundColor: branding.themeColor }}
                >
                  {branding.clinicName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-light text-deep-teal">{branding.clinicName || "Clinic name"}</p>
                <p className="font-editorial text-xs text-deep-teal/55">{branding.tagline || "Your tagline"}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <div className="h-24 rounded-lg bg-deep-teal/5" />
            <div className="flex gap-2">
              <div className="h-8 flex-1 rounded-full bg-deep-teal/10" />
              <div
                className="h-8 w-24 rounded-full"
                style={{ backgroundColor: branding.themeColor }}
              />
            </div>
            <p className="text-[10px] text-deep-teal/40">
              Customer-facing storefront preview
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
