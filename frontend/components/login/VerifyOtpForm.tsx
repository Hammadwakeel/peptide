"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AuthCard,
  AuthShell,
  authInputClassName,
  authLabelClassName,
  authLinkClassName,
} from "@/components/auth/AuthShell";
import { useAuth } from "@/context/AuthProvider";
import { fadeInUp, motion, scaleIn, staggerContainer, transition } from "@/components/motion";
import { sendOtp, verifyOtp } from "@/lib/auth/api";
import { loginPathForRole } from "@/lib/auth/constants";
import {
  clearPendingLogin,
  readPendingLogin,
} from "@/lib/auth/storage";
import type { UserRole } from "@/lib/auth/types";
import { showError, toast } from "@/lib/toast";

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { establishSession } = useAuth();
  const pendingLogin = readPendingLogin();
  const email = searchParams.get("email") ?? pendingLogin?.email ?? "";
  const requestedRole = (pendingLogin?.role ??
    searchParams.get("role")) as UserRole | undefined;
  const backToLoginHref =
    requestedRole === "admin" ||
    requestedRole === "affiliate" ||
    requestedRole === "patient" ||
    requestedRole === "doctor"
      ? loginPathForRole(requestedRole)
      : "/login";
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const autoSendStarted = useRef(false);

  async function handleResend() {
    if (!email.trim()) {
      toast.error("Missing email address.");
      return;
    }

    setIsResending(true);
    const toastId = toast.loading("Sending verification code…");

    try {
      const result = await sendOtp(email);
      toast.dismiss(toastId);
      toast.success(result.message);
    } catch (error) {
      toast.dismiss(toastId);
      showError(error, "Unable to send verification code.");
    } finally {
      setIsResending(false);
    }
  }

  useEffect(() => {
    if (!email.trim() || autoSendStarted.current) return;
    autoSendStarted.current = true;
    void handleResend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Missing email address.");
      router.push("/login");
      return;
    }

    if (otp.trim().length !== 6) {
      toast.error("Enter the 6-digit verification code.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Verifying code…");

    try {
      const rememberMe = pendingLogin?.rememberMe ?? false;
      const { session, message } = await verifyOtp(email, otp, requestedRole);
      clearPendingLogin();
      toast.dismiss(toastId);
      toast.success(message || "Signed in successfully.");
      establishSession(session, rememberMe);
    } catch (error) {
      toast.dismiss(toastId);
      showError(error, "Invalid or expired verification code.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell background="hands">
      <motion.div variants={scaleIn} transition={{ ...transition, delay: 0.15 }}>
        <AuthCard>
          <motion.div
            className="mb-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.span
              className="font-sans text-xs font-light text-pacific-teal"
              variants={fadeInUp}
              transition={transition}
            >
              Verify email
            </motion.span>
            <motion.h1
              className="mt-3 font-sans text-2xl font-light tracking-[-0.02em] text-deep-teal sm:text-3xl"
              variants={fadeInUp}
              transition={transition}
            >
              Enter verification code
            </motion.h1>
            <motion.p
              className="mt-2 text-sm leading-relaxed text-deep-teal/60"
              variants={fadeInUp}
              transition={transition}
            >
              Enter the 6-digit code sent to{" "}
              <span className="font-light text-deep-teal">{email || "your email"}</span>.
            </motion.p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} transition={transition}>
              <label htmlFor="otp-code" className={authLabelClassName}>
                Verification code
              </label>
              <input
                id="otp-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className={`${authInputClassName} text-center font-sans text-lg font-light tracking-[0.35em]`}
              />
            </motion.div>

            <motion.button
              type="button"
              onClick={() => void handleResend()}
              disabled={isResending}
              variants={fadeInUp}
              transition={transition}
              className="text-sm font-light text-pacific-teal hover:underline disabled:opacity-60"
            >
              {isResending ? "Resending…" : "Resend code"}
            </motion.button>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              variants={fadeInUp}
              transition={transition}
              className="w-full rounded-full bg-deep-teal px-6 py-3.5 text-sm font-light text-pure-white transition-all duration-300 hover:bg-pacific-teal disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Verifying…" : "Verify and continue"}
            </motion.button>
          </motion.form>

          <motion.p
            className="mt-6 text-center text-sm text-deep-teal/60"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.45 }}
          >
            Wrong email?{" "}
            <Link href={backToLoginHref} className={authLinkClassName}>
              Back to sign in
            </Link>
          </motion.p>
        </AuthCard>
      </motion.div>
    </AuthShell>
  );
}
