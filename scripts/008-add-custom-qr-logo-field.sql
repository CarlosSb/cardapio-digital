-- Add custom QR logo field to restaurants table
-- This allows restaurants to have a separate logo specifically for QR codes

ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS custom_qr_logo_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN restaurants.custom_qr_logo_url IS 'URL of custom logo for QR codes (paid plans only)';