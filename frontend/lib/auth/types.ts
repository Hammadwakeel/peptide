export type UserRole = "affiliate" | "admin" | "patient" | "doctor";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  refreshExpiresAt: number;
  role: UserRole;
  email: string;
  userId: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
  role: UserRole;
  rememberMe: boolean;
};

export type PendingLogin = {
  email: string;
  password: string;
  role: UserRole;
  rememberMe: boolean;
};

export type SendOtpResponse = {
  status: boolean;
  message: string;
  email: string;
  expires_in_minutes: number;
};

export type VerifyOtpResponse = {
  status: boolean;
  message: string;
  email_verified: boolean;
  user: {
    id: string;
    email: string;
    role: string;
  };
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
