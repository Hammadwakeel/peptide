"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AuthCard,
  AuthShell,
  authInputClassName,
  authLabelClassName,
  authLinkClassName,
} from "@/components/auth/AuthShell";
import { RoleToggle } from "@/components/auth/RoleToggle";
import {
  fadeInUp,
  motion,
  scaleIn,
  staggerContainer,
  transition,
} from "@/components/motion";
import { useAuth } from "@/context/AuthProvider";
import { OtpRequiredError } from "@/lib/auth/api";
import { storePendingLogin } from "@/lib/auth/storage";
import type { UserRole } from "@/lib/auth/types";
import { showError, toast } from "@/lib/toast";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("doctor");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      toast.success("Email verified. You can sign in now.");
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Signing in…");

    try {
      await login({ email, password, role, rememberMe });
      toast.dismiss(toastId);
      toast.success("Welcome back.");
    } catch (error) {
      toast.dismiss(toastId);

      if (error instanceof OtpRequiredError) {
        storePendingLogin({ email, password, role, rememberMe });
        toast.info("Verify your email to continue.");
        router.push(`/login/send-otp?email=${encodeURIComponent(error.email)}`);
        return;
      }

      showError(error, "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const redirectTarget = searchParams.get("redirect");

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
              className="font-mono text-xs uppercase tracking-[0.35em] text-pacific-teal"
              variants={fadeInUp}
              transition={transition}
            >
              Sign in
            </motion.span>
            <motion.h1
              className="mt-3 font-serif text-2xl font-light tracking-[-0.02em] text-deep-teal sm:text-3xl"
              variants={fadeInUp}
              transition={transition}
            >
              Welcome back
            </motion.h1>
            <motion.p
              className="mt-2 text-sm leading-relaxed text-deep-teal/60"
              variants={fadeInUp}
              transition={transition}
            >
              Enter your credentials and select your role to continue.
            </motion.p>
            {redirectTarget ? (
              <motion.p
                className="mt-3 rounded-xl border border-pacific-teal/15 bg-pacific-teal/5 px-3 py-2 text-xs text-deep-teal/70"
                variants={fadeInUp}
                transition={transition}
              >
                Sign in to access{" "}
                <span className="font-medium text-deep-teal">{redirectTarget}</span>.
              </motion.p>
            ) : null}
          </motion.div>

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

            <motion.div variants={fadeInUp} transition={transition}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="password" className="text-sm font-medium text-deep-teal">
                  Password
                </label>
                <Link href="/forgot-password" className={`text-sm ${authLinkClassName}`}>
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={authInputClassName}
              />
            </motion.div>

            <motion.div variants={fadeInUp} transition={transition}>
              <RoleToggle value={role} onChange={setRole} />
            </motion.div>

            <motion.label
              variants={fadeInUp}
              transition={transition}
              className="flex cursor-pointer items-center gap-3 text-sm text-deep-teal/75"
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-deep-teal/20 text-pacific-teal focus:ring-pacific-teal/25"
              />
              Remember me
            </motion.label>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              variants={fadeInUp}
              transition={transition}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="mt-2 w-full rounded-full bg-deep-teal px-6 py-3.5 text-sm font-medium text-pure-white transition-all duration-300 hover:bg-pacific-teal disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </motion.button>
          </motion.form>

          <motion.p
            className="mt-6 text-center text-sm text-deep-teal/60"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.45 }}
          >
            Are you a clinic?{" "}
            <Link href="/apply" className={authLinkClassName}>
              Apply here.
            </Link>
          </motion.p>

          <motion.div
            className="mt-4 flex justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.55 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-deep-teal/70 transition-colors hover:text-deep-teal"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="shrink-0"
              >
                <path
                  d="M19 12H5M11 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back to home
            </Link>
          </motion.div>

          <motion.p
            className="mt-6 font-mono text-[11px] leading-relaxed text-deep-teal/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...transition, delay: 0.65 }}
          >
            Practitioner access requires verified NPI credentials. Unauthorized
            access is prohibited.
          </motion.p>
        </AuthCard>
      </motion.div>
    </AuthShell>
  );
}
