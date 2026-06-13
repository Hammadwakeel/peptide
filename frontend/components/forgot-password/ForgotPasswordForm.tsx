"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AuthCard,
  AuthShell,
  authInputClassName,
  authLabelClassName,
  authLinkClassName,
} from "@/components/auth/AuthShell";
import { fadeInUp, motion, staggerContainer, transition } from "@/components/motion";
import { requestPasswordReset } from "@/lib/auth/api";
import { storeResetToken } from "@/lib/auth/storage";
import { showError, toast } from "@/lib/toast";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Sending reset link…");

    try {
      const { resetToken } = await requestPasswordReset({ email });
      storeResetToken(resetToken);
      toast.dismiss(toastId);
      toast.success("Reset link sent.");
      router.push(`/forgot-password/confirmation?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.dismiss(toastId);
      showError(error, "Unable to send reset link.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell background="hands">
      <AuthCard>
        <div className="mb-8">
          <span className="font-sans text-xs font-light text-pacific-teal">
            Account recovery
          </span>
          <h1 className="mt-3 font-sans text-2xl font-light tracking-[-0.02em] text-deep-teal sm:text-3xl">
            Forgot password
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-deep-teal/60">
            Enter the email associated with your account and we&apos;ll send reset
            instructions.
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
            <label htmlFor="email" className={authLabelClassName}>
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {isSubmitting ? "Sending…" : "Send reset link"}
          </motion.button>
        </motion.form>

        <p className="mt-6 text-center text-sm text-deep-teal/60">
          Remember your password?{" "}
          <Link href="/login" className={authLinkClassName}>
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}
