-- Add menu_display_mode column to restaurants table
-- This allows restaurants to choose between 'grid' or 'list' display modes for their menus

ALTER TABLE public.restaurants
ADD COLUMN IF NOT EXISTS menu_display_mode VARCHAR(10) DEFAULT 'grid' CHECK (menu_display_mode IN ('grid', 'list'));

-- Add comment to the column
COMMENT ON COLUMN public.restaurants.menu_display_mode IS 'Display mode for the restaurant menu: grid or list';

-- Update existing restaurants to use grid as default (no action needed due to DEFAULT clause)