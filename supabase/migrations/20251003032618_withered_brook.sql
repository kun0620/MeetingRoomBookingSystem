/*
  # Create system settings table for customization

  1. New Tables
    - `system_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - setting key like 'theme_primary_color', 'logo_url', etc.
      - `value` (jsonb) - setting value (can store objects, arrays, strings)
      - `category` (text) - category like 'theme', 'branding', 'operating_hours'
      - `description` (text) - human readable description
      - `updated_at` (timestamp)
      - `updated_by` (uuid) - user who updated the setting

  2. Security
    - Enable RLS on `system_settings` table
    - Add policy for admins to manage settings
    - Add policy for authenticated users to read settings

  3. Default Settings
    - Insert default theme colors
    - Insert default operating hours
    - Insert default branding settings
*/

CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  category text NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage all settings
CREATE POLICY "Admins can manage system settings"
  ON system_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- All authenticated users can read settings
CREATE POLICY "Authenticated users can read system settings"
  ON system_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Anonymous users can read public settings (for branding)
CREATE POLICY "Anonymous users can read public settings"
  ON system_settings
  FOR SELECT
  TO anon
  USING (category IN ('branding', 'theme'));

-- Insert default settings
INSERT INTO system_settings (key, value, category, description) VALUES
  -- Theme settings
  ('theme_primary_color', '"#3B82F6"', 'theme', 'Primary brand color'),
  ('theme_secondary_color', '"#1E40AF"', 'theme', 'Secondary brand color'),
  ('theme_accent_color', '"#10B981"', 'theme', 'Accent color for highlights'),
  ('theme_success_color', '"#059669"', 'theme', 'Success state color'),
  ('theme_warning_color', '"#D97706"', 'theme', 'Warning state color'),
  ('theme_error_color', '"#DC2626"', 'theme', 'Error state color'),
  
  -- Branding settings
  ('branding_logo_url', '""', 'branding', 'Organization logo URL'),
  ('branding_organization_name', '"ระบบจองห้องประชุม"', 'branding', 'Organization name'),
  ('branding_organization_subtitle', '"Meeting Room Booking System"', 'branding', 'Organization subtitle'),
  ('branding_favicon_url', '""', 'branding', 'Favicon URL'),
  
  -- Operating hours settings
  ('operating_hours_weekdays', '{"start": "08:00", "end": "17:00"}', 'operating_hours', 'Weekday operating hours'),
  ('operating_hours_saturday', '{"start": "09:00", "end": "16:00"}', 'operating_hours', 'Saturday operating hours'),
  ('operating_hours_sunday', '{"enabled": false, "start": "09:00", "end": "16:00"}', 'operating_hours', 'Sunday operating hours'),
  ('operating_hours_holidays', '{"enabled": false}', 'operating_hours', 'Holiday operating hours'),
  
  -- Time slot settings
  ('time_slot_duration', '30', 'operating_hours', 'Time slot duration in minutes'),
  ('booking_advance_days', '30', 'operating_hours', 'How many days in advance can users book'),
  ('booking_cancellation_hours', '2', 'operating_hours', 'Minimum hours before meeting to allow cancellation')

ON CONFLICT (key) DO NOTHING;

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_system_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_system_settings_timestamp
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_timestamp();