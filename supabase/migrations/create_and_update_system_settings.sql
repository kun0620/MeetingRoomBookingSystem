/*
      # Create and Update system_settings table

      1. New Tables
        - `system_settings`
          - `id` (uuid, primary key)
          - `key` (text, unique, not null)
          - `value` (jsonb, stores various setting values)
          - `category` (text, for grouping settings)
          - `description` (text, optional description)
          - `created_at` (timestamptz, default now())
          - `updated_at` (timestamptz, default now())
          - `updated_by` (text, optional, to track who updated)
      2. Security
        - Enable RLS on `system_settings` table
        - Add policy for authenticated users to read all system settings
        - Add policy for authenticated users to update system settings
      3. Changes
        - Ensures `value` column is `jsonb` to store complex data types.
        - Adds `category`, `description`, `updated_at`, `updated_by` columns.
        - Sets `key` as a unique constraint.
    */

    -- Create system_settings table if it doesn't exist
    CREATE TABLE IF NOT EXISTS system_settings (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      key text UNIQUE NOT NULL,
      value jsonb DEFAULT '{}'::jsonb NOT NULL,
      category text DEFAULT 'General' NOT NULL,
      description text,
      created_at timestamptz DEFAULT now() NOT NULL,
      updated_at timestamptz DEFAULT now() NOT NULL,
      updated_by text
    );

    -- Add missing columns if they don't exist
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'system_settings' AND column_name = 'category') THEN
        ALTER TABLE system_settings ADD COLUMN category text DEFAULT 'General' NOT NULL;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'system_settings' AND column_name = 'description') THEN
        ALTER TABLE system_settings ADD COLUMN description text;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'system_settings' AND column_name = 'updated_at') THEN
        ALTER TABLE system_settings ADD COLUMN updated_at timestamptz DEFAULT now() NOT NULL;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'system_settings' AND column_name = 'updated_by') THEN
        ALTER TABLE system_settings ADD COLUMN updated_by text;
      END IF;
    END $$;

    -- Ensure 'value' column is of type jsonb
    DO $$
    BEGIN
      IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'system_settings' AND column_name = 'value') != 'jsonb' THEN
        ALTER TABLE system_settings ALTER COLUMN value TYPE jsonb USING value::text::jsonb;
      END IF;
    END $$;

    -- Enable Row Level Security
    ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

    -- Policy for authenticated users to read settings
    CREATE POLICY "Authenticated users can read system settings"
      ON system_settings
      FOR SELECT
      TO authenticated
      USING (true);

    -- Policy for authenticated users to update settings
    CREATE POLICY "Authenticated users can update system settings"
      ON system_settings
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);

    -- Initial data for system settings if not already present
    INSERT INTO system_settings (key, value, category, description)
    VALUES
      ('theme_primary_color', '"#3B82F6"'::jsonb, 'Theme', 'Primary color for the application'),
      ('theme_secondary_color', '"#1E40AF"'::jsonb, 'Theme', 'Secondary color for the application'),
      ('theme_accent_color', '"#10B981"'::jsonb, 'Theme', 'Accent color for the application'),
      ('theme_success_color', '"#059669"'::jsonb, 'Theme', 'Success state color'),
      ('theme_warning_color', '"#D97706"'::jsonb, 'Theme', 'Warning state color'),
      ('theme_error_color', '"#DC2626"'::jsonb, 'Theme', 'Error state color'),
      ('branding_logo_url', '""'::jsonb, 'Branding', 'URL for the organization logo'),
      ('branding_organization_name', '"ระบบจองห้องประชุม"'::jsonb, 'Branding', 'Name of the organization'),
      ('branding_organization_subtitle', '"Meeting Room Booking System"'::jsonb, 'Branding', 'Subtitle for the organization'),
      ('branding_favicon_url', '""'::jsonb, 'Branding', 'URL for the favicon'),
      ('operating_hours_weekdays', '{"start": "08:00", "end": "17:00"}'::jsonb, 'Operating Hours', 'Operating hours for weekdays'),
      ('operating_hours_saturday', '{"start": "09:00", "end": "16:00"}'::jsonb, 'Operating Hours', 'Operating hours for Saturday'),
      ('operating_hours_sunday', '{"enabled": false, "start": "09:00", "end": "16:00"}'::jsonb, 'Operating Hours', 'Operating hours for Sunday'),
      ('operating_hours_holidays', '{"enabled": false}'::jsonb, 'Operating Hours', 'Operating hours for holidays'),
      ('time_slot_duration', '30'::jsonb, 'Booking', 'Duration of each booking time slot in minutes'),
      ('booking_advance_days', '30'::jsonb, 'Booking', 'Number of days in advance bookings can be made'),
      ('booking_cancellation_hours', '2'::jsonb, 'Booking', 'Number of hours before a booking can be cancelled')
    ON CONFLICT (key) DO NOTHING;