"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  AuthCard,
  authInputClassName,
  authLabelClassName,
  authLinkClassName,
} from "@/components/auth/AuthShell";
import { DEFAULT_STOREFRONT_BRANDING } from "@/lib/provider/types";
import { toast } from "@/lib/toast";

export function PatientActivationForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const clinicName = searchParams.get("clinic") ?? DEFAULT_STOREFRONT_BRANDING.clinicName;
  const themeColor = searchParams.get("color") ?? DEFAULT_STOREFRONT_BRANDING.themeColor;
  const tagline = searchParams.get("tagline") ?? DEFAULT_STOREFRONT_BRANDING.tagline;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    setSuccess(true);
    toast.success("Account activated.");
  }

  if (!token) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-pure-white px-4">
        <AuthCard>
          <h1 className="font-sans text-2xl font-light text-deep-teal">Invalid activation link</h1>
          <p className="mt-3 text-sm text-deep-teal/60">
            This invite link is missing or expired. Contact your clinic for a new invitation.
          </p>
          <Link href="/login" className={`mt-6 inline-flex text-sm ${authLinkClassName}`}>
            Go to sign in
          </Link>
        </AuthCard>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-pure-white px-4">
        <AuthCard>
          <div
            className="mb-5 inline-flex size-12 items-center justify-center rounded-full text-lg font-light text-pure-white"
            style={{ backgroundColor: themeColor }}
          >
            ✓
          </div>
          <h1 className="font-sans text-2xl font-light text-deep-teal">You&apos;re all set</h1>
          <p className="mt-3 text-sm leading-relaxed text-deep-teal/65">
            Your {clinicName} patient account is active. Sign in with your email and the password
            you just created.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-light text-pure-white"
            style={{ backgroundColor: themeColor }}
          >
            Sign in
          </Link>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-pure-white lg:flex-row">
      <div
        className="flex flex-col justify-between px-6 py-10 sm:px-10 lg:w-1/2 lg:px-14 lg:py-16"
        style={{ backgroundColor: `${themeColor}14` }}
      >
        <div>
          <div className="flex items-center gap-3">
            <div
              className="flex size-12 items-center justify-center rounded-xl text-sm font-light text-pure-white"
              style={{ backgroundColor: themeColor }}
            >
              {clinicName.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p className="font-light text-deep-teal">{clinicName}</p>
              <p className="font-sans text-sm font-light text-deep-teal/55">{tagline}</p>
            </div>
          </div>
          <h1 className="mt-10 max-w-md font-sans text-3xl font-light leading-tight text-deep-teal sm:text-4xl">
            Activate your patient account
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-deep-teal/65">
            Set a secure password to access your orders, messages, and clinic storefront.
          </p>
        </div>
        <div className="relative mt-10 hidden aspect-[4/3] overflow-hidden rounded-2xl lg:block">
          <Image
            src="/brand/product-vial-2x-blend-hero.png"
            alt=""
            fill
            className="object-cover"
            sizes="50vw"
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <AuthCard compact>
          <p className="font-sans text-[10px] font-light text-pacific-teal">
            {clinicName}
          </p>
          <h2 className="mt-2 font-sans text-2xl font-light text-deep-teal">Create your password</h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="activate-password" className={authLabelClassName}>
                Password
              </label>
              <input
                id="activate-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={authInputClassName}
              />
            </div>
            <div>
              <label htmlFor="activate-confirm" className={authLabelClassName}>
                Confirm password
              </label>
              <input
                id="activate-confirm"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={authInputClassName}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full py-3 text-sm font-light text-pure-white disabled:opacity-60"
              style={{ backgroundColor: themeColor }}
            >
              {isSubmitting ? "Activating…" : "Activate account"}
            </button>
          </form>
          </AuthCard>
        </div>
      </div>
    </div>
  );
}
