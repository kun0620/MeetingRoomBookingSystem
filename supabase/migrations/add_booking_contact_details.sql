/*
  # Add contact details to bookings table

  1. Modified Tables
    - `bookings`
      - Add `department_name` (text, nullable, default '')
      - Add `contact_person` (text, nullable, default '')
      - Add `contact_email` (text, nullable, default '')
  2. Security
    - Update RLS policy for `bookings` table to allow authenticated users to update their own bookings.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'department_name') THEN
    ALTER TABLE bookings ADD COLUMN department_name text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'contact_person') THEN
    ALTER TABLE bookings ADD COLUMN contact_person text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'contact_email') THEN
    ALTER TABLE bookings ADD COLUMN contact_email text DEFAULT '';
  END IF;
END $$;

-- Update RLS policy to allow authenticated users to update their own bookings
-- Assuming a policy already exists for authenticated users to read their own bookings.
-- If not, a new policy for UPDATE should be created.
-- This example assumes user_email in bookings matches auth.email() for ownership.
-- Adjust policy logic if ownership is determined by auth.uid() or another field.
CREATE POLICY "Authenticated users can update their own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.email() = user_email)
  WITH CHECK (auth.email() = user_email);