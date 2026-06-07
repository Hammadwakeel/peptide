import type { ClinicApplicationSummary } from "@/lib/apply/types";

const APPLICATION_STORAGE_KEY = "frontier-clinic-application";

export function storeApplicationSummary(application: ClinicApplicationSummary) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(APPLICATION_STORAGE_KEY, JSON.stringify(application));
}

export function readApplicationSummary(): ClinicApplicationSummary | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(APPLICATION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ClinicApplicationSummary;
  } catch {
    clearApplicationSummary();
    return null;
  }
}

export function clearApplicationSummary() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(APPLICATION_STORAGE_KEY);
}
