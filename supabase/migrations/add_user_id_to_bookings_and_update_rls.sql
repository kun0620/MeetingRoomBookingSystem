/*
  # Add user_id to bookings table and update RLS policies (FIXED)

  1. Modified Tables
    - `bookings`
      - Added `user_id` (uuid, foreign key to `users.id`, initially nullable)
  2. Security
    - Dropped existing RLS policies on `bookings` to prevent conflicts.
    - Added new RLS policies for `bookings`:
      - `Users can create bookings for themselves`: Allows authenticated users to insert bookings where `user_id` matches `auth.uid()`.
      - `Users can view their own bookings`: Allows authenticated users to select bookings where `user_id` matches `auth.uid()`.
      - `Users can update their own bookings`: Allows authenticated users to update bookings where `user_id` matches `auth.uid()`.
      - `Users can cancel their own bookings`: Allows authenticated users to change `status` to 'cancelled' for their own bookings.
      - `Admins can view all bookings`: Allows authenticated users with `role = 'admin'` in `public.users` to view all bookings.
      - `Admins can update any booking`: Allows authenticated users with `role = 'admin'` in `public.users` to update any booking.
      - `Admins can delete any booking`: Allows authenticated users with `role = 'admin'` in `public.users` to delete any booking.

  Important Notes:
    - The `user_id` column is initially added as nullable. Existing bookings will have `user_id` as NULL.
    - If `user_id` is required to be NOT NULL for all bookings in the future, a separate migration will be needed to populate NULL values with valid user IDs before setting the column to NOT NULL.
*/

-- Add user_id column to bookings table if it doesn't exist, allowing NULL initially
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN user_id uuid;
    -- No UPDATE statement here to avoid FK violation with gen_random_uuid()
    ALTER TABLE bookings ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES public.users(id);
    -- Do NOT set NOT NULL here, allow existing bookings to have NULL user_id
  END IF;
END $$;

-- Drop existing policies on bookings to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to create bookings" ON bookings;
DROP POLICY IF EXISTS "Allow authenticated users to view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Allow authenticated users to update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Allow authenticated users to cancel their own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can update any booking" ON bookings;
DROP POLICY IF EXISTS "Admins can delete any booking" ON bookings;

-- Recreate policies with user_id consideration and admin roles
CREATE POLICY "Users can create bookings for themselves"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can cancel their own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status != 'cancelled')
  WITH CHECK (status = 'cancelled' OR auth.uid() = user_id);

-- Admin policies (assuming 'admin' role in public.users)
CREATE POLICY "Admins can view all bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update any booking"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can delete any booking"
  ON bookings
  FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));