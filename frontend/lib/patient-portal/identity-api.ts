export {
  acceptInvitation,
  addPatientPaymentMethod,
  createPatientAddress,
  deletePatientAddress,
  deletePatientPaymentMethod,
  getPatientSettings,
  listPatientAddresses,
  mapAddress,
  mapPaymentMethod,
  mapSettingsToProfile,
  setDefaultPatientAddress,
  setDefaultPatientPaymentMethod,
  updatePatientAddress,
  updatePatientProfile,
} from "@/lib/patient/api";

export type { PatientSettingsResponse } from "@/lib/patient/types";
