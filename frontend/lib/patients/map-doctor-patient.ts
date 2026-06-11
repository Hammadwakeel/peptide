import { doctorPatientFullName, type DoctorPatient } from "@/lib/doctor/types";
import type { Patient } from "@/lib/patients/types";

const emptyAddress = { line1: "", city: "", state: "", zip: "" };

export function mapDoctorPatientToPatient(patient: DoctorPatient): Patient {
  return {
    id: patient.id,
    name: doctorPatientFullName(patient),
    email: patient.email,
    phone: patient.phone ?? "",
    dateOfBirth: "",
    status: patient.has_account && patient.status === "active" ? "active" : "inactive",
    totalOrders: 0,
    lastOrderDate: null,
    address: emptyAddress,
    shippingAddresses: [],
    paymentMethod: { brand: "—", last4: "0000", expMonth: 1, expYear: 2030 },
    orders: [],
    chatMessages: [],
    notes: [],
    requests: [],
  };
}
