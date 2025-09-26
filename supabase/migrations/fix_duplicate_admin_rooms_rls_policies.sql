/*
  # Fix duplicate RLS policies for rooms table

  1. Security
    - Drop existing RLS policies for 'Admins can...' on `rooms` table if they exist.
    - Re-add RLS policies for `rooms` table to allow only users with `role = 'admin'` in `public.users` to perform CRUD operations.
*/

-- Drop existing policies for "Admins can..." to prevent "already exists" error
DROP POLICY IF EXISTS "Admins can read rooms" ON rooms;
DROP POLICY IF EXISTS "Admins can insert rooms" ON rooms;
DROP POLICY IF EXISTS "Admins can update rooms" ON rooms;
DROP POLICY IF EXISTS "Admins can delete rooms" ON rooms;

-- Re-create policies for admin users
CREATE POLICY "Admins can read rooms"
  ON rooms
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

CREATE POLICY "Admins can insert rooms"
  ON rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

CREATE POLICY "Admins can update rooms"
  ON rooms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

CREATE POLICY "Admins can delete rooms"
  ON rooms
  FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));