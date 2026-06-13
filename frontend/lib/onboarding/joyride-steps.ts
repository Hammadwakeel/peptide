import type { BeforeHook, Step } from "react-joyride";
import type { Options } from "react-joyride";
import { BRAND_COLORS, BRAND_RGBA } from "@/lib/brand/colors";
import { ROLE_ONBOARDING_CONFIGS } from "@/lib/onboarding/configs";
import { navTourSelector } from "@/lib/onboarding/tour-targets";
import type { UserRole } from "@/lib/auth/types";

export const JOYRIDE_TOUR_OPTIONS: Partial<Options> = {
  primaryColor: BRAND_COLORS.pacificTeal,
  backgroundColor: BRAND_COLORS.pureWhite,
  textColor: BRAND_COLORS.deepTeal,
  arrowColor: BRAND_COLORS.pureWhite,
  overlayColor: BRAND_RGBA.deepTealOverlay,
  zIndex: 10050,
  showProgress: false,
  skipBeacon: true,
  spotlightPadding: 10,
  spotlightRadius: 14,
  offset: 14,
  width: 352,
  buttons: ["back", "skip", "primary"],
  closeButtonAction: "skip",
  scrollDuration: 350,
  scrollOffset: 80,
};

export const JOYRIDE_FLOATING_OPTIONS = {
  strategy: "fixed" as const,
  flipOptions: {
    padding: 16,
    rootBoundary: "viewport" as const,
    crossAxis: true,
  },
  shiftOptions: {
    padding: 16,
    rootBoundary: "viewport" as const,
    crossAxis: true,
  },
};

export const JOYRIDE_LOCALE = {
  back: "Back",
  close: "Close",
  last: "Done",
  next: "Next",
  nextWithProgress: "Next ({current} of {total})",
  skip: "Skip tour",
};

type JoyrideStepOptions = {
  filterStepIds?: string[];
  /** Include the checklist spotlight step (omit when checklist is hidden). */
  includeChecklistStep?: boolean;
};

function scrollTourTargetIntoView(selector: string): BeforeHook {
  return () =>
    new Promise((resolve) => {
      const isMobileNav = window.matchMedia("(max-width: 1023px)").matches;
      if (isMobileNav) {
        window.dispatchEvent(new CustomEvent("frontier:joyride-nav-step"));
      }

      const delay = isMobileNav ? 320 : 80;
      window.setTimeout(() => {
        const element = document.querySelector(selector);
        if (element instanceof HTMLElement) {
          element.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
        }
        window.setTimeout(resolve, delay);
      }, delay);
    });
}

export function getRoleJoyrideSteps(role: UserRole, options?: JoyrideStepOptions): Step[] {
  const config = ROLE_ONBOARDING_CONFIGS[role];
  const checklistSteps = options?.filterStepIds
    ? config.steps.filter((step) => !options.filterStepIds!.includes(step.id))
    : config.steps;

  const welcome: Step = {
    target: "body",
    title: config.funnelTitle,
    content: config.funnelSubtitle,
    placement: "center",
    skipBeacon: true,
    skipScroll: true,
    hideOverlay: false,
  };

  const checklistStep: Step = {
    target: '[data-tour="onboarding-checklist"]',
    title: "Your launch funnel",
    content:
      "Work through each funnel stage in order. Expand a stage for detailed tasks, mark it complete, then continue the tour to visit each area of the portal.",
    placement: "bottom",
    skipBeacon: true,
    offset: 12,
  };

  const navSteps: Step[] = checklistSteps.map((step) => {
    const target = navTourSelector(step.href);

    return {
      target,
      title: `${step.stageLabel}: ${step.title}`,
      content: `${step.details} (${step.checklist.length} tasks · ~${step.estimatedMinutes} min)`,
      placement: role === "patient" ? "bottom" : "right",
      skipBeacon: true,
      offset: 12,
      scrollOffset: 0,
      before: scrollTourTargetIntoView(target),
      floatingOptions: {
        flipOptions: {
          padding: 16,
          rootBoundary: "viewport" as const,
          fallbackPlacements: ["left", "bottom", "top"] as const,
        },
      },
    };
  });

  const steps: Step[] = [welcome];
  if (options?.includeChecklistStep !== false) {
    steps.push(checklistStep);
  }
  steps.push(...navSteps);
  return steps;
}

export const APPLY_JOYRIDE_STEPS: Step[] = [
  {
    target: "body",
    title: "Clinic application",
    content: "Complete this guided application to join the Frontier Biomed provider network.",
    placement: "center",
    skipBeacon: true,
    skipScroll: true,
  },
  {
    target: '[data-tour="apply-form"]',
    title: "Application workspace",
    content: "Work through each section below. Your progress is saved as you move between tabs.",
    placement: "bottom",
    skipBeacon: true,
    offset: 12,
  },
  {
    target: '[data-tour="apply-tab-1"]',
    title: "Practice information",
    content: "Enter your clinic details, licenses, and primary contact information.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: '[data-tour="apply-tab-2"]',
    title: "Documents",
    content: "Upload required compliance documents for verification.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: '[data-tour="apply-tab-3"]',
    title: "Banking",
    content: "Add payout details so we can deposit your clinic earnings.",
    placement: "bottom",
    skipBeacon: true,
  },
];
