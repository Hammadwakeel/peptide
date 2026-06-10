import { adminFetch } from "@/lib/admin/client";
import { AFFILIATE_ENDPOINTS } from "@/lib/affiliate/endpoints";
import type {
  AffiliateProfileResponse,
  ClinicInviteLinkResponse,
  InviteClinicPayload,
  InviteClinicResponse,
  InviteSubAffiliatePayload,
  InviteSubAffiliateResponse,
  PaginatedClinicReferralsResponse,
  PaginatedSubAffiliatesResponse,
  ReferralScope,
} from "@/lib/affiliate/types";

type ListParams = {
  page?: number;
  limit?: number;
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getAffiliateProfile() {
  return adminFetch<AffiliateProfileResponse>(AFFILIATE_ENDPOINTS.profile);
}

export async function getClinicInviteLink() {
  return adminFetch<ClinicInviteLinkResponse>(AFFILIATE_ENDPOINTS.clinicInviteLink);
}

export async function inviteClinic(body: InviteClinicPayload = {}) {
  return adminFetch<InviteClinicResponse>(AFFILIATE_ENDPOINTS.clinicInvite, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function inviteSubAffiliate(body: InviteSubAffiliatePayload) {
  return adminFetch<InviteSubAffiliateResponse>(AFFILIATE_ENDPOINTS.subAffiliateInvite, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listSubAffiliates(params: ListParams = {}) {
  return adminFetch<PaginatedSubAffiliatesResponse>(
    `${AFFILIATE_ENDPOINTS.subAffiliates}${buildQuery(params)}`,
  );
}

export async function listClinicReferrals(
  params: ListParams & { scope?: ReferralScope } = {},
) {
  return adminFetch<PaginatedClinicReferralsResponse>(
    `${AFFILIATE_ENDPOINTS.clinicReferrals}${buildQuery(params)}`,
  );
}
