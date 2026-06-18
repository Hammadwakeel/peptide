/** Landing page copy — v1 · clinic owners (B2B) · June 2026 */

export const LANDING_NAV_LINKS = [
  { href: "#platform", label: "Platform", sectionId: "platform" },
  { href: "#catalog", label: "Catalog", sectionId: "catalog" },
  { href: "#safety", label: "Safety", sectionId: "safety" },
  { href: "#compliance", label: "Compliance", sectionId: "compliance" },
] as const;

export const LANDING_CTA = {
  onboard: { label: "Onboard now", href: "/login" },
  onboardShort: { label: "Onboard", href: "/login" },
  browseCatalog: { label: "Browse the catalog", href: "#catalog" },
} as const;

export const LANDING_HERO = {
  headline: "Single platform for all modern clinic needs",
  subhead:
    "FrontierBioMed brings your suppliers, pharmacy, labs, and telemedicine onto one rail, so patients get prescribed and dispensed in one place, and you know every vial was tested before it shipped.",
} as const;

export const LANDING_PROBLEM = {
  label: "The Problem",
  titleLine1: "You prescribe it.",
  titleLine2: "Someone else profits.",
  body:
    "Right now you're juggling a separate login, invoice, and vendor for peptides, compounds, and labs. And the moment a patient leaves, the refill happens somewhere else, you keep the liability, they keep the revenue.",
  painPoints: [
    {
      title: "Fragmented vendors",
      description: "Separate logins, invoices, and suppliers across peptides, compounds, and labs.",
    },
    {
      title: "Leaking refills",
      description: "When a patient leaves, the next fill happens outside your clinic.",
    },
    {
      title: "Split outcomes",
      description: "You carry the clinical risk while someone else captures the economics.",
    },
  ],
} as const;

export const LANDING_PLATFORM = {
  label: "What FrontierBioMed Does",
  title: "One platform that replaces all of it:",
  features: [
    {
      title: "Source everything in one place",
      description:
        "1,000+ pharmacy products, 100+ peptides, 20+ lab supplies.",
    },
    {
      title: "Telemedicine built in",
      description:
        "Patients consult a licensed physician; approved scripts flow straight to fulfillment.",
    },
    {
      title: "Every batch verified",
      description:
        "Multi-panel tested for purity, potency, heavy metals, and sterility before it ships.",
    },
    {
      title: "The reorder stays yours",
      description: "Your retail price, your margin, your patient.",
    },
  ],
} as const;

export const LANDING_HOW_IT_WORKS = {
  label: "How It Works",
  steps: [
    {
      title: "Curate your catalog",
      description: "Choose your products, set your retail pricing.",
    },
    {
      title: "Patients consult & order",
      description:
        "Intake and a physician consult happen on the platform; approved scripts route in automatically.",
    },
    {
      title: "We compound, label, and ship",
      description:
        "Cold-chain, straight to the patient's door. You never touch logistics.",
    },
  ],
} as const;

export const LANDING_VERIFIED_SAFETY = {
  label: "Verified Safety",
  lead: 'Most "COAs" in this space are one cheap panel, or faked.',
  body:
    "We test every batch on a full multi-panel screen, tie every vial back to it, and source only from FDA-registered cGMP facilities. So when a patient asks what's in it, you have a real answer.",
} as const;

export const LANDING_CATALOG = {
  label: "The Catalog",
  categoriesHeading: "Categories",
  categories: ["Peptides", "TRT", "HGH", "GLP-1s", "Hormones", "Compounded Rx"],
  statsHeading: "Stats",
  stats: [
    { value: "1,000+", label: "products" },
    { value: "100+", label: "peptides" },
    { value: "20+", label: "lab supplies" },
  ],
} as const;

export const LANDING_GET_PAID = {
  label: "Get Paid For Every Order",
  title: "Get paid for every order",
  body:
    "You set retail, your margin is calculated automatically, and payouts settle on a clear schedule, all processed in-platform. No third-party processor, no surprise markups.",
  highlights: [
    {
      title: "You set retail",
      description: "Your price on every order, defined by your clinic.",
    },
    {
      title: "Automatic margins",
      description: "Margin is calculated for you, no manual spreadsheets.",
    },
    {
      title: "Clear payout schedule",
      description: "Settlements run in-platform on a predictable cadence.",
    },
  ],
} as const;

export const LANDING_CTA_BAND = {
  headline: "Stop juggling a dozen vendors.",
  subhead:
    "Onboard now and dispense everything from one verified platform.",
} as const;

export const LANDING_COMPLIANCE_FAQ = {
  label: "Compliance + FAQ",
  badges: [
    "Licensed pharmacies",
    "Accredited labs",
    "Licensed physician network",
    "Validated cold-chain",
    "RUO-compliant routing",
  ],
  faqs: [
    {
      question: "RUO vs. pharmacy?",
      answer:
        "Each product routes down its correct legal pathway. Compounded scripts are filled by licensed pharmacies against a valid prescription; RUO materials are supplied strictly under that designation.",
    },
    {
      question: "How do I know a batch is tested?",
      answer:
        "Multi-panel testing before release, with every vial traceable to its batch record.",
    },
    {
      question: "How does telemedicine work?",
      answer:
        "A licensed partner handles intake and the physician consult; approved scripts route into your catalog. No separate tool to run.",
    },
    {
      question: "How do I get paid?",
      answer:
        "Set retail, margin auto-calculated, payouts on a predictable schedule, processed in-platform.",
    },
    {
      question: "How hard is migration?",
      answer:
        "Live in minutes. Most clinics run alongside existing vendors first, then consolidate.",
    },
  ],
} as const;

export const LANDING_FINAL_CTA = {
  headline: "Everything you dispense, on one verified platform.",
} as const;

export const LANDING_FOOTER = {
  tagline:
    "One platform for sourcing, telemedicine, and verified dispensing, built for clinics.",
  contact: {
    email: "info@frontierbiomedlabs.com",
    company: "Frontier BioMed LLC",
    address: "2810 N Church St, Ste 88564, Wilmington, DE 19802",
  },
  legalLinks: [
    { href: "#", label: "Privacy" },
    { href: "#", label: "Terms" },
    { href: "#", label: "RUO Policy" },
  ],
  disclaimer:
    "RUO products are for laboratory research only, not for human or veterinary use. Compounded medications are dispensed only by licensed pharmacies pursuant to a valid prescription. Frontier BioMed is a Delaware LLC.",
} as const;
