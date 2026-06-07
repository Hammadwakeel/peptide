export type DoctorPatient = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  status: string;
  has_account: boolean;
  email_verified: boolean | null;
};

export type DoctorPatientsPagination = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
};

export type DoctorPatientsResponse = {
  status: boolean;
  patients: DoctorPatient[];
  pagination: DoctorPatientsPagination;
  clinic_id: string;
  clinic_name: string;
};

export type InvitePatientPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  dob?: string | null;
};

export type InvitePatientResponse = {
  status: boolean;
  message: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  invitation: {
    id: string;
    invite_link: string;
    expires_at: string;
  };
};

export function doctorPatientFullName(patient: Pick<DoctorPatient, "first_name" | "last_name">) {
  return `${patient.first_name} ${patient.last_name}`.trim();
}
