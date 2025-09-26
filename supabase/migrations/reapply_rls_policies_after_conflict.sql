/*
  # Reapply RLS Policies After Conflict Resolution

  1. Changes
    - Explicitly drop the conflicting "Anyone can read rooms" policy.
    - Drop all RLS policies that were intended to be re-created by the previous `fix_rls_recursion.sql` migration to ensure a clean application.
    - Re-create the `is_admin()` SECURITY DEFINER function.
    - Re-create all RLS policies for `users`, `admin_settings`, `rooms`, and `bookings` using the `is_admin()` function for admin access, and appropriate policies for public/authenticated users.
  2. Security
    - Ensure `EXECUTE` permission on `is_admin()` for `authenticated` role.
    - All RLS policies are re-established to prevent recursion and maintain correct access control.
*/

-- Drop the specific conflicting policy
DROP POLICY IF EXISTS "Anyone can read rooms" ON public.rooms;

-- Drop all policies that were intended to be re-created by the previous migration
-- This ensures a clean slate before re-applying them
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Admins can read settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can manage rooms" ON public.rooms;
DROP POLICY IF EXISTS "Users can manage own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;

-- Re-create the SECURITY DEFINER function to check if the current user is an admin
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

-- Drop problematic RLS policies from the previous migration (20250926013736_twilight_delta.sql)
-- These policies caused infinite recursion by querying the 'users' table within their own definition.
DROP POLICY IF EXISTS "Anyone can read users" ON public.users;
DROP POLICY IF EXISTS "Only admins can manage users" ON public.users;
DROP POLICY IF EXISTS "Only admins can read settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Only admins can manage settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Anyone can read active rooms" ON public.rooms;
DROP POLICY IF EXISTS "Only admins can manage rooms" ON public.rooms;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;


-- Re-create RLS policies for 'users' table
-- Keep existing policies for users to manage their own data (from create_users_table.sql)
-- Add new policies for admin access using the is_admin() function

-- Policy for admins to read all users
CREATE POLICY "Admins can read all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Policy for admins to manage all users (insert, update, delete)
CREATE POLICY "Admins can manage all users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- Re-create RLS policies for 'admin_settings' table
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
-- Allow anyone to read rooms (public access)
CREATE POLICY "Anyone can read rooms"
  ON public.rooms
  FOR SELECT
  TO public
  USING (true);

-- Allow admins to manage all rooms
CREATE POLICY "Admins can manage rooms"
  ON public.rooms
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- Re-create RLS policies for 'bookings' table
-- Assuming there's a 'user_id' column in 'bookings' for individual user access
-- If not, adjust the 'Users can manage own bookings' policy or remove it if not applicable.
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

-- Allow admins to manage all bookings
CREATE POLICY "Admins can manage all bookings"
  ON public.bookings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());