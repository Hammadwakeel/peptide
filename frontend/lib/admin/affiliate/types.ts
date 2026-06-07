export type AffiliateStatus = "active" | "paused" | "pending";

export type AffiliateRecord = {
  id: string;
  name: string;
  clinicsReferred: number;
  orders: number;
  gmv: number;
  commissionRate: number;
  earned: number;
  status: AffiliateStatus;
};

export type AffiliateSummary = {
  activeAffiliates: number;
  totalGmvAttributed: number;
  commissionsPaid: number;
  commissionsPending: number;
};

export const AFFILIATE_STATUS_LABELS: Record<AffiliateStatus, string> = {
  active: "Active",
  paused: "Paused",
  pending: "Pending",
};
