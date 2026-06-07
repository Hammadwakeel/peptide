import type { UserRole } from "@/lib/auth/types";

export type DemoAccount = {
  email: string;
  password: string;
  role: UserRole;
  label: string;
};

/** Frontend-only demo accounts — replace with real auth API later. */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "doctor@demo.frontierbiomed.com",
    password: "Demo2026!",
    role: "doctor",
    label: "Provider portal (settings, users, help)",
  },
  {
    email: "patient@demo.frontierbiomed.com",
    password: "Demo2026!",
    role: "patient",
    label: "Patient portal",
  },
  {
    email: "admin@demo.frontierbiomed.com",
    password: "Demo2026!",
    role: "admin",
    label: "Admin portal (products, import)",
  },
  {
    email: "affiliate@demo.frontierbiomed.com",
    password: "Demo2026!",
    role: "affiliate",
    label: "Affiliate portal",
  },
];

export function findDemoAccount(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return DEMO_ACCOUNTS.find(
    (account) =>
      account.email === normalizedEmail && account.password === password,
  );
}

export const PRIMARY_DEMO_ACCOUNT = DEMO_ACCOUNTS[0];
