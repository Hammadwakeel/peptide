import type { UserRole } from "@/lib/auth/types";

export type DemoAccount = {
  email: string;
  role: UserRole;
  label: string;
};

/** Frontend-only demo account allowlist — replace with real auth API later. */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "doctor@demo.frontierbiomed.com",
    role: "doctor",
    label: "Provider portal",
  },
  {
    email: "patient@demo.frontierbiomed.com",
    role: "patient",
    label: "Patient portal",
  },
  {
    email: "admin@demo.frontierbiomed.com",
    role: "admin",
    label: "Admin portal",
  },
  {
    email: "affiliate@demo.frontierbiomed.com",
    role: "affiliate",
    label: "Affiliate portal",
  },
];

export function findDemoAccountByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return DEMO_ACCOUNTS.find((account) => account.email === normalizedEmail);
}
