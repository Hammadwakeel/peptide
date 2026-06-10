export type PatientAddress = {
  id: string;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  zip: string;
  country?: string;
  is_default: boolean;
};

export type PatientPaymentMethodRecord = {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
};

export type PatientSettings = {
  id: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string;
  date_of_birth: string | null;
  clinic: { id: string; name: string | null };
  shipping_addresses: PatientAddress[];
  payment_methods: PatientPaymentMethodRecord[];
};

export type PatientSettingsResponse = {
  status: boolean;
  settings: PatientSettings;
};

export type AcceptInvitationPayload = {
  email: string;
  token: string;
  doctor_id: string;
};

export type AcceptInvitationResponse = {
  status: boolean;
  message: string;
  user: { id: string; email: string; role: string };
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    clinic_name: string;
  };
};

export type PatientAddressInput = {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
  is_default?: boolean;
};

export type PatientPaymentMethodInput = {
  card_brand: string;
  card_last4: string;
  exp_month: number;
  exp_year: number;
  is_default?: boolean;
};
