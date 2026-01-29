-- ============================================
-- Add category_id to products table
-- Links products to categories
-- Run AFTER dashboard_db.sql and categories.sql
-- ============================================

USE dashboard_db;

-- Add category_id column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS category_id INT NULL,
ADD INDEX idx_category_id (category_id);

-- Add foreign key constraint (optional - for data integrity)
-- ALTER TABLE products
-- ADD CONSTRAINT fk_product_category
-- FOREIGN KEY (category_id) REFERENCES categories(id)
-- ON DELETE SET NULL ON UPDATE CASCADE;

-- Update existing products to link to categories based on text category name
UPDATE products p
LEFT JOIN categories c ON p.category = c.name
SET
    p.category_id = c.id
WHERE
    p.category_id IS NULL
    AND c.id IS NOT NULL;

-- Show current status
SELECT
    p.id,
    p.name AS product_name,
    p.category AS text_category,
    p.category_id,
    c.name AS linked_category_name
FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
LIMIT 10;