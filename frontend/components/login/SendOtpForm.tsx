"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";
import {
  AuthCard,
  AuthShell,
  authInputClassName,
  authLabelClassName,
  authLinkClassName,
} from "@/components/auth/AuthShell";
import { fadeInUp, motion, scaleIn, staggerContainer, transition } from "@/components/motion";
import { sendOtp } from "@/lib/auth/api";
import { readPendingLogin } from "@/lib/auth/storage";
import { showError, toast } from "@/lib/toast";

export function SendOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingLogin = readPendingLogin();
  const initialEmail = searchParams.get("email") ?? pendingLogin?.email ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const autoSendStarted = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSendOtp(targetEmail = email) {
    const normalizedEmail = targetEmail.trim();
    if (!normalizedEmail) {
      toast.error("Enter your email address.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Sending verification code…");

    try {
      const result = await sendOtp(normalizedEmail);
      toast.dismiss(toastId);
      toast.success(result.message);
      startTransition(() => {
        router.push(`/login/verify-otp?email=${encodeURIComponent(result.email)}`);
      });
    } catch (error) {
      toast.dismiss(toastId);
      showError(error, "Unable to send verification code.");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!mounted || !initialEmail || autoSendStarted.current) return;
    autoSendStarted.current = true;
    void handleSendOtp(initialEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, initialEmail]);

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
              Send verification code
            </motion.h1>
            <motion.p
              className="mt-2 text-sm leading-relaxed text-deep-teal/60"
              variants={fadeInUp}
              transition={transition}
            >
              We&apos;ll email a 6-digit code to verify your account before you can sign in.
            </motion.p>
          </motion.div>

          <motion.form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSendOtp();
            }}
            className="space-y-5"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} transition={transition}>
              <label htmlFor="otp-email" className={authLabelClassName}>
                Email
              </label>
              <input
                id="otp-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@clinic.com"
                className={authInputClassName}
              />
            </motion.div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              variants={fadeInUp}
              transition={transition}
              className="w-full rounded-full bg-deep-teal px-6 py-3.5 text-sm font-light text-pure-white transition-all duration-300 hover:bg-pacific-teal disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sending code…" : "Send verification code"}
            </motion.button>
          </motion.form>

          <motion.p
            className="mt-6 text-center text-sm text-deep-teal/60"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.45 }}
          >
            Already verified?{" "}
            <Link href="/login" className={authLinkClassName}>
              Back to sign in
            </Link>
          </motion.p>
        </AuthCard>
      </motion.div>
    </AuthShell>
  );
}
