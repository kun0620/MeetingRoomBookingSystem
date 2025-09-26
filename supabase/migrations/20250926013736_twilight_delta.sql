/*
  # Admin System Setup

  1. New Tables
    - `users` - ระบบสมาชิก
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `role` (text, default 'user')
      - `created_at` (timestamp)
    
    - `admin_settings` - การตั้งค่าระบบ
      - `id` (uuid, primary key)
      - `key` (text, unique)
      - `value` (text)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
    - Add policies for user management

  3. Changes
    - Add admin role support
    - Add user management system
    - Add admin settings
*/

-- Create users table for member management
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Anyone can read users"
  ON users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage users"
  ON users
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Admin settings policies
CREATE POLICY "Only admins can read settings"
  ON admin_settings
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      AND role = 'admin'
      AND is_active = true
    )
  );

CREATE POLICY "Only admins can manage settings"
  ON admin_settings
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Update rooms table policies for admin management
DROP POLICY IF EXISTS "Anyone can read rooms" ON rooms;

CREATE POLICY "Anyone can read active rooms"
  ON rooms
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage rooms"
  ON rooms
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Update bookings policies for admin management
DROP POLICY IF EXISTS "Anyone can update their bookings" ON bookings;

CREATE POLICY "Admins can manage all bookings"
  ON bookings
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
      AND role = 'admin'
      AND is_active = true
    )
  );

-- Insert default admin user (you should change this email)
INSERT INTO users (email, name, role) 
VALUES ('admin@example.com', 'System Administrator', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert default settings
INSERT INTO admin_settings (key, value, description) VALUES
  ('site_name', 'ระบบจองห้องประชุม', 'ชื่อเว็บไซต์'),
  ('max_booking_days', '30', 'จำนวนวันสูงสุดที่สามารถจองล่วงหน้าได้'),
  ('booking_time_slots', '30', 'ช่วงเวลาการจอง (นาที)'),
  ('allow_guest_booking', 'true', 'อนุญาตให้ผู้ใช้ทั่วไปจองได้')
ON CONFLICT (key) DO NOTHING;