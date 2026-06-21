"use client";

import type { BeforeHook } from "react-joyride";
import { DOCTOR_ONBOARDING_EVENTS } from "@/lib/onboarding/doctor/events";
import type { DoctorMissionId, DoctorTourStepInput, GuidedTourStep } from "@/lib/onboarding/doctor/types";
import { navTourSelector } from "@/lib/onboarding/tour-targets";

function tourTarget(id: string): string {
  return `[data-tour="${id}"]`;
}

function scrollAndWait(selector: string, delayMs = 120): BeforeHook {
  return () =>
    new Promise((resolve) => {
      const isMobileNav = window.matchMedia("(max-width: 1023px)").matches;
      if (isMobileNav) {
        window.dispatchEvent(new CustomEvent("frontier:joyride-nav-step"));
      }
      window.setTimeout(() => {
        const element = document.querySelector(selector);
        if (element instanceof HTMLElement) {
          element.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
        }
        window.setTimeout(resolve, isMobileNav ? 320 : delayMs);
      }, isMobileNav ? 280 : delayMs);
    });
}

function step(partial: DoctorTourStepInput): GuidedTourStep {
  const { targetId, target, ...rest } = partial;
  return {
    skipBeacon: true,
    offset: 12,
    target: target ?? tourTarget(targetId ?? "body"),
    ...rest,
  };
}

type MissionTourContext = {
  hasPendingOrders: boolean;
  canEditBanking: boolean;
  canInvitePatients: boolean;
  canManageMembers: boolean;
};

export function getDoctorMissionTourSteps(
  missionId: DoctorMissionId,
  ctx: MissionTourContext,
): GuidedTourStep[] {
  switch (missionId) {
    case "workspace":
      return [
        step({
          target: "body",
          title: "Welcome to your clinic workspace",
          content: "This guided setup walks through every area of your portal. Let's start with your command center.",
          placement: "center",
          skipScroll: true,
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-dashboard-clinic-card",
          title: "Your clinic snapshot",
          content: "See your clinic name, store products, and patient count update in real time as you complete setup.",
          placement: "bottom",
          before: scrollAndWait(tourTarget("doctor-dashboard-clinic-card")),
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-dashboard-ops-card",
          title: "Operations at a glance",
          content: "Track pending order reviews and active shipments from this panel.",
          placement: "bottom",
          before: scrollAndWait(tourTarget("doctor-dashboard-ops-card")),
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-dashboard-performance",
          title: "Performance trends",
          content: "Once orders flow in, sales, profit, and volume charts populate here.",
          placement: "top",
          before: scrollAndWait(tourTarget("doctor-dashboard-performance")),
          advanceMode: "manual",
          missionId,
        }),
      ];

    case "practice":
      return [
        step({
          target: "body",
          title: "Set up your clinic foundation",
          content: "We'll walk through practice info, branding, banking, and notifications. Save each section to continue.",
          placement: "center",
          skipScroll: true,
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-settings-tabs",
          title: "Settings sections",
          content: "Use these tabs to configure every part of your clinic profile.",
          placement: "bottom",
          before: scrollAndWait(tourTarget("doctor-settings-tabs")),
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-settings-tab-practice",
          title: "Practice information",
          content: "Confirm your clinic name, licenses, and address. Click the Practice Info tab if needed.",
          placement: "bottom",
          spotlightClicks: true,
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-settings-practice-form",
          title: "Complete your details",
          content: "Fill in NPI, DEA, state license, and address fields.",
          placement: "top",
          before: scrollAndWait(tourTarget("doctor-settings-practice-form")),
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-settings-save",
          title: "Save practice info",
          content: "Click Save changes to store your practice details.",
          placement: "left",
          spotlightClicks: true,
          advanceMode: "custom_event",
          advanceEvent: DOCTOR_ONBOARDING_EVENTS.practiceSaved,
          actionHint: "Click Save to continue.",
          missionId,
        }),
        step({
          targetId: "doctor-settings-tab-branding",
          title: "Storefront branding",
          content: "Upload your logo and set a tagline patients will see on your storefront.",
          placement: "bottom",
          spotlightClicks: true,
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-settings-save",
          title: "Save branding",
          content: "Save your branding changes.",
          placement: "left",
          spotlightClicks: true,
          advanceMode: "custom_event",
          advanceEvent: DOCTOR_ONBOARDING_EVENTS.brandingSaved,
          actionHint: "Click Save to continue.",
          missionId,
        }),
        ...(ctx.canEditBanking
          ? [
              step({
                targetId: "doctor-settings-tab-banking",
                title: "Banking for payouts",
                content: "Connect the account where clinic earnings will be deposited.",
                placement: "bottom",
                spotlightClicks: true,
                advanceMode: "manual",
                missionId,
              }),
              step({
                targetId: "doctor-settings-save",
                title: "Save banking",
                content: "Enter routing and account numbers, then save.",
                placement: "left",
                spotlightClicks: true,
                advanceMode: "custom_event",
                advanceEvent: DOCTOR_ONBOARDING_EVENTS.bankingSaved,
                actionHint: "Click Save to continue.",
                missionId,
              }),
            ]
          : [
              step({
                target: "body",
                title: "Banking setup",
                content: "Ask your clinic owner to add banking details for payouts. You can continue with other missions.",
                placement: "center",
                skipScroll: true,
                advanceMode: "manual",
                missionId,
              }),
            ]),
        step({
          targetId: "doctor-settings-tab-notifications",
          title: "Notification preferences",
          content: "Set your timezone and choose how you receive alerts.",
          placement: "bottom",
          spotlightClicks: true,
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-settings-save",
          title: "Save notifications",
          content: "Save your notification settings to finish this mission.",
          placement: "left",
          spotlightClicks: true,
          advanceMode: "custom_event",
          advanceEvent: DOCTOR_ONBOARDING_EVENTS.settingsSaved,
          actionHint: "Click Save to complete this mission.",
          missionId,
        }),
      ];

    case "catalog":
      return [
        step({
          target: "body",
          title: "Browse the master catalog",
          content: "Frontier's full peptide and pharmacy inventory lives here. Add products to your clinic store.",
          placement: "center",
          skipScroll: true,
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-inventory-search",
          title: "Search inventory",
          content: "Find products by name or SKU.",
          placement: "bottom",
          before: scrollAndWait(tourTarget("doctor-inventory-search")),
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-inventory-filters",
          title: "Filter & browse",
          content: "Switch between peptides and pharmacy, filter by category or stock status.",
          placement: "bottom",
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-inventory-first-add",
          title: "Add to My Store",
          content: "Check a product to add it to your clinic storefront. Do this now to continue.",
          placement: "left",
          spotlightClicks: true,
          advanceMode: "custom_event",
          advanceEvent: DOCTOR_ONBOARDING_EVENTS.productAddedToStore,
          actionHint: "Add at least one product to continue.",
          missionId,
        }),
      ];

    case "storefront":
      return [
        step({
          target: "body",
          title: "Configure your storefront",
          content: "Set patient-facing prices and control which products are visible.",
          placement: "center",
          skipScroll: true,
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-store-add-items",
          title: "Add more products",
          content: "Open the catalog modal to bulk-add items anytime.",
          placement: "bottom",
          before: scrollAndWait(tourTarget("doctor-store-add-items")),
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-store-product-list",
          title: "Your storefront products",
          content: "Edit retail prices for each product in your store.",
          placement: "top",
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-store-visibility-toggle",
          title: "Make a product visible",
          content: "Toggle visibility on so patients can see and order this product.",
          placement: "left",
          spotlightClicks: true,
          advanceMode: "custom_event",
          advanceEvent: DOCTOR_ONBOARDING_EVENTS.storeVisibilitySet,
          actionHint: "Enable visibility on a product to continue.",
          missionId,
        }),
      ];

    case "patients":
      return [
        step({
          target: "body",
          title: "Build your patient roster",
          content: "Invite patients to browse your storefront and place orders securely.",
          placement: "center",
          skipScroll: true,
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-customers-invite",
          title: "Invite a patient",
          content: "Click Invite patient to open the invitation form.",
          placement: "bottom",
          spotlightClicks: true,
          before: scrollAndWait(tourTarget("doctor-customers-invite")),
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-patient-invite-form",
          title: "Patient details",
          content: "Enter the patient's name and email. They'll receive a secure sign-up link.",
          placement: "top",
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-patient-invite-submit",
          title: "Send invitation",
          content: "Submit the form to send the invite.",
          placement: "top",
          spotlightClicks: true,
          advanceMode: "custom_event",
          advanceEvent: DOCTOR_ONBOARDING_EVENTS.patientInvited,
          actionHint: "Send the invitation to continue.",
          missionId,
        }),
      ];

    case "orders":
      if (ctx.hasPendingOrders) {
        return [
          step({
            target: "body",
            title: "Review patient orders",
            content: "You have orders waiting for review. Let's walk through the approval workflow.",
            placement: "center",
            skipScroll: true,
            advanceMode: "manual",
            missionId,
          }),
          step({
            targetId: "doctor-orders-tabs",
            title: "Order status tabs",
            content: "Filter by pending review, approved, rejected, or view all orders.",
            placement: "bottom",
            before: scrollAndWait(tourTarget("doctor-orders-tabs")),
            advanceMode: "manual",
            missionId,
          }),
          step({
            targetId: "doctor-orders-table",
            title: "Open an order",
            content: "Click a pending order to see line items and patient details.",
            placement: "top",
            advanceMode: "manual",
            missionId,
          }),
          step({
            targetId: "doctor-order-approve",
            title: "Approve or reject",
            content: "Approve when ready to fulfill, or reject with a reason if something needs correction.",
            placement: "bottom",
          advanceMode: "manual",
          actionHint: "Review the actions — click Continue when ready.",
          missionId,
        }),
      ];
      }
      return [
        step({
          target: "body",
          title: "How orders work",
          content: "When patients place orders, they appear here for your review before fulfillment.",
          placement: "center",
          skipScroll: true,
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-orders-tabs",
          title: "Order status tabs",
          content: "Pending review — new orders needing approval. Approved — ready to ship. Rejected — declined with reason.",
          placement: "bottom",
          before: scrollAndWait(tourTarget("doctor-orders-tabs")),
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-orders-table",
          title: "Your order queue",
          content: "When your first patient orders, you'll approve it here. Payment and shipment status track alongside each order.",
          placement: "top",
          advanceMode: "manual",
          actionHint: "Click Continue — you're ready for patient orders.",
          missionId,
        }),
      ];

    case "messages":
      return [
        step({
          target: "body",
          title: "Secure patient messaging",
          content: "Chat with patients about orders, products, and clinical questions.",
          placement: "center",
          skipScroll: true,
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-messages-thread-list",
          title: "Conversation list",
          content: "All patient threads appear here. Select one to open the chat.",
          placement: "right",
          before: scrollAndWait(tourTarget("doctor-messages-thread-list")),
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-messages-compose",
          title: "Send a message",
          content: "Use quick templates or type a message. If no patients yet, you'll see threads after your first invite.",
          placement: "top",
          advanceMode: "manual",
          actionHint: "Click Continue when you've reviewed messaging.",
          missionId,
        }),
      ];

    case "team":
      return [
        step({
          target: "body",
          title: "Build your clinic team",
          content: "Invite staff and associate providers to help manage patients and orders.",
          placement: "center",
          skipScroll: true,
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-users-invite",
          title: "Invite a team member",
          content: "Click Invite member and choose a role with the right permissions.",
          placement: "bottom",
          spotlightClicks: true,
          before: scrollAndWait(tourTarget("doctor-users-invite")),
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-users-table",
          title: "Manage access",
          content: "Toggle member access or cancel pending invites from this table.",
          placement: "top",
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-users-invite-submit",
          title: "Send the invite",
          content: "Submit the invitation form to add your first team member.",
          placement: "top",
          spotlightClicks: true,
          advanceMode: "custom_event",
          advanceEvent: DOCTOR_ONBOARDING_EVENTS.memberInvited,
          actionHint: "Send an invite to complete this mission.",
          missionId,
        }),
      ];

    case "accounting":
      return [
        step({
          target: "body",
          title: "Financial visibility",
          content: "Track revenue, profit trends, and payout schedules as your clinic grows.",
          placement: "center",
          skipScroll: true,
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-accounting-charts",
          title: "Revenue & profit charts",
          content: "Charts populate as paid orders accumulate. Use the time range to adjust the view.",
          placement: "bottom",
          before: scrollAndWait(tourTarget("doctor-accounting-charts")),
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-accounting-range",
          title: "Time range",
          content: "Switch between preset ranges or set a custom date window.",
          placement: "bottom",
          advanceMode: "manual",
          actionHint: "Click Continue when you've reviewed accounting.",
          missionId,
        }),
      ];

    case "support":
      return [
        step({
          target: "body",
          title: "Help when you need it",
          content: "Search the knowledge base or submit a ticket to our support team.",
          placement: "center",
          skipScroll: true,
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-help-search",
          title: "Knowledge base",
          content: "Search articles for common questions about orders, patients, and settings.",
          placement: "bottom",
          before: scrollAndWait(tourTarget("doctor-help-search")),
          advanceMode: "manual",
          missionId,
        }),
        step({
          targetId: "doctor-help-ticket-form",
          title: "Submit a ticket",
          content: "Describe your issue and our team will follow up. You're all set — clinic launch guide complete!",
          placement: "top",
          advanceMode: "manual",
          actionHint: "Click Continue to finish the launch guide.",
          missionId,
        }),
      ];

    default:
      return [];
  }
}

export function getDoctorNavStep(missionRoute: string): GuidedTourStep {
  return step({
    target: navTourSelector(missionRoute),
    title: "Navigate here",
    content: "We'll take you to the right page for this mission.",
    placement: "right",
    before: scrollAndWait(navTourSelector(missionRoute)),
    advanceMode: "manual",
  });
}
