-- Add image_urls column to menu_items table for multiple images support
ALTER TABLE menu_items ADD COLUMN image_urls jsonb;