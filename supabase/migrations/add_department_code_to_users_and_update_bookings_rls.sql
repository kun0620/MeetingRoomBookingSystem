/*
  # Add department_code to users table and update bookings RLS

  1. New Columns
    - `users`
      - `department_code` (text, nullable, foreign key to `department_codes.code`)
  2. Modified Tables
    - `bookings`
      - RLS policies updated to use `department_code` from `public.users` for ownership checks.
  3. Security
    - Enable RLS on `users` table (if not already).
    - Add policy for authenticated users to read their own `department_code` from `users` table.
    - Add policy for authenticated users to update their own `department_code` in `users` table.
    - Drop existing RLS policies on `bookings` to prevent conflicts.
    - Add new RLS policies for `bookings` based on `department_code` from `public.users`:
      - `Users can create bookings for their department`: Allows authenticated users to insert bookings where `bookings.department_code` matches their `users.department_code`.
      - `Users can view bookings for their department`: Allows authenticated users to select bookings where `bookings.department_code` matches their `users.department_code`.
      - `Users can update bookings for their department`: Allows authenticated users to update bookings where `bookings.department_code` matches their `users.department_code`.
      - `Users can cancel bookings for their department`: Allows authenticated users to change `status` to 'cancelled' for bookings where `bookings.department_code` matches their `users.department_code`.
      - Admin policies for `bookings` remain similar, checking `role = 'admin'` in `public.users`.

  Important Notes:
    - The `department_code` column in `users` is initially added as nullable.
    - Existing users will have `department_code` as NULL. They will need to set it or an admin will need to set it.
    - The `user_id` column is explicitly NOT added to `bookings` as per user's request.
*/

-- Add department_code column to public.users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'department_code'
  ) THEN
    ALTER TABLE public.users ADD COLUMN department_code text;
    -- Add foreign key constraint to department_codes.code
    ALTER TABLE public.users ADD CONSTRAINT fk_user_department_code FOREIGN KEY (department_code) REFERENCES public.department_codes(code);
  END IF;
END $$;

-- Enable RLS on public.users if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own profile (including department_code)
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy for users to update their own department_code (or other fields)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id); -- Ensure they can only update their own row

-- Drop existing policies on bookings to avoid conflicts (from previous attempts)
DROP POLICY IF EXISTS "Allow authenticated users to create bookings" ON bookings;
DROP POLICY IF EXISTS "Allow authenticated users to view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Allow authenticated users to update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Allow authenticated users to cancel their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings for themselves" ON bookings; -- From previous attempt
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;       -- From previous attempt
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;     -- From previous attempt
DROP POLICY IF EXISTS "Users can cancel their own bookings" ON bookings;     -- From previous attempt
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings; -- These admin policies will be recreated below
DROP POLICY IF EXISTS "Admins can update any booking" ON bookings;
DROP POLICY IF EXISTS "Admins can delete any booking" ON bookings;


-- Recreate policies for bookings based on department_code from public.users
CREATE POLICY "Users can create bookings for their department"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND department_code = bookings.department_code)
  );

CREATE POLICY "Users can view bookings for their department"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND department_code = bookings.department_code)
  );

CREATE POLICY "Users can update bookings for their department"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND department_code = bookings.department_code)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND department_code = bookings.department_code)
  );

CREATE POLICY "Users can cancel bookings for their department"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND department_code = bookings.department_code)
    AND status != 'cancelled'
  )
  WITH CHECK (
    status = 'cancelled' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND department_code = bookings.department_code)
  );

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