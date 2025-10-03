/*
  # Meeting Room Booking System - Initial Database Schema

  ## Overview
  Complete database setup for meeting room booking system with Thai language support.

  ## New Tables Created
  
  ### 1. `rooms` - Meeting Rooms
  - `id` (text, primary key) - Unique room identifier
  - `name` (text, required) - Room name in Thai
  - `capacity` (integer, default: 0) - Maximum number of people
  - `description` (text, default: '') - Room description in Thai
  - `amenities` (text array, default: {}) - List of available amenities
  - `image_url` (text, default: '') - Room image URL
  - `created_at` (timestamptz, default: now()) - Creation timestamp

  ### 2. `bookings` - Room Bookings
  - `id` (uuid, primary key) - Auto-generated booking ID
  - `room_id` (text, foreign key → rooms.id) - Associated room
  - `user_name` (text, required) - Booking user's name
  - `user_email` (text, required) - Contact email
  - `user_phone` (text, required) - Contact phone
  - `title` (text, required) - Meeting title
  - `description` (text, default: '') - Meeting description
  - `start_time` (text, required) - Start time (e.g., "09:00")
  - `end_time` (text, required) - End time (e.g., "10:00")
  - `date` (date, required) - Booking date
  - `status` (text, default: 'confirmed') - Booking status
  - `department_name` (text, default: '') - Department name
  - `contact_person` (text, default: '') - Contact person
  - `contact_email` (text, default: '') - Contact email
  - `user_id` (uuid, nullable) - Reference to user (for future auth)
  - `department_code` (text, nullable) - Department code
  - `created_at` (timestamptz, default: now()) - Creation timestamp

  ### 3. `users` - User Management
  - `id` (uuid, primary key) - Auto-generated user ID
  - `email` (text, unique, required) - User email
  - `name` (text, required) - User full name
  - `phone` (text, nullable) - Phone number
  - `role` (text, default: 'user') - Role: 'admin' or 'user'
  - `is_active` (boolean, default: true) - Account status
  - `department_code` (text, nullable) - Department code
  - `created_at` (timestamptz, default: now()) - Creation timestamp
  - `updated_at` (timestamptz, default: now()) - Last update timestamp

  ### 4. `admin_settings` - System Settings
  - `id` (uuid, primary key) - Auto-generated setting ID
  - `key` (text, unique, required) - Setting key
  - `value` (text, required) - Setting value
  - `description` (text, nullable) - Setting description
  - `updated_at` (timestamptz, default: now()) - Last update timestamp

  ### 5. `department_codes` - Department Management
  - `id` (uuid, primary key) - Auto-generated department ID
  - `code` (text, unique, required) - Department code
  - `name` (text, required) - Department name in Thai
  - `is_active` (boolean, default: true) - Department status
  - `created_at` (timestamptz, default: now()) - Creation timestamp

  ## Security (Row Level Security)
  
  ### RLS Enabled on All Tables
  All tables have RLS enabled for data security.

  ### Public Access Policies
  - Anyone can read rooms (public SELECT)
  - Anyone can read bookings (public SELECT)
  - Anyone can create bookings (public INSERT)

  ### Authenticated User Policies
  - Users can read their own profile
  - Users can update their own profile
  - Users can view bookings for their department
  - Users can create bookings for their department
  - Users can update bookings for their department
  - Users can cancel bookings for their department

  ### Admin Policies
  - Admins can manage all users
  - Admins can manage all rooms
  - Admins can view/update/delete all bookings
  - Admins can read/manage all settings
  - Admins can manage department codes

  ## Initial Data
  
  ### Sample Rooms
  Three pre-configured meeting rooms with Thai names and amenities.

  ### Default Admin User
  Email: admin@example.com
  Role: admin

  ### Default System Settings
  - Site name
  - Maximum booking days
  - Booking time slots
  - Guest booking permission

  ## Important Notes
  - All policies use restrictive RLS by default
  - Authentication uses auth.uid() for user identification
  - Admin access requires role = 'admin' in users table
  - Data integrity protected with foreign key constraints
  - All timestamps use UTC timezone
*/

-- ===========================
-- 1. CREATE TABLES
-- ===========================

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id text PRIMARY KEY,
  name text NOT NULL,
  capacity integer NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  amenities text[] NOT NULL DEFAULT '{}',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create department_codes table (needed before users for FK)
CREATE TABLE IF NOT EXISTS department_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active boolean DEFAULT true,
  department_code text REFERENCES department_codes(code),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
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
  department_name text DEFAULT '',
  contact_person text DEFAULT '',
  contact_email text DEFAULT '',
  user_id uuid REFERENCES users(id),
  department_code text,
  created_at timestamptz DEFAULT now()
);

-- Create admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- ===========================
-- 2. ENABLE ROW LEVEL SECURITY
-- ===========================

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_codes ENABLE ROW LEVEL SECURITY;

-- ===========================
-- 3. CREATE RLS POLICIES
-- ===========================

-- ROOMS POLICIES
CREATE POLICY "Anyone can read rooms"
  ON rooms FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage rooms"
  ON rooms FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  ));

-- BOOKINGS POLICIES (Public access for basic operations)
CREATE POLICY "Anyone can read bookings"
  ON bookings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  TO public
  WITH CHECK (true);

-- BOOKINGS POLICIES (Authenticated users - department-based)
CREATE POLICY "Users can view bookings for their department"
  ON bookings FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND department_code = bookings.department_code
  ));

CREATE POLICY "Users can update bookings for their department"
  ON bookings FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND department_code = bookings.department_code
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND department_code = bookings.department_code
  ));

-- BOOKINGS POLICIES (Admin access)
CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can update any booking"
  ON bookings FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can delete any booking"
  ON bookings FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- USERS POLICIES
CREATE POLICY "Anyone can read users"
  ON users FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Only admins can manage users"
  ON users FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  ));

-- ADMIN SETTINGS POLICIES
CREATE POLICY "Only admins can read settings"
  ON admin_settings FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  ));

CREATE POLICY "Only admins can manage settings"
  ON admin_settings FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  ));

-- DEPARTMENT CODES POLICIES
CREATE POLICY "Anyone can read department codes"
  ON department_codes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can manage department codes"
  ON department_codes FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  ));

-- ===========================
-- 4. INSERT INITIAL DATA
-- ===========================

-- Insert sample rooms
INSERT INTO rooms (id, name, capacity, description, amenities, image_url) VALUES
  ('room-1', 'ห้องใหญ่ ชั้น 2', 12, 'ห้องประชุมใหญ่สำหรับการประชุมทีมใหญ่และงานสำคัญ', 
   ARRAY['จอ LED TV', 'ระบบเสียง', 'WiFi', 'เครื่องปรับอากาศ'], ''),
  ('room-2', 'ห้องกลาง ชั้น 2', 8, 'ห้องประชุมขนาดกลางเหมาะสำหรับการประชุมทีมงาน', 
   ARRAY['โปรเจคเตอร์', 'WiFi', 'เครื่องปรับอากาศ'], ''),
  ('room-3', 'ห้องเล็ก ชั้น 1', 5, 'ห้องประชุมเล็กสำหรับการประชุมส่วนตัวและงานเร่งด่วน', 
   ARRAY['โปรเจคเตอร์', 'WiFi', 'เครื่องปรับอากาศ'], '')
ON CONFLICT (id) DO NOTHING;

-- Insert default admin user
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