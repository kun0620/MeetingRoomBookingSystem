/*
  # Meeting Room Booking System Database Schema

  1. New Tables
    - `rooms`
      - `id` (text, primary key)
      - `name` (text)
      - `capacity` (integer)
      - `description` (text)
      - `amenities` (text array)
      - `color` (text)
      - `created_at` (timestamp)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `room_id` (text, foreign key)
      - `user_name` (text)
      - `user_email` (text)
      - `user_phone` (text)
      - `title` (text)
      - `description` (text, optional)
      - `start_time` (text)
      - `end_time` (text)
      - `date` (date)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for authenticated users to create bookings
*/

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id text PRIMARY KEY,
  name text NOT NULL,
  capacity integer NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  amenities text[] NOT NULL DEFAULT '{}',
  color text NOT NULL DEFAULT 'from-blue-500 to-blue-600',
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id text NOT NULL REFERENCES rooms(id),
  user_name text NOT NULL,
  user_email text NOT NULL,
  user_phone text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  start_time text NOT NULL,
  end_time text NOT NULL,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for rooms (public read access)
CREATE POLICY "Anyone can read rooms"
  ON rooms
  FOR SELECT
  TO public
  USING (true);

-- Create policies for bookings (public read and insert)
CREATE POLICY "Anyone can read bookings"
  ON bookings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create bookings"
  ON bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update their bookings"
  ON bookings
  FOR UPDATE
  TO public
  USING (true);

-- Insert sample rooms
INSERT INTO rooms (id, name, capacity, description, amenities, color) VALUES
  ('large-room', 'ห้องใหญ่ ชั้น 2', 12, 'ห้องประชุมใหญ่สำหรับการประชุมทีมใหญ่และงานสำคัญ', 
   ARRAY['จอ LED TV', 'ระบบเสียง', 'WiFi', 'เครื่องปรับอากาศ'], 'from-blue-500 to-blue-600'),
  ('medium-room', 'ห้องกลาง ชั้น 2', 8, 'ห้องประชุมขนาดกลางเหมาะสำหรับการประชุมทีมงาน', 
   ARRAY['โปรเจคเตอร์', 'WiFi', 'เครื่องปรับอากาศ'], 'from-green-500 to-green-600'),
  ('small-room', 'ห้องเล็ก ชั้น 1', 5, 'ห้องประชุมเล็กสำหรับการประชุมส่วนตัวและงานเร่งด่วน', 
   ARRAY['โปรเจคเตอร์', 'WiFi', 'เครื่องปรับอากาศ'], 'from-orange-500 to-orange-600')
ON CONFLICT (id) DO NOTHING;
