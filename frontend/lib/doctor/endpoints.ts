import { IDENTITY_API_URL } from "@/lib/auth/endpoints";

export const DOCTOR_ENDPOINTS = {
  patients: `${IDENTITY_API_URL}/doctor/patients`,
  invitePatient: `${IDENTITY_API_URL}/doctor/patients/invite`,
  clinicProfile: `${IDENTITY_API_URL}/doctor/clinic/profile`,
  clinicAddress: `${IDENTITY_API_URL}/doctor/clinic/address`,
  clinicBranding: `${IDENTITY_API_URL}/doctor/clinic/branding`,
  clinicLogo: `${IDENTITY_API_URL}/doctor/clinic/logo`,
  clinicBanking: `${IDENTITY_API_URL}/doctor/clinic/banking`,
  clinicSettings: `${IDENTITY_API_URL}/doctor/clinic/settings`,
  clinicMembers: `${IDENTITY_API_URL}/doctor/clinic/members`,
  inviteClinicMember: `${IDENTITY_API_URL}/doctor/clinic/members/invite`,
  clinicMember: (memberId: string) =>
    `${IDENTITY_API_URL}/doctor/clinic/members/${memberId}`,
  clinicInvitation: (invitationId: string) =>
    `${IDENTITY_API_URL}/doctor/clinic/members/invitations/${invitationId}`,
} as const;
