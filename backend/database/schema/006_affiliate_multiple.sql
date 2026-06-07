-- Allow admin to create multiple affiliate accounts (remove single-main constraint)

DROP INDEX IF EXISTS idx_one_main_affiliate;
