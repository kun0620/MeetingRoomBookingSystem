/*
  # Update RLS policies for rooms table to restrict to admin role

  1. Security
    - Drop existing RLS policies on `rooms` table
    - Add new policies for `rooms` table to allow only users with `role = 'admin'` in `public.users` to perform CRUD operations.
*/

-- Drop existing policies to replace them
DROP POLICY IF EXISTS "Authenticated users can read rooms" ON rooms;
DROP POLICY IF EXISTS "Authenticated users can insert rooms" ON rooms;
DROP POLICY IF EXISTS "Authenticated users can update rooms" ON rooms;
DROP POLICY IF EXISTS "Authenticated users can delete rooms" ON rooms;

-- Allow only admin users to read rooms
CREATE POLICY "Admins can read rooms"
  ON rooms
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Allow only admin users to insert new rooms
CREATE POLICY "Admins can insert rooms"
  ON rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Allow only admin users to update rooms
CREATE POLICY "Admins can update rooms" -- เพิ่ม CREATE POLICY ที่หายไป
  ON rooms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));

-- Allow only admin users to delete rooms
CREATE POLICY "Admins can delete rooms"
  ON rooms
  FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'));
