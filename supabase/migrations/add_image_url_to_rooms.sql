/*
  # Update rooms table for image URLs

  1. Modified Tables
    - `rooms`
      - Add `image_url` (text, nullable, default '')
      - Remove `color` column
  2. Security
    - No changes to RLS policies for `rooms` table.
*/

DO $$
BEGIN
  -- Add image_url column if it does not exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE rooms ADD COLUMN image_url text DEFAULT '';
  END IF;

  -- Drop color column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rooms' AND column_name = 'color'
  ) THEN
    ALTER TABLE rooms DROP COLUMN color;
  END IF;
END $$;
