-- Main / sub-affiliate hierarchy with clinic referral tracking

CREATE TYPE affiliate_type AS ENUM ('main', 'sub');

ALTER TABLE affiliates
  ADD COLUMN IF NOT EXISTS affiliate_type affiliate_type NOT NULL DEFAULT 'sub',
  ADD COLUMN IF NOT EXISTS parent_affiliate_id UUID REFERENCES affiliates(id) ON DELETE RESTRICT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_main_affiliate
  ON affiliates ((TRUE))
  WHERE affiliate_type = 'main';

ALTER TABLE affiliate_referrals
  ADD COLUMN IF NOT EXISTS referring_affiliate_id UUID REFERENCES affiliates(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS main_affiliate_id UUID REFERENCES affiliates(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_affiliates_parent ON affiliates(parent_affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_main ON affiliate_referrals(main_affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referrals_referring ON affiliate_referrals(referring_affiliate_id);
