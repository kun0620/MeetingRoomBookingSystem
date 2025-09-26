/*
  # Create users table and integrate with Supabase Auth

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users(id))
      - `email` (text, unique, not null)
      - `is_active` (boolean, default true)
      - `role` (text, default 'user')
      - `created_at` (timestamptz, default now())
  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read their own data
    - Add policy for authenticated users to insert their own data (on signup)
    - Add policy for authenticated users to update their own data
    - Add policy for authenticated users to delete their own data
  3. Important Notes
    - To create an admin user, you must first sign up a user via the application or Supabase Auth UI.
    - Then, manually update their `role` to 'admin' in the `public.users` table in Supabase Studio.
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id), -- Link to Supabase Auth user ID
  email text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy for authenticated users to insert their own data (e.g., on signup)
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy for authenticated users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy for authenticated users to delete their own data
CREATE POLICY "Users can delete own data"
  ON users
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);