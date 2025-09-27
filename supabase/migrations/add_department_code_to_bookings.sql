/*
      # Add department_code to bookings table

      1. Modified Tables
        - `bookings`
          - Added `department_code` (text, not null, default empty string)
      2. Security
        - No direct RLS changes, but policies might need adjustment if department_code is used for access control in the future.
    */

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings' AND column_name = 'department_code'
      ) THEN
        ALTER TABLE bookings ADD COLUMN department_code text NOT NULL DEFAULT '';
      END IF;
    END $$;