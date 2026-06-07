-- Module M3: product slug for provider catalog detail endpoint

ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

UPDATE products
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(product_name, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
WHERE slug IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug) WHERE slug IS NOT NULL;
