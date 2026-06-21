import type { OnboardingRole, RoleOnboardingConfig } from "@/lib/onboarding/types";

export const ROLE_ONBOARDING_CONFIGS: Record<OnboardingRole, RoleOnboardingConfig> = {
  doctor: {
    role: "doctor",
    title: "Clinic launch guide",
    subtitle: "Complete guided missions across your entire clinic portal.",
    funnelTitle: "Clinic launch guide",
    funnelSubtitle: "Ten missions — dashboard, settings, catalog, storefront, patients, orders, and more.",
    steps: [],
  },
  patient: {
    role: "patient",
    title: "Patient setup funnel",
    subtitle: "Secure your account, explore products, and connect with your provider.",
    funnelTitle: "Patient setup funnel",
    funnelSubtitle:
      "Three quick stages before your first order — most patients finish in under 15 minutes.",
    steps: [
      {
        id: "complete-profile",
        stage: 1,
        stageLabel: "Account",
        title: "Complete your profile",
        description: "Add shipping address and payment method for faster checkout.",
        details:
          "Your profile keeps orders and deliveries accurate. Add a default shipping address and a saved payment method so repeat orders take seconds instead of minutes.",
        checklist: [
          "Confirm your name and contact email",
          "Add a default shipping address",
          "Save a payment method (optional for browsing)",
          "Review privacy and notification settings",
        ],
        estimatedMinutes: 5,
        href: "/portal/patient/profile",
        actionLabel: "Update profile",
      },
      {
        id: "browse-products",
        stage: 2,
        stageLabel: "Catalog",
        title: "Browse available products",
        description: "Explore peptides and pharmacy items curated by your clinic.",
        details:
          "Your clinic controls which products appear in your catalog. Browse categories, read descriptions, and add items to your cart when you are ready — no commitment until checkout.",
        checklist: [
          "Open the product catalog",
          "Filter or search for an item of interest",
          "Open a product detail page",
          "Add an item to cart or save for later",
        ],
        estimatedMinutes: 5,
        href: "/portal/patient/products",
        actionLabel: "Browse products",
      },
      {
        id: "message-clinic",
        stage: 3,
        stageLabel: "Connect",
        title: "Message your provider",
        description: "Ask questions or get support through secure in-app chat.",
        details:
          "Use chat for clinical questions, order updates, or billing help. Messages are tied to your clinic relationship and stay in one secure thread.",
        checklist: [
          "Open Messages from the sidebar",
          "Send a hello or test message",
          "Confirm you see your clinic name on the thread",
          "Know where to return for follow-ups",
        ],
        estimatedMinutes: 3,
        href: "/portal/patient/chat",
        actionLabel: "Open chat",
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
