import type { UserRole } from "@/lib/auth/types";
import { useAdminPortalStore } from "@/stores/admin-portal-store";
import { useAffiliatePortalStore } from "@/stores/affiliate-portal-store";
import { useChatStore } from "@/stores/chat-store";
import { useAdminOrdersStore, useOrdersStore } from "@/stores/orders-store";
import { usePatientPortalStore } from "@/stores/patient-portal-store";
import { usePatientsStore } from "@/stores/patients-store";
import { useProviderPortalStore } from "@/stores/provider-portal-store";

const bootstrapPromises = new Map<UserRole, Promise<void>>();

async function bootstrapDoctor(force = false) {
  await Promise.all([
    useOrdersStore.getState().refreshOrders({ force }),
    usePatientsStore.getState().refreshPatients({ force }),
    useProviderPortalStore.getState().refreshMyStore({ force }),
    useProviderPortalStore.getState().loadCatalog(force),
    useProviderPortalStore.getState().loadFullCatalog({ force }),
    useChatStore.getState().refreshThreads({ force }),
  ]);
}

async function bootstrapAdmin(force = false) {
  await Promise.all([
    useAdminPortalStore.getState().bootstrap(force),
    useAdminOrdersStore.getState().refreshOrders({ force }),
  ]);
}

async function bootstrapPatient(force = false) {
  await Promise.all([
    usePatientPortalStore.getState().loadPortalData({ force }),
    useChatStore.getState().refreshThreads({ force }),
  ]);
}

async function bootstrapAffiliate(force = false) {
  await useAffiliatePortalStore.getState().refreshProfile({ force });
}

export async function bootstrapPortal(role: UserRole, options: { force?: boolean } = {}) {
  const { force = false } = options;

  if (!force) {
    const inFlight = bootstrapPromises.get(role);
    if (inFlight) return inFlight;
  }

  const run = async () => {
    switch (role) {
      case "doctor":
        await bootstrapDoctor(force);
        break;
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
  useOrdersStore.getState().reset();
  useAdminOrdersStore.getState().reset();
  usePatientsStore.getState().reset();
  useProviderPortalStore.getState().reset();
  usePatientPortalStore.getState().reset();
  useChatStore.getState().reset();
  useAffiliatePortalStore.getState().reset();
  useAdminPortalStore.getState().reset();
}
