import type { RoleOnboardingConfig } from "@/lib/onboarding/types";

export const ROLE_ONBOARDING_CONFIGS: Record<
  "admin" | "doctor" | "patient" | "affiliate",
  RoleOnboardingConfig
> = {
  admin: {
    role: "admin",
    title: "Admin setup guide",
    subtitle: "Complete these steps to run the platform smoothly.",
    steps: [
      {
        id: "review-applications",
        title: "Review clinic applications",
        description: "Approve or request more info from new provider applicants.",
        href: "/portal/admin/approvals",
      },
      {
        id: "manage-catalog",
        title: "Manage product catalog",
        description: "Add inventory, categories, and stock levels for clinics.",
        href: "/portal/admin/catalog",
      },
      {
        id: "manage-affiliates",
        title: "Create affiliate partners",
        description: "Onboard main affiliates who refer clinics to the platform.",
        href: "/portal/admin/affiliates",
      },
      {
        id: "platform-settings",
        title: "Configure platform settings",
        description: "Set fees, policies, and operational defaults.",
        href: "/portal/admin/settings",
      },
    ],
  },
  doctor: {
    role: "doctor",
    title: "Clinic setup guide",
    subtitle: "Get your practice ready to serve patients on Frontier Biomed.",
    steps: [
      {
        id: "clinic-settings",
        title: "Complete clinic profile",
        description: "Add branding, contact details, and banking information.",
        href: "/portal/doctor/settings",
      },
      {
        id: "my-store",
        title: "Configure your storefront",
        description: "Choose products and pricing for your patient catalog.",
        href: "/portal/doctor/my-store",
      },
      {
        id: "invite-patients",
        title: "Invite your first patient",
        description: "Send invitations so patients can browse and order.",
        href: "/portal/doctor/customers",
      },
      {
        id: "invite-staff",
        title: "Add team members",
        description: "Invite staff or associate providers to your organization.",
        href: "/portal/doctor/users",
      },
    ],
  },
  patient: {
    role: "patient",
    title: "Patient setup guide",
    subtitle: "A few quick steps before you start ordering.",
    steps: [
      {
        id: "complete-profile",
        title: "Complete your profile",
        description: "Add shipping address and payment details.",
        href: "/portal/patient/profile",
      },
      {
        id: "browse-products",
        title: "Browse available products",
        description: "Explore peptides and pharmacy items from your clinic.",
        href: "/portal/patient/products",
      },
      {
        id: "message-clinic",
        title: "Message your provider",
        description: "Ask questions or get support through secure chat.",
        href: "/portal/patient/chat",
      },
    ],
  },
  affiliate: {
    role: "affiliate",
    title: "Affiliate setup guide",
    subtitle: "Start referring clinics and growing your network.",
    steps: [
      {
        id: "invite-clinic",
        title: "Invite your first clinic",
        description: "Share your referral link or send a direct clinic invitation.",
        href: "/portal/affiliate/clinics/invite",
      },
      {
        id: "track-referrals",
        title: "Track clinic referrals",
        description: "Monitor applications and onboarding status.",
        href: "/portal/affiliate/referrals",
      },
      {
        id: "sub-affiliates",
        title: "Grow your network",
        description: "Invite sub-affiliates to expand your referral reach.",
        href: "/portal/affiliate/sub-affiliates",
      },
    ],
  },
};

export function loginPathForBackendRole(role: string): string {
  const normalized = role.toLowerCase();
  if (normalized === "admin" || normalized === "super_admin") return "/login/admin";
  if (normalized === "affiliate") return "/login/affiliate";
  if (normalized === "patient") return "/login?role=patient";
  return "/login";
}
