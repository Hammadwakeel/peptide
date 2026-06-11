import type { UserRole } from "@/lib/auth/types";

export type SetPasswordTokenStatus = "valid" | "invalid" | "expired" | "already_used";

export type CheckSetPasswordResponse = {
  status: boolean;
  token_status: SetPasswordTokenStatus;
  message: string;
  email?: string;
  login_url?: string;
};

export type SetPasswordPayload = {
  token: string;
  new_password: string;
};

export type SetPasswordResponse = {
  status: boolean;
  message: string;
  login_url: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
};

export type AcceptClinicInvitationPayload = {
  token: string;
  password: string;
  first_name?: string;
  last_name?: string;
};

export type AcceptClinicInvitationResponse = {
  status: boolean;
  message: string;
  login_url: string;
  clinic_name: string;
  access_level: string;
};

export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  href: string;
  actionLabel?: string;
};

export type RoleOnboardingConfig = {
  role: UserRole;
  title: string;
  subtitle: string;
  steps: OnboardingStep[];
};
