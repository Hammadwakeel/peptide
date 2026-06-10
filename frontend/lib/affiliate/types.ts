export type AffiliateType = "main" | "sub";

export type AffiliateProfile = {
  id: string;
  email: string;
  affiliate_code: string;
  affiliate_type: AffiliateType;
  status: string;
  profit_margin_percent: number;
  referral_link: string;
  parent_affiliate: {
    affiliate_code: string;
    email: string;
  } | null;
  max_sub_affiliates: number | null;
  stats: {
    own_clinic_referrals: number;
    total_clinic_referrals: number;
    sub_affiliate_count: number;
  };
};

export type AffiliatePagination = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
};

export type AffiliateProfileResponse = {
  status: boolean;
  affiliate: AffiliateProfile;
};

export type ClinicInviteLinkResponse = {
  status: boolean;
  referral_code: string;
  referral_link: string;
};

export type InviteClinicPayload = {
  clinic_email?: string;
};

export type InviteClinicResponse = {
  status: boolean;
  message: string;
  referral_code: string;
  referral_link: string;
  email_sent_to: string | null;
  affiliate_type: AffiliateType;
};

export type InviteSubAffiliatePayload = {
  email: string;
};

export type SubAffiliate = {
  id: string;
  email: string;
  affiliate_code: string;
  status: string;
  profit_margin_percent: number;
  clinic_referral_count: number;
  created_at: string;
};

export type PaginatedSubAffiliatesResponse = {
  status: boolean;
  sub_affiliates: SubAffiliate[];
  pagination: AffiliatePagination;
};

export type InviteSubAffiliateResponse = {
  status: boolean;
  message: string;
  sub_affiliate: {
    id: string;
    email: string;
    affiliate_code: string;
    parent_affiliate_id: string;
    affiliate_type: "sub";
    status: string;
  };
  email_sent_to: string;
};

export type ClinicReferral = {
  id: string;
  referral_code: string;
  status: string;
  clinic: {
    id: string;
    clinic_name: string;
    email: string;
    status: string;
  };
  referred_by: {
    affiliate_code: string;
    email: string;
  };
  created_at: string;
};

export type PaginatedClinicReferralsResponse = {
  status: boolean;
  referrals: ClinicReferral[];
  pagination: AffiliatePagination;
};

export type ReferralScope = "own" | "all";

export function isMainAffiliate(profile: AffiliateProfile | null | undefined) {
  return profile?.affiliate_type === "main";
}
