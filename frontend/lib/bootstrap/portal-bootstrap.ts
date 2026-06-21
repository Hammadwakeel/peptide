import type { UserRole } from "@/lib/auth/types";
import { useAdminPortalStore } from "@/stores/admin-portal-store";
import { useAffiliatePortalStore } from "@/stores/affiliate-portal-store";
import { useChatStore } from "@/stores/chat-store";
import { useAdminOrdersStore, useOrdersStore } from "@/stores/orders-store";
import { usePatientPortalStore } from "@/stores/patient-portal-store";
import { usePatientsStore } from "@/stores/patients-store";
import { useProviderPortalStore } from "@/stores/provider-portal-store";

export type BootstrapTier = "critical" | "full";

type BootstrapOptions = {
  force?: boolean;
  tier?: BootstrapTier;
};

const DOCTOR_CRITICAL_KEY = "doctor:critical";
const bootstrapPromises = new Map<string, Promise<void>>();
let doctorDeferredStarted = false;

async function bootstrapDoctorCritical(force = false) {
  await Promise.all([
    useOrdersStore.getState().refreshOrders({ force }),
    usePatientsStore.getState().refreshPatients({ force }),
    useProviderPortalStore.getState().refreshMyStore({ force }),
    useProviderPortalStore.getState().refreshClinicProfile({ force }),
  ]);
}

function bootstrapDoctorDeferred(force = false) {
  if (!force && doctorDeferredStarted) return;
  doctorDeferredStarted = true;
  void Promise.all([
    useChatStore.getState().refreshThreads({ force }),
    useProviderPortalStore.getState().loadCatalog(force),
    useProviderPortalStore.getState().loadFullCatalog({ force }),
  ]);
}

async function bootstrapDoctor(force = false, tier: BootstrapTier = "full") {
  if (tier === "full") {
    bootstrapDoctorDeferred(force);
  }
  await bootstrapDoctorCritical(force);
}

async function bootstrapAdmin(force = false) {
  await Promise.all([
    useAdminPortalStore.getState().bootstrap(force),
    useAdminOrdersStore.getState().refreshOrders({ force }),
  ]);
}

async function bootstrapPatient(force = false) {
  await Promise.all([
    useChatStore.getState().refreshThreads({ force }),
    usePatientPortalStore.getState().loadPortalData({ force }),
  ]);
}

async function bootstrapAffiliate(force = false) {
  await useAffiliatePortalStore.getState().refreshProfile({ force });
}

export async function bootstrapPortal(role: UserRole, options: BootstrapOptions = {}) {
  const { force = false, tier = "full" } = options;

  if (role === "doctor") {
    if (!force) {
      const inFlight = bootstrapPromises.get(DOCTOR_CRITICAL_KEY);
      if (inFlight) return inFlight;
    }

    const promise = bootstrapDoctor(force, tier);
    if (!force) {
      bootstrapPromises.set(DOCTOR_CRITICAL_KEY, promise);
      promise.finally(() => bootstrapPromises.delete(DOCTOR_CRITICAL_KEY));
    }
    return promise;
  }

  if (!force) {
    const inFlight = bootstrapPromises.get(role);
    if (inFlight) return inFlight;
  }

  const run = async () => {
    switch (role) {
      case "admin":
        await bootstrapAdmin(force);
        break;
      case "patient":
        await bootstrapPatient(force);
        break;
      case "affiliate":
        await bootstrapAffiliate(force);
        break;
      default:
        break;
    }
  };

  const promise = run();
  if (!force) {
    bootstrapPromises.set(role, promise);
    promise.finally(() => bootstrapPromises.delete(role));
  }
  return promise;
}

export function resetPortalBootstrap() {
  bootstrapPromises.clear();
  doctorDeferredStarted = false;
  useOrdersStore.getState().reset();
  useAdminOrdersStore.getState().reset();
  usePatientsStore.getState().reset();
  useProviderPortalStore.getState().reset();
  usePatientPortalStore.getState().reset();
  useChatStore.getState().reset();
  useAffiliatePortalStore.getState().reset();
  useAdminPortalStore.getState().reset();
}
