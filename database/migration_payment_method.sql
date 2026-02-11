-- Add payment_method column to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'espece';
-- Optional: Update existing records to have a default value
UPDATE bookings
SET payment_method = 'espece'
WHERE payment_method IS NULL;