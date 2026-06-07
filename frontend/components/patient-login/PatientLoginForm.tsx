"use client";

import Link from "next/link";
import { useState } from "react";
import {
  authInputClassName,
  authLabelClassName,
} from "@/components/auth/AuthShell";
import { useAuth } from "@/context/AuthProvider";
import { sendPatientOtp, verifyPatientOtp } from "@/lib/auth/api";
import { CLINIC_BRANDING } from "@/lib/patient-portal/mock-data";
import { showError, toast } from "@/lib/toast";

type LoginMode = "password" | "otp";

export function PatientLoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [mode, setMode] = useState<LoginMode>("password");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  async function handleSendOtp() {
    if (!email.trim()) {
      toast.error("Enter your email first.");
      return;
    }

    const toastId = toast.loading("Sending verification code…");
    try {
      await sendPatientOtp(email);
      setOtpSent(true);
      toast.dismiss(toastId);
      toast.success("Verification code sent.");
    } catch (error) {
      toast.dismiss(toastId);
      showError(error, "Unable to send verification code.");
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading(mode === "otp" ? "Verifying code…" : "Signing in…");

    try {
      if (mode === "otp") {
        if (otp.trim().length !== 6) {
          throw new Error("Enter the 6-digit verification code.");
        }
        await verifyPatientOtp(email, otp);
        toast.dismiss(toastId);
        toast.success("Email verified. Sign in with your password.");
        setMode("password");
        setOtp("");
        return;
      }

      await login({ email, password, role: "patient", rememberMe });
      toast.dismiss(toastId);
      toast.success("Welcome back.");
    } catch (error) {
      toast.dismiss(toastId);
      showError(error, "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-pure-white lg:flex-row">
      <div
        className="flex flex-col justify-between px-6 py-10 sm:px-10 lg:w-1/2 lg:px-14 lg:py-16"
        style={{ backgroundColor: `${CLINIC_BRANDING.themeColor}14` }}
      >
        <div>
          <div className="flex items-center gap-3">
            <div
              className="flex size-12 items-center justify-center rounded-xl text-sm font-semibold text-pure-white"
              style={{ backgroundColor: CLINIC_BRANDING.themeColor }}
            >
              {CLINIC_BRANDING.name.slice(0, 1)}
            </div>
            <div>
              <p className="font-medium text-deep-teal">{CLINIC_BRANDING.name}</p>
              <p className="text-sm text-deep-teal/55">{CLINIC_BRANDING.tagline}</p>
            </div>
          </div>
          <h1 className="mt-10 max-w-md font-serif text-3xl font-light leading-tight text-deep-teal sm:text-4xl">
            Patient sign in
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-deep-teal/65">
            Access your orders, payments, and clinic storefront.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md rounded-2xl border border-deep-teal/10 bg-pure-white p-6 shadow-xl sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="patient-email" className={authLabelClassName}>Email</label>
                <input
                  id="patient-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={authInputClassName}
                />
              </div>

              {mode === "password" ? (
                <div>
                  <label htmlFor="patient-password" className={authLabelClassName}>Password</label>
                  <input
                    id="patient-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={authInputClassName}
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="patient-otp" className={authLabelClassName}>One-time code</label>
                  <input
                    id="patient-otp"
                    inputMode="numeric"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className={authInputClassName}
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="mt-2 text-xs font-medium text-pacific-teal hover:underline"
                  >
                    {otpSent ? "Resend code" : "Send code"}
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode("password")}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    mode === "password" ? "bg-deep-teal text-pure-white" : "text-deep-teal/60"
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => setMode("otp")}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    mode === "otp" ? "bg-deep-teal text-pure-white" : "text-deep-teal/60"
                  }`}
                >
                  OTP
                </button>
              </div>

              <label className="flex items-center gap-2 text-sm text-deep-teal/70">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded"
                />
                Remember me
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full py-3 text-sm font-medium text-pure-white disabled:opacity-60"
                style={{ backgroundColor: CLINIC_BRANDING.themeColor }}
              >
                {isSubmitting
                  ? mode === "otp"
                    ? "Verifying…"
                    : "Signing in…"
                  : mode === "otp"
                    ? "Verify code"
                    : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-deep-teal/45">
              Staff or provider?{" "}
              <Link href="/login" className="text-pacific-teal hover:underline">
                Main login
              </Link>
            </p>
          </div>
        </div>

        <footer className="border-t border-deep-teal/10 px-4 py-4 text-center text-xs text-deep-teal/45">
          Powered by Frontier Nexus
        </footer>
      </div>
    </div>
  );
}
