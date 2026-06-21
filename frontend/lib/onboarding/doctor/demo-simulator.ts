import type { StoreProduct } from "@/lib/products/catalog-types";
import {
  DOCTOR_ONBOARDING_EVENTS,
  emitDoctorOnboardingEvent,
} from "@/lib/onboarding/doctor/events";
import type { GuidedTourStep } from "@/lib/onboarding/doctor/types";
import { usePatientsStore } from "@/stores/patients-store";
import { useProviderPortalStore } from "@/stores/provider-portal-store";

const DEMO_PRODUCT_ID = "onboarding-demo-product";
const DEMO_STORE_ID = "onboarding-demo-store";
const DEMO_PATIENT_EMAIL = "onboarding.demo@example.com";

const DEMO_STORE_PRODUCT: StoreProduct = {
  store_id: DEMO_STORE_ID,
  product_id: DEMO_PRODUCT_ID,
  name: "Demo Peptide (Onboarding)",
  sku: "ONBOARD-DEMO-001",
  product_type: "peptides",
  description: "Sample product added during clinic launch guide.",
  category: { id: null, name: "Onboarding", slug: null },
  stock_status: "in_stock",
  stock_count: 100,
  clinic_cost: 49,
  retail_price: 99,
  image_url: null,
  is_visible: false,
  strength: null,
  form: null,
  dea_schedule: null,
};

function ensureDemoStoreProduct(): void {
  const store = useProviderPortalStore.getState();
  const exists = store.myStore.some(
    (item) => item.product_id === DEMO_PRODUCT_ID || item.store_id === DEMO_STORE_ID,
  );
  if (exists) return;

  const catalogProduct = store.catalogProducts[0] ?? store.fullCatalogProducts[0];
  const product: StoreProduct = catalogProduct
    ? {
        store_id: DEMO_STORE_ID,
        product_id: catalogProduct.id,
        name: catalogProduct.name,
        sku: catalogProduct.sku,
        product_type: catalogProduct.product_type,
        description: catalogProduct.description,
        category: catalogProduct.category,
        stock_status: catalogProduct.stock_status,
        stock_count: catalogProduct.stock_count,
        clinic_cost: catalogProduct.clinic_cost,
        retail_price: catalogProduct.clinic_cost ? catalogProduct.clinic_cost * 1.5 : 99,
        image_url: catalogProduct.images[0]?.url ?? null,
        is_visible: false,
        strength: catalogProduct.strength,
        form: catalogProduct.form,
        dea_schedule: catalogProduct.dea_schedule,
      }
    : DEMO_STORE_PRODUCT;

  useProviderPortalStore.setState((state) => ({
    myStore: [...state.myStore, product],
    isStoreHydrated: true,
  }));
}

function ensureDemoStoreVisibility(): void {
  ensureDemoStoreProduct();
  useProviderPortalStore.setState((state) => {
    const index = state.myStore.findIndex(
      (item) => item.product_id === DEMO_PRODUCT_ID || item.store_id === DEMO_STORE_ID,
    );
    const targetIndex = index >= 0 ? index : 0;
    if (state.myStore.length === 0) return state;

    const myStore = state.myStore.map((item, i) =>
      i === targetIndex ? { ...item, is_visible: true } : item,
    );
    return { myStore };
  });
}

function ensureDemoPatient(): void {
  const patients = usePatientsStore.getState().patients;
  const exists = patients.some((patient) => patient.email === DEMO_PATIENT_EMAIL);
  if (exists) return;

  usePatientsStore.getState().addPatient({
    name: "Alex Demo Patient",
    email: DEMO_PATIENT_EMAIL,
    phone: "555-0100",
    dateOfBirth: "1990-01-15",
    sendInvite: true,
    address: {
      line1: "100 Demo Lane",
      city: "Austin",
      state: "TX",
      zip: "78701",
    },
  });
  usePatientsStore.setState({ isHydrated: true });
}

function emitForAdvanceEvent(advanceEvent: string | undefined): void {
  if (!advanceEvent) return;

  switch (advanceEvent) {
    case DOCTOR_ONBOARDING_EVENTS.practiceSaved:
    case DOCTOR_ONBOARDING_EVENTS.brandingSaved:
    case DOCTOR_ONBOARDING_EVENTS.bankingSaved:
    case DOCTOR_ONBOARDING_EVENTS.settingsSaved:
      emitDoctorOnboardingEvent(advanceEvent);
      break;
    case DOCTOR_ONBOARDING_EVENTS.productAddedToStore:
      ensureDemoStoreProduct();
      emitDoctorOnboardingEvent(advanceEvent);
      break;
    case DOCTOR_ONBOARDING_EVENTS.storeVisibilitySet:
      ensureDemoStoreVisibility();
      emitDoctorOnboardingEvent(advanceEvent);
      break;
    case DOCTOR_ONBOARDING_EVENTS.patientInvited:
      ensureDemoPatient();
      emitDoctorOnboardingEvent(advanceEvent);
      break;
    case DOCTOR_ONBOARDING_EVENTS.memberInvited:
      emitDoctorOnboardingEvent(advanceEvent);
      break;
    default:
      emitDoctorOnboardingEvent(advanceEvent);
      break;
  }
}

/** Client-only demo mutations + events for action-gated onboarding steps. */
export function runDoctorOnboardingDemoAction(step: GuidedTourStep): void {
  if (step.advanceMode === "custom_event") {
    emitForAdvanceEvent(step.advanceEvent);
    return;
  }
}
