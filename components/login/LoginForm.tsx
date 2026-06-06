"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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

    // Placeholder — wire to auth API when available
    await new Promise((resolve) => setTimeout(resolve, 600));

    setIsSubmitting(false);
  }

  return (
    <div className="flex h-full bg-pure-white">
      {/* Left — brand image */}
      <div className="relative hidden h-full w-1/2 lg:block">
        <Image
          src="/brand/brand image carrying hands.png"
          alt="Frontier Biomed product"
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
      </div>

      {/* Right — login form */}
      <div className="relative flex h-full w-full flex-col px-6 py-6 lg:w-1/2 lg:px-12 xl:px-16">
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="w-full max-w-xl rounded-[2rem] border border-deep-teal/10 bg-pure-white p-8 shadow-xl shadow-deep-teal/5 md:p-10">
          <div className="mb-8">
            <span className="font-mono text-xs uppercase tracking-[0.35em] text-pacific-teal">
              Sign in
            </span>
            <h2 className="mt-3 font-serif text-3xl font-light tracking-[-0.02em] text-deep-teal">
              Welcome back
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-deep-teal/60">
              Enter your credentials and select your role to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
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
            </div>

            <div>
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
            </div>

            <fieldset>
              <legend className="mb-3 block text-sm font-medium text-deep-teal">
                Role
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(({ value, label }) => {
                  const isSelected = role === value;
                  return (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-center justify-center rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
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
            </fieldset>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-full bg-deep-teal px-6 py-3.5 text-sm font-medium text-pure-white transition-all duration-300 hover:bg-pacific-teal disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-deep-teal/50">
            Need access?{" "}
            <Link
              href="/"
              className="font-medium text-pacific-teal transition-colors hover:text-deep-teal"
            >
              Contact your administrator
            </Link>
          </p>

          <div className="mt-4 flex justify-center">
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
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
