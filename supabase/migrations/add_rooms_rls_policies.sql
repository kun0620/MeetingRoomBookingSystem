/*
  # Add RLS policies for rooms table

  1. Security
    - Enable RLS on `rooms` table
    - Add policy for authenticated users to read all room data
    - Add policy for authenticated users to insert new room data
    - Add policy for authenticated users to update existing room data
    - Add policy for authenticated users to delete room data
*/

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all rooms
CREATE POLICY "Authenticated users can read rooms"
  ON rooms
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert new rooms
CREATE POLICY "Authenticated users can insert rooms"
  ON rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update rooms
CREATE POLICY "Authenticated users can update rooms"
  ON rooms
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete rooms
CREATE POLICY "Authenticated users can delete rooms"
  ON rooms
  FOR DELETE
  TO authenticated
  USING (true);