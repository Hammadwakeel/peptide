import type { AffiliateRecord, AffiliateSummary } from "@/lib/admin/affiliate/types";

export const AFFILIATE_SUMMARY: AffiliateSummary = {
  activeAffiliates: 12,
  totalGmvAttributed: 284_500,
  commissionsPaid: 18_420,
  commissionsPending: 4_280,
};

export const MOCK_AFFILIATES: AffiliateRecord[] = [
  {
    id: "aff-001",
    name: "Pacific Partners",
    clinicsReferred: 8,
    orders: 142,
    gmv: 98_400,
    commissionRate: 5,
    earned: 4_920,
    status: "active",
  },
  {
    id: "aff-002",
    name: "Regen Referral Network",
    clinicsReferred: 5,
    orders: 89,
    gmv: 62_100,
    commissionRate: 4.5,
    earned: 2_795,
    status: "active",
  },
  {
    id: "aff-003",
    name: "West Coast Wellness Alliance",
    clinicsReferred: 3,
    orders: 41,
    gmv: 38_200,
    commissionRate: 5,
    earned: 1_910,
    status: "active",
  },
  {
    id: "aff-004",
    name: "MedBridge Associates",
    clinicsReferred: 2,
    orders: 18,
    gmv: 14_800,
    commissionRate: 3.5,
    earned: 518,
    status: "pending",
  },
  {
    id: "aff-005",
    name: "Summit Health Partners",
    clinicsReferred: 4,
    orders: 56,
    gmv: 41_000,
    commissionRate: 5,
    earned: 2_050,
    status: "paused",
  },
];
