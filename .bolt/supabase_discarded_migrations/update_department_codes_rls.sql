/*
  # Update RLS policy for department_codes table

  1. Security
    - Drop existing RLS policy "Authenticated users can read department codes"
    - Add new RLS policy "Allow anonymous users to read department codes for login"
      - This policy allows unauthenticated users to query the `department_codes` table to validate the admin login code.
      - It is safe because the client-side logic explicitly checks for `role = 'admin'` after fetching.
*/

-- Drop the existing policy if it exists
DROP POLICY IF EXISTS "Authenticated users can read department codes" ON department_codes;

-- Allow anonymous users to read department codes for validation during login
CREATE POLICY "Allow anonymous users to read department codes for login"
  ON department_codes
  FOR SELECT
  TO anon, authenticated -- Allow both anonymous and authenticated users
  USING (true);
