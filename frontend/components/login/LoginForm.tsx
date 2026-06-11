"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

type LoginFormProps = {
  fixedRole?: Extract<UserRole, "admin" | "affiliate" | "doctor">;
};

const ROLE_HEADINGS: Record<
  Extract<UserRole, "admin" | "affiliate" | "doctor">,
  { title: string; description: string }
> = {
  admin: {
    title: "Admin sign in",
    description: "Sign in to manage platform inventory, clinics, and users.",
  },
  affiliate: {
    title: "Affiliate sign in",
    description: "Sign in to manage referrals, commissions, and sub-affiliates.",
  },
  doctor: {
    title: "Welcome back",
    description: "Sign in as a doctor or patient to access your portal.",
  },
};

const ROLE_QUERY_VALUES = ["admin", "affiliate", "doctor", "patient"] as const;

function roleFromPathname(pathname: string): UserRole | undefined {
  if (pathname === "/login/admin") return "admin";
  if (pathname === "/login/affiliate") return "affiliate";
  return undefined;
}

function roleFromSearchParams(
  searchParams: ReturnType<typeof useSearchParams>,
): UserRole | undefined {
  const queryRole = searchParams.get("role");
  if (queryRole && ROLE_QUERY_VALUES.includes(queryRole as (typeof ROLE_QUERY_VALUES)[number])) {
    return queryRole as UserRole;
  }
  return undefined;
}

export function LoginForm({ fixedRole }: LoginFormProps = {}) {
  const { login } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resolvedFixedRole = fixedRole ?? roleFromPathname(pathname);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(
    () => resolvedFixedRole ?? roleFromSearchParams(searchParams) ?? "doctor",
  );
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      toast.success("Email verified. You can sign in now.");
    }

    if (resolvedFixedRole) {
      setRole(resolvedFixedRole);
      return;
    }

    const queryRole = roleFromSearchParams(searchParams);
    if (queryRole) {
      setRole(queryRole);
    }
  }, [searchParams, resolvedFixedRole]);

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
        toast.info("Enter the verification code sent to your email.");
        const verifyUrl = new URL("/login/verify-otp", window.location.origin);
        verifyUrl.searchParams.set("email", error.email);
        verifyUrl.searchParams.set("role", role);
        router.push(`${verifyUrl.pathname}${verifyUrl.search}`);
        return;
      }

      showError(error, "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const redirectTarget = searchParams.get("redirect");
  const heading = ROLE_HEADINGS[resolvedFixedRole ?? "doctor"];
  const roleToggleRoles = resolvedFixedRole ? [resolvedFixedRole] : (["doctor", "patient"] as UserRole[]);

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
              {heading.title}
            </motion.h1>
            <motion.p
              className="mt-2 text-sm leading-relaxed text-deep-teal/60"
              variants={fadeInUp}
              transition={transition}
            >
              {heading.description}
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
              <label htmlFor="password" className={authLabelClassName}>
                Password
              </label>
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
              <RoleToggle
                value={role}
                onChange={resolvedFixedRole ? () => {} : setRole}
                roles={roleToggleRoles}
              />
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

          {resolvedFixedRole !== "admin" && resolvedFixedRole !== "affiliate" ? (
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
          ) : null}

          <motion.div
            className={`flex justify-center ${resolvedFixedRole === "admin" || resolvedFixedRole === "affiliate" ? "mt-6" : "mt-4"}`}
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
