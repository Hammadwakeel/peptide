export type ClinicAccessLevel =
  | "owner"
  | "admin"
  | "staff"
  | "associate_provider";

export type ClinicPermission =
  | "view_clinic"
  | "edit_clinic"
  | "edit_banking"
  | "edit_branding"
  | "edit_settings"
  | "manage_members"
  | "view_patients"
  | "invite_patients";

export type ClinicProfile = {
  id: string;
  clinic_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  npi_number: string | null;
  dea_number: string | null;
  state_license_number: string | null;
  tax_id: string | null;
  first_name: string | null;
  last_name: string | null;
  status: string;
};

export type ClinicAddress = {
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export type ClinicBranding = {
  logo_url: string | null;
  tagline: string | null;
  theme_color: string;
};

export type ClinicBankingSummary = {
  bank_name: string;
  account_type: string;
  routing_last4: string;
  account_last4: string;
};

export type ClinicSettings = {
  notification_email: boolean;
  notification_sms: boolean;
  auto_approve_requests: boolean;
  payout_schedule_days: number;
  timezone: string;
};

export type ClinicMembership = {
  access_level: ClinicAccessLevel;
  permissions: ClinicPermission[];
};

export type ClinicProfileResponse = {
  status: boolean;
  clinic: ClinicProfile;
  address: ClinicAddress | null;
  branding: ClinicBranding;
  banking: ClinicBankingSummary | null;
  settings: ClinicSettings;
  membership: ClinicMembership;
};

export type ClinicMember = {
  id: string;
  user_id?: string;
  email: string;
  name: string;
  access_level: ClinicAccessLevel;
  status: "active" | "inactive" | "pending";
  is_active: boolean;
  expires_at?: string;
};

export type ClinicMembersResponse = {
  status: boolean;
  members: ClinicMember[];
  pending_invitations: ClinicMember[];
  membership: ClinicMembership;
};

export const ACCESS_LEVEL_LABELS: Record<ClinicAccessLevel, string> = {
  owner: "Owner",
  admin: "Admin",
  staff: "Staff",
  associate_provider: "Associate Provider",
};

/** Roles that can be assigned when inviting (not owner). */
export type InvitableAccessLevel = Exclude<ClinicAccessLevel, "owner">;

export type UpdateClinicProfilePayload = Partial<
  Pick<
    ClinicProfile,
    | "clinic_name"
    | "phone"
    | "website"
    | "npi_number"
    | "dea_number"
    | "state_license_number"
    | "tax_id"
    | "first_name"
    | "last_name"
  >
>;

export type UpdateClinicAddressPayload = ClinicAddress;

export type UpdateClinicBrandingPayload = {
  tagline?: string | null;
  theme_color?: string;
};

export type UpdateClinicBankingPayload = {
  bank_name: string;
  account_type: "checking" | "savings";
  routing_number: string;
  account_number: string;
};

export type UpdateClinicSettingsPayload = Partial<ClinicSettings>;

export type InviteClinicMemberPayload = {
  email: string;
  access_level: InvitableAccessLevel;
};

export type UpdateClinicMemberPayload = {
  access_level?: InvitableAccessLevel;
  is_active?: boolean;
};
