export const DOCTOR_ONBOARDING_EVENTS = {
  dashboardReady: "frontier:dashboard-ready",
  practiceSaved: "frontier:onboarding:practice-saved",
  brandingSaved: "frontier:onboarding:branding-saved",
  bankingSaved: "frontier:onboarding:banking-saved",
  settingsSaved: "frontier:onboarding:settings-saved",
  productAddedToStore: "frontier:onboarding:product-added",
  storeVisibilitySet: "frontier:onboarding:store-visibility-set",
  patientInvited: "frontier:onboarding:patient-invited",
  memberInvited: "frontier:onboarding:member-invited",
  messageSent: "frontier:onboarding:message-sent",
  missionAcknowledged: "frontier:onboarding:mission-acknowledged",
} as const;

export function emitDoctorOnboardingEvent(eventName: string) {
  window.dispatchEvent(new CustomEvent(eventName));
}

export function waitForDoctorOnboardingEvent(eventName: string, timeoutMs = 120_000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      window.removeEventListener(eventName, handler);
      reject(new Error(`Timeout waiting for ${eventName}`));
    }, timeoutMs);

    function handler() {
      window.clearTimeout(timer);
      window.removeEventListener(eventName, handler);
      resolve();
    }

    window.addEventListener(eventName, handler, { once: true });
  });
}
