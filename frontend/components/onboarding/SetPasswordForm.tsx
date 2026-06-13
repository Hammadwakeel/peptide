"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AuthCard,
  AuthShell,
  authInputClassName,
  authLabelClassName,
  authLinkClassName,
} from "@/components/auth/AuthShell";
import { fadeInUp, motion, scaleIn, staggerContainer, transition } from "@/components/motion";
import { checkSetPasswordToken, setPassword as submitSetPassword } from "@/lib/onboarding/api";
import { loginPathForBackendRole } from "@/lib/onboarding/configs";
import type { CheckSetPasswordResponse } from "@/lib/onboarding/types";
import { showError, toast } from "@/lib/toast";

export function SetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [tokenInfo, setTokenInfo] = useState<CheckSetPasswordResponse | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [loginHref, setLoginHref] = useState("/login");

  useEffect(() => {
    if (token.length < 16) {
      setIsChecking(false);
      return;
    }

    let cancelled = false;
    void checkSetPasswordToken(token)
      .then((result) => {
        if (!cancelled) setTokenInfo(result);
      })
      .catch((error) => {
        if (!cancelled) {
          setTokenInfo({
            status: false,
            token_status: "invalid",
            message: error instanceof Error ? error.message : "Unable to validate link.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setIsChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
    const toastId = toast.loading("Setting password…");

    try {
      const result = await submitSetPassword({ token, new_password: password });
      toast.dismiss(toastId);
      toast.success(result.message);
      setLoginHref(loginPathForBackendRole(result.user.role));
      setIsComplete(true);
    } catch (error) {
      toast.dismiss(toastId);
      showError(error, "Unable to set password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token || token.length < 16) {
    return (
      <AuthShell background="hands">
        <AuthCard>
          <h1 className="font-sans text-2xl font-light text-deep-teal">Invalid link</h1>
          <p className="mt-3 text-sm text-deep-teal/60">
            This password setup link is missing or incomplete. Use the link from your
            invitation email.
          </p>
        </AuthCard>
      </AuthShell>
    );
  }

  if (isChecking) {
    return (
      <AuthShell background="hands">
        <AuthCard>
          <p className="text-sm text-deep-teal/60">Validating your link…</p>
        </AuthCard>
      </AuthShell>
    );
  }

  if (!tokenInfo?.status || tokenInfo.token_status !== "valid") {
    const loginUrl =
      tokenInfo?.token_status === "already_used"
        ? tokenInfo.login_url ?? "/login"
        : "/login";

    return (
      <AuthShell background="hands">
        <AuthCard>
          <h1 className="font-sans text-2xl font-light text-deep-teal">
            {tokenInfo?.token_status === "already_used"
              ? "Password already set"
              : "Link unavailable"}
          </h1>
          <p className="mt-3 text-sm text-deep-teal/60">{tokenInfo?.message}</p>
          {tokenInfo?.email ? (
            <p className="mt-2 text-sm text-deep-teal/70">
              Account: <span className="font-light">{tokenInfo.email}</span>
            </p>
          ) : null}
          <Link
            href={loginUrl}
            className={`mt-6 inline-flex text-sm ${authLinkClassName}`}
          >
            Go to sign in
          </Link>
        </AuthCard>
      </AuthShell>
    );
  }

  if (isComplete) {
    return (
      <AuthShell background="hands">
        <AuthCard>
          <h1 className="font-sans text-2xl font-light text-deep-teal">You&apos;re all set</h1>
          <p className="mt-3 text-sm text-deep-teal/60">
            Your password has been created. Sign in to continue.
          </p>
          <Link
            href={loginHref}
            className="mt-6 block w-full rounded-full bg-deep-teal px-6 py-3.5 text-center text-sm font-light text-pure-white transition-all duration-300 hover:bg-pacific-teal"
          >
            Go to sign in
          </Link>
        </AuthCard>
      </AuthShell>
    );
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
              Account setup
            </motion.span>
            <motion.h1
              className="mt-3 font-sans text-2xl font-light tracking-[-0.02em] text-deep-teal sm:text-3xl"
              variants={fadeInUp}
              transition={transition}
            >
              Create your password
            </motion.h1>
            <motion.p
              className="mt-2 text-sm leading-relaxed text-deep-teal/60"
              variants={fadeInUp}
              transition={transition}
            >
              {tokenInfo.email ? (
                <>
                  Set a password for{" "}
                  <span className="font-light text-deep-teal">{tokenInfo.email}</span>.
                </>
              ) : (
                "Choose a secure password for your new account."
              )}
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
              {isSubmitting ? "Saving…" : "Set password"}
            </motion.button>
          </motion.form>
        </AuthCard>
      </motion.div>
    </AuthShell>
  );
}
