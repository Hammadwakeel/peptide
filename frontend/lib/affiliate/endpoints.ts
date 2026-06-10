import { IDENTITY_API_URL } from "@/lib/auth/endpoints";

export const AFFILIATE_ENDPOINTS = {
  profile: `${IDENTITY_API_URL}/affiliate/profile`,
  clinicInviteLink: `${IDENTITY_API_URL}/affiliate/clinics/invite-link`,
  clinicInvite: `${IDENTITY_API_URL}/affiliate/clinics/invite`,
  subAffiliateInvite: `${IDENTITY_API_URL}/affiliate/sub-affiliates/invite`,
  subAffiliates: `${IDENTITY_API_URL}/affiliate/sub-affiliates`,
  clinicReferrals: `${IDENTITY_API_URL}/affiliate/referrals/clinics`,
} as const;
