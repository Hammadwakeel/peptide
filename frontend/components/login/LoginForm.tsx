"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  fadeInUp,
  motion,
  scaleIn,
  slideInLeft,
  slideInRight,
  staggerContainer,
  transition,
} from "@/components/motion";

const ROLES = [
  { value: "affiliate", label: "Affiliate" },
  { value: "admin", label: "Admin" },
  { value: "patient", label: "Patient" },
  { value: "doctor", label: "Doctor" },
] as const;

type Role = (typeof ROLES)[number]["value"];

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("doctor");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    setIsSubmitting(false);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-pure-white lg:h-full lg:min-h-0 lg:flex-row">
      <motion.div
        className="relative hidden h-full w-1/2 lg:block"
        initial="hidden"
        animate="visible"
        variants={slideInLeft}
        transition={{ ...transition, duration: 0.8 }}
      >
        <Image
          src="/brand/brand image carrying hands.png"
          alt="Frontier Biomed product"
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
      </motion.div>

      <motion.div
        className="relative flex w-full flex-col px-4 py-5 sm:px-6 sm:py-6 lg:h-full lg:w-1/2 lg:px-12 xl:px-16"
        initial="hidden"
        animate="visible"
        variants={slideInRight}
        transition={{ ...transition, duration: 0.8, delay: 0.1 }}
      >
        <div className="flex flex-1 flex-col items-center justify-center py-4 sm:py-0">
          <motion.div
            className="w-full max-w-xl rounded-2xl border border-deep-teal/10 bg-pure-white p-5 shadow-xl shadow-deep-teal/5 sm:rounded-[2rem] sm:p-8 md:p-10"
            variants={scaleIn}
            transition={{ ...transition, delay: 0.2 }}
          >
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
              <motion.h2
                className="mt-3 font-serif text-2xl font-light tracking-[-0.02em] text-deep-teal sm:text-3xl"
                variants={fadeInUp}
                transition={transition}
              >
                Welcome back
              </motion.h2>
              <motion.p
                className="mt-2 text-sm leading-relaxed text-deep-teal/60"
                variants={fadeInUp}
                transition={transition}
              >
                Enter your credentials and select your role to continue.
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
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-deep-teal"
                >
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
                  className="w-full rounded-xl border border-deep-teal/15 bg-pure-white px-4 py-3 text-deep-teal outline-none transition-colors placeholder:text-deep-teal/35 focus:border-pacific-teal focus:ring-2 focus:ring-pacific-teal/20"
                />
              </motion.div>

              <motion.div variants={fadeInUp} transition={transition}>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-deep-teal"
                >
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
                  className="w-full rounded-xl border border-deep-teal/15 bg-pure-white px-4 py-3 text-deep-teal outline-none transition-colors placeholder:text-deep-teal/35 focus:border-pacific-teal focus:ring-2 focus:ring-pacific-teal/20"
                />
              </motion.div>

              <motion.fieldset variants={fadeInUp} transition={transition}>
                <legend className="mb-3 block text-sm font-medium text-deep-teal">
                  Role
                </legend>
                <div className="grid grid-cols-2 gap-2 sm:gap-2">
                  {ROLES.map(({ value, label }) => {
                    const isSelected = role === value;
                    return (
                      <label
                        key={value}
                        className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border px-2 py-2.5 text-xs font-medium transition-all sm:px-3 sm:py-3 sm:text-sm ${
                          isSelected
                            ? "border-pacific-teal bg-pacific-teal/10 text-deep-teal ring-2 ring-pacific-teal/25"
                            : "border-deep-teal/15 text-deep-teal/70 hover:border-deep-teal/25 hover:bg-deep-teal/[0.03]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={value}
                          checked={isSelected}
                          onChange={() => setRole(value)}
                          className="sr-only"
                        />
                        {label}
                      </label>
                    );
                  })}
                </div>
              </motion.fieldset>

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
              className="mt-6 text-center text-sm text-deep-teal/50"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transition, delay: 0.5 }}
            >
              Need access?{" "}
              <Link
                href="/"
                className="font-medium text-pacific-teal transition-colors hover:text-deep-teal"
              >
                Contact your administrator
              </Link>
            </motion.p>

            <motion.div
              className="mt-4 flex justify-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transition, delay: 0.6 }}
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
                Back
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
