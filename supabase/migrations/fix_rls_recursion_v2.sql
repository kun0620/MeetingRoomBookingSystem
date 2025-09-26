/*
  # Fix RLS Recursion on Users Table

  1. Changes
    - Drop existing admin RLS policies on `public.users` that caused recursion.
    - Re-create the `is_admin()` SECURITY DEFINER function.
    - Add a new RLS policy for `public.users` to allow `supabase_admin` to bypass RLS, preventing recursion when `is_admin()` queries `public.users`.
    - Re-create RLS policies for `admin_settings`, `rooms`, and `bookings` using the `is_admin()` function.
  2. Security
    - Ensure `EXECUTE` permission on `is_admin()` for `authenticated` role.
    - RLS policies are re-established to prevent recursion and maintain correct access control.
*/

-- Drop problematic RLS policies from 'users' table that caused recursion
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- Re-create the SECURITY DEFINER function to check if the current user is an admin
-- This function itself queries the 'users' table, so its execution needs to bypass RLS on 'users'.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Add a policy to allow the 'supabase_admin' role (which SECURITY DEFINER functions run as)
-- to bypass RLS on the 'users' table. This prevents recursion when is_admin() queries 'users'.
-- This policy should be evaluated before other policies for the 'users' table.
CREATE POLICY "Supabase admin bypass RLS on users"
  ON public.users
  FOR ALL
  TO supabase_admin
  USING (true)
  WITH CHECK (true);

-- Re-create RLS policies for 'admin_settings' table
DROP POLICY IF EXISTS "Admins can read settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.admin_settings;

CREATE POLICY "Admins can read settings"
  ON public.admin_settings
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can manage settings"
  ON public.admin_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Re-create RLS policies for 'rooms' table
-- "Anyone can read rooms" policy is already handled and should be fine.
DROP POLICY IF EXISTS "Admins can manage rooms" ON public.rooms;

CREATE POLICY "Admins can manage rooms"
  ON public.rooms
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Re-create RLS policies for 'bookings' table
DROP POLICY IF EXISTS "Users can manage own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'user_id') THEN
    CREATE POLICY "Users can manage own bookings"
      ON public.bookings
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE POLICY "Admins can manage all bookings"
  ON public.bookings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());