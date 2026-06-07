export type UserRole = "affiliate" | "admin" | "patient" | "doctor";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  role: UserRole;
  email: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
  role: UserRole;
  rememberMe: boolean;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
  confirmPassword: string;
};

export type ProviderApplicationPayload = {
  clinicName: string;
  npi: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};
