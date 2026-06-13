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
import { acceptInvitation, type AcceptInvitationResponse } from "@/lib/patient/api";
import { showError } from "@/lib/toast";

export function AcceptInvitationForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const doctorId = searchParams.get("doctor_id") ?? "";

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AcceptInvitationResponse | null>(null);

  const linkValid = token.length >= 10 && doctorId.length > 0;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await acceptInvitation({ email, token, doctor_id: doctorId });
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
              Patient invitation
            </motion.span>
            <motion.h1
              className="mt-3 font-sans text-2xl font-light tracking-[-0.02em] text-deep-teal sm:text-3xl"
              variants={fadeInUp}
              transition={transition}
            >
              {result ? "You're all set" : "Accept your invitation"}
            </motion.h1>
            <motion.p
              className="mt-2 text-sm leading-relaxed text-deep-teal/60"
              variants={fadeInUp}
              transition={transition}
            >
              {result
                ? "Your account has been created."
                : "Confirm the email your clinic used to invite you. We'll create your account and send your password."}
            </motion.p>
          </motion.div>

          {!linkValid ? (
            <div className="rounded-xl border border-coral-blush/40 bg-coral-blush/10 px-4 py-3 text-sm text-deep-teal/75">
              This invitation link is invalid or incomplete. Please use the link from your
              invitation email, or contact your clinic for a new one.
            </div>
          ) : result ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-pacific-teal/20 bg-pacific-teal/5 px-4 py-4 text-sm text-deep-teal/80">
                <p>
                  Welcome,{" "}
                  <span className="font-light text-deep-teal">
                    {result.patient.first_name} {result.patient.last_name}
                  </span>
                  . Your account at{" "}
                  <span className="font-light text-deep-teal">
                    {result.patient.clinic_name}
                  </span>{" "}
                  is ready.
                </p>
                <p className="mt-2">{result.message}</p>
              </div>
              <Link
                href="/login?role=patient"
                className="block w-full rounded-full bg-deep-teal px-6 py-3.5 text-center text-sm font-light text-pure-white transition-all duration-300 hover:bg-pacific-teal"
              >
                Go to patient sign in
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
                  placeholder="you@email.com"
                  className={authInputClassName}
                />
              </motion.div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                variants={fadeInUp}
                transition={transition}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="mt-2 w-full rounded-full bg-deep-teal px-6 py-3.5 text-sm font-light text-pure-white transition-all duration-300 hover:bg-pacific-teal disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Accepting…" : "Accept invitation"}
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
            <Link href="/login?role=patient" className={authLinkClassName}>
              Sign in.
            </Link>
          </motion.p>
        </AuthCard>
      </motion.div>
    </AuthShell>
  );
}
