-- ============================================
-- Step 1: Create car_images table
-- ============================================
CREATE TABLE IF NOT EXISTS car_images (
    id SERIAL PRIMARY KEY,
    car_id INT NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_car_images_car_id ON car_images(car_id);
CREATE INDEX IF NOT EXISTS idx_car_images_display_order ON car_images(car_id, display_order);
-- ============================================
-- Step 2: Migrate existing data from JSON column
-- ============================================
-- This migrates existing images from the JSON 'images' column to the new car_images table
DO $$
DECLARE car_record RECORD;
img_url TEXT;
img_index INT;
BEGIN -- Loop through all cars that have images
FOR car_record IN
SELECT id,
    images
FROM cars
WHERE images IS NOT NULL
    AND images != 'null'
    AND images != '[]' LOOP -- Parse JSON array and insert each image
    img_index := 0;
FOR img_url IN
SELECT jsonb_array_elements_text(car_record.images::jsonb) LOOP
INSERT INTO car_images (car_id, image_url, display_order, is_primary)
VALUES (
        car_record.id,
        img_url,
        img_index,
        img_index = 0 -- First image is primary
    );
img_index := img_index + 1;
END LOOP;
END LOOP;
END $$;
-- ============================================
-- Step 3: Verify migration
-- ============================================
-- Check how many images were migrated
SELECT c.id,
    c.name,
    COUNT(ci.id) as image_count
FROM cars c
    LEFT JOIN car_images ci ON c.id = ci.car_id
GROUP BY c.id,
    c.name
ORDER BY c.id;
-- ============================================
-- Step 4 (Optional): Drop old images column
-- ============================================
-- IMPORTANT: Only run this after verifying the migration was successful
-- and after updating all API code to use the new table
-- ALTER TABLE cars DROP COLUMN IF EXISTS images;