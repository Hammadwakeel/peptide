"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  AuthCard,
  AuthShell,
  authInputClassName,
  authLabelClassName,
  authLinkClassName,
} from "@/components/auth/AuthShell";
import { fadeInUp, motion, staggerContainer, transition } from "@/components/motion";
import { resetPassword } from "@/lib/auth/api";
import { clearResetToken, readResetToken } from "@/lib/auth/storage";
import { showError, toast } from "@/lib/toast";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? readResetToken() ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Updating password…");

    try {
      await resetPassword({ token, password, confirmPassword });
      clearResetToken();
      toast.dismiss(toastId);
      toast.success("Password updated. You can sign in now.");
      router.push("/login");
    } catch (error) {
      toast.dismiss(toastId);
      showError(error, "Unable to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthShell background="hands">
        <AuthCard>
          <h1 className="font-sans text-2xl font-light text-deep-teal">
            Invalid reset link
          </h1>
          <p className="mt-3 text-sm text-deep-teal/60">
            This password reset link is missing or expired. Request a new one to
            continue.
          </p>
          <Link href="/forgot-password" className={`mt-6 inline-flex text-sm ${authLinkClassName}`}>
            Request new reset link
          </Link>
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell background="hands">
      <AuthCard>
        <div className="mb-8">
          <span className="font-sans text-xs font-light text-pacific-teal">
            Account recovery
          </span>
          <h1 className="mt-3 font-sans text-2xl font-light tracking-[-0.02em] text-deep-teal sm:text-3xl">
            Reset password
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-deep-teal/60">
            Choose a new password for your account.
          </p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-5"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} transition={transition}>
            <label htmlFor="password" className={authLabelClassName}>
              New password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className={authInputClassName}
            />
          </motion.div>

          <motion.div variants={fadeInUp} transition={transition}>
            <label htmlFor="confirmPassword" className={authLabelClassName}>
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
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
            {isSubmitting ? "Saving…" : "Update password"}
          </motion.button>
        </motion.form>

        <p className="mt-6 text-center text-sm text-deep-teal/60">
          <Link href="/login" className={authLinkClassName}>
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}
