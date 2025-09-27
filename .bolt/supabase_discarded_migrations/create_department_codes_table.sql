/*
  # Create department_codes table for custom admin login

  1. New Tables
    - `department_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique, not null) - The department code for login
      - `department_name` (text, not null) - Name of the department
      - `role` (text, not null, default 'user') - Role associated with this code (e.g., 'admin')
      - `created_at` (timestamptz, default now())
  2. Security
    - Enable RLS on `department_codes` table
    - Add policy for authenticated users to read department codes (for login validation)
  3. Important Notes
    - This table is used for a custom login flow (department code) and does NOT directly integrate with Supabase's `auth.users` table for session management.
    - Users logging in with a department code will NOT have a `supabase.auth.user` session.
    - RLS policies that rely on `auth.uid()` will NOT apply to users authenticated via department codes.
    - To grant data access to department code admins, RLS policies on other tables must be adjusted to check the `role` column in `public.users` (if a corresponding user is created/updated) or use Supabase Edge Functions with service role key for privileged operations.
*/

CREATE TABLE IF NOT EXISTS department_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  department_name text NOT NULL,
  role text NOT NULL DEFAULT 'user', -- e.g., 'admin', 'user'
  created_at timestamptz DEFAULT now()
);

ALTER TABLE department_codes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read department codes for validation during login
CREATE POLICY "Authenticated users can read department codes"
  ON department_codes
  FOR SELECT
  TO authenticated
  USING (true);

-- Optional: Policy for admins to manage department codes (if needed)
-- CREATE POLICY "Admins can manage department codes"
--   ON department_codes
--   FOR ALL
--   TO authenticated
--   USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin')
--   WITH CHECK ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
