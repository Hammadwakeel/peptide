import type { RoleOnboardingConfig } from "@/lib/onboarding/types";

export const ROLE_ONBOARDING_CONFIGS: Record<
  "admin" | "doctor" | "patient" | "affiliate",
  RoleOnboardingConfig
> = {
  admin: {
    role: "admin",
    title: "Platform launch funnel",
    subtitle: "Move from first login to a fully operational Frontier Biomed admin workspace.",
    funnelTitle: "Admin launch funnel",
    funnelSubtitle:
      "Four stages to review applicants, configure catalog and partners, and lock in platform defaults.",
    steps: [
      {
        id: "review-applications",
        stage: 1,
        stageLabel: "Intake",
        title: "Review clinic applications",
        description: "Triage new provider applicants and move qualified clinics into onboarding.",
        details:
          "Open the approval queue daily. Verify NPI, DEA, and state license documents before approving. Use “Request more info” when documentation is incomplete so applicants can resubmit without restarting.",
        checklist: [
          "Open the pending applications queue",
          "Verify licenses and compliance documents",
          "Approve, reject, or request more information",
          "Leave an internal note for complex cases",
        ],
        estimatedMinutes: 15,
        href: "/portal/admin/approvals",
        actionLabel: "Open approval queue",
      },
      {
        id: "manage-catalog",
        stage: 2,
        stageLabel: "Catalog",
        title: "Manage product catalog",
        description: "Publish SKUs, categories, and stock levels clinics can sell to patients.",
        details:
          "A complete catalog ensures every approved clinic sees consistent products and pricing. Import bulk inventory when available, then spot-check high-volume peptides and cold-chain items.",
        checklist: [
          "Confirm active product categories",
          "Set or import SKU inventory levels",
          "Review pricing and margin defaults",
          "Flag out-of-stock or restricted items",
        ],
        estimatedMinutes: 20,
        href: "/portal/admin/catalog",
        actionLabel: "Manage catalog",
      },
      {
        id: "manage-affiliates",
        stage: 3,
        stageLabel: "Partners",
        title: "Create affiliate partners",
        description: "Onboard main affiliates who refer clinics to the platform.",
        details:
          "Affiliates drive clinic acquisition. Create main affiliate accounts, confirm payout details, and share referral links. Sub-affiliate networks can be configured after the main partner is active.",
        checklist: [
          "Create or verify main affiliate accounts",
          "Confirm referral codes and commission tiers",
          "Send welcome instructions to new partners",
          "Review first referral submissions",
        ],
        estimatedMinutes: 10,
        href: "/portal/admin/affiliates",
        actionLabel: "Manage affiliates",
      },
      {
        id: "platform-settings",
        stage: 4,
        stageLabel: "Launch",
        title: "Configure platform settings",
        description: "Set fees, policies, and operational defaults before clinics go live.",
        details:
          "Platform settings affect every clinic and patient transaction. Double-check fee schedules, notification policies, and compliance toggles before marking this funnel complete.",
        checklist: [
          "Review platform fee and payout settings",
          "Confirm email and alert policies",
          "Validate compliance and audit options",
          "Save and document any policy changes",
        ],
        estimatedMinutes: 12,
        href: "/portal/admin/settings",
        actionLabel: "Open settings",
      },
    ],
  },
  doctor: {
    role: "doctor",
    title: "Clinic launch funnel",
    subtitle: "Configure your practice, storefront, and first patient relationships on Frontier.",
    funnelTitle: "Clinic launch funnel",
    funnelSubtitle:
      "Profile → storefront → first patients → team. Complete each stage before inviting volume.",
    steps: [
      {
        id: "clinic-settings",
        stage: 1,
        stageLabel: "Foundation",
        title: "Complete clinic profile",
        description: "Add branding, contact details, licenses, and banking for payouts.",
        details:
          "Your clinic profile powers invoices, patient communications, and compliance exports. Upload logo assets, confirm legal entity details, and connect banking so orders can settle without delay.",
        checklist: [
          "Add clinic name, logo, and contact details",
          "Confirm NPI, DEA, and state license on file",
          "Connect banking for clinic payouts",
          "Review notification preferences",
        ],
        estimatedMinutes: 12,
        href: "/portal/doctor/settings",
        actionLabel: "Complete profile",
      },
      {
        id: "my-store",
        stage: 2,
        stageLabel: "Storefront",
        title: "Configure your storefront",
        description: "Choose catalog products and pricing patients will see.",
        details:
          "Your storefront is the patient-facing catalog. Enable products your practice offers, adjust markups where allowed, and preview how listings appear before going live.",
        checklist: [
          "Browse the master product catalog",
          "Enable products for your clinic store",
          "Set patient-facing pricing where applicable",
          "Preview the storefront layout",
        ],
        estimatedMinutes: 15,
        href: "/portal/doctor/my-store",
        actionLabel: "Configure store",
      },
      {
        id: "invite-patients",
        stage: 3,
        stageLabel: "Patients",
        title: "Invite your first patient",
        description: "Send invitations so patients can browse, order, and pay securely.",
        details:
          "Patient invitations link accounts to your clinic. Send a test invite to yourself or staff first, then onboard your first real patient and confirm they can browse products and message your team.",
        checklist: [
          "Open the patients directory",
          "Send at least one patient invitation",
          "Confirm the invite email delivers",
          "Verify the patient can sign in and browse",
        ],
        estimatedMinutes: 8,
        href: "/portal/doctor/customers",
        actionLabel: "Invite patients",
      },
      {
        id: "invite-staff",
        stage: 4,
        stageLabel: "Team",
        title: "Add team members",
        description: "Invite staff or associate providers to help manage orders and chat.",
        details:
          "Delegate day-to-day work by inviting team members with appropriate access. Staff can help with patient requests, inventory checks, and messaging while you retain oversight.",
        checklist: [
          "Decide who needs portal access",
          "Send staff or associate invitations",
          "Confirm new users can sign in",
          "Assign responsibilities (orders, chat, inventory)",
        ],
        estimatedMinutes: 10,
        href: "/portal/doctor/users",
        actionLabel: "Manage team",
      },
    ],
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
  affiliate: {
    role: "affiliate",
    title: "Affiliate growth funnel",
    subtitle: "Refer clinics, track pipeline, and expand your partner network.",
    funnelTitle: "Affiliate growth funnel",
    funnelSubtitle:
      "Refer → track → scale. Each stage builds recurring referral revenue.",
    steps: [
      {
        id: "invite-clinic",
        stage: 1,
        stageLabel: "Refer",
        title: "Invite your first clinic",
        description: "Share your referral link or send a direct clinic invitation.",
        details:
          "Your referral link attributes applications to your account. Share it with clinic owners or send a direct invite when you have their contact details. Follow up within 48 hours for best conversion.",
        checklist: [
          "Copy your personal referral link",
          "Send one clinic invitation or share the link",
          "Confirm the clinic received the invite",
          "Note the expected application timeline",
        ],
        estimatedMinutes: 8,
        href: "/portal/affiliate/clinics/invite",
        actionLabel: "Invite a clinic",
      },
      {
        id: "track-referrals",
        stage: 2,
        stageLabel: "Pipeline",
        title: "Track clinic referrals",
        description: "Monitor applications, approvals, and onboarding status.",
        details:
          "The referrals dashboard shows every clinic in your pipeline. Check status weekly, nudge stalled applications, and celebrate approvals to keep momentum.",
        checklist: [
          "Open the referrals dashboard",
          "Review pending vs. approved clinics",
          "Follow up on stalled applications",
          "Export or note metrics for your records",
        ],
        estimatedMinutes: 6,
        href: "/portal/affiliate/referrals",
        actionLabel: "View referrals",
      },
      {
        id: "sub-affiliates",
        stage: 3,
        stageLabel: "Scale",
        title: "Grow your network",
        description: "Invite sub-affiliates to expand referral reach and commissions.",
        details:
          "Sub-affiliates extend your network without manual outreach on every lead. Invite trusted partners, set expectations, and review their referral activity from your dashboard.",
        checklist: [
          "Identify partners to invite as sub-affiliates",
          "Send sub-affiliate invitations",
          "Confirm they can access their portal",
          "Review combined referral performance",
        ],
        estimatedMinutes: 10,
        href: "/portal/affiliate/sub-affiliates",
        actionLabel: "Manage sub-affiliates",
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
