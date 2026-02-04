ALTER TABLE products ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;
-- Or if you prefer TINYINT
-- ALTER TABLE products ADD COLUMN is_approved TINYINT(1) DEFAULT 0;
