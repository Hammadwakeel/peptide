"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  AuthCard,
  AuthShell,
  authInputClassName,
  authLabelClassName,
  authLinkClassName,
} from "@/components/auth/AuthShell";
import { fadeInUp, motion, scaleIn, staggerContainer, transition } from "@/components/motion";
import { acceptClinicInvitation } from "@/lib/onboarding/api";
import type { AcceptClinicInvitationResponse } from "@/lib/onboarding/types";
import { showError } from "@/lib/toast";

export function AcceptClinicInvitationForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AcceptClinicInvitationResponse | null>(null);

  const linkValid = token.length >= 10;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      showError(new Error("Password must be at least 8 characters."));
      return;
    }
    if (password !== confirmPassword) {
      showError(new Error("Passwords do not match."));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await acceptClinicInvitation({
        token,
        password,
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
      });
      setResult(response);
    } catch (error) {
      showError(error, "Unable to accept invitation.");
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
              Clinic team invitation
            </motion.span>
            <motion.h1
              className="mt-3 font-sans text-2xl font-light tracking-[-0.02em] text-deep-teal sm:text-3xl"
              variants={fadeInUp}
              transition={transition}
            >
              {result ? "Welcome to the team" : "Join your clinic"}
            </motion.h1>
            <motion.p
              className="mt-2 text-sm leading-relaxed text-deep-teal/60"
              variants={fadeInUp}
              transition={transition}
            >
              {result
                ? "Your staff account is ready. Sign in to access the provider portal."
                : "Create your password to accept the invitation from your clinic."}
            </motion.p>
          </motion.div>

          {!linkValid ? (
            <div className="rounded-xl border border-coral-blush/40 bg-coral-blush/10 px-4 py-3 text-sm text-deep-teal/75">
              This invitation link is invalid or incomplete. Ask your clinic admin to resend
              the invite.
            </div>
          ) : result ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-pacific-teal/20 bg-pacific-teal/5 px-4 py-4 text-sm text-deep-teal/80">
                <p>
                  You&apos;ve joined{" "}
                  <span className="font-light text-deep-teal">{result.clinic_name}</span> as{" "}
                  <span className="font-light text-deep-teal">
                    {result.access_level.replace(/_/g, " ")}
                  </span>
                  .
                </p>
                <p className="mt-2">{result.message}</p>
              </div>
              <Link
                href="/login"
                className="block w-full rounded-full bg-deep-teal px-6 py-3.5 text-center text-sm font-light text-pure-white transition-all duration-300 hover:bg-pacific-teal"
              >
                Go to provider sign in
              </Link>
            </div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-5"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <motion.div variants={fadeInUp} transition={transition}>
                  <label htmlFor="first-name" className={authLabelClassName}>
                    First name
                  </label>
                  <input
                    id="first-name"
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className={authInputClassName}
                  />
                </motion.div>
                <motion.div variants={fadeInUp} transition={transition}>
                  <label htmlFor="last-name" className={authLabelClassName}>
                    Last name
                  </label>
                  <input
                    id="last-name"
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                    className={authInputClassName}
                  />
                </motion.div>
              </div>

              <motion.div variants={fadeInUp} transition={transition}>
                <label htmlFor="password" className={authLabelClassName}>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
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
                <label htmlFor="confirm-password" className={authLabelClassName}>
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
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
                {isSubmitting ? "Creating account…" : "Accept invitation"}
              </motion.button>
            </motion.form>
          )}

          <motion.p
            className="mt-6 text-center text-sm text-deep-teal/60"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.45 }}
          >
            Already have an account?{" "}
            <Link href="/login" className={authLinkClassName}>
              Sign in.
            </Link>
          </motion.p>
        </AuthCard>
      </motion.div>
    </AuthShell>
  );
}
