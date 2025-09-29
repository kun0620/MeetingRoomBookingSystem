/*
  # Recreate RLS policy for bookings table to allow authenticated users to cancel bookings

  1. Security
    - Drop all existing UPDATE policies for 'authenticated' role on 'bookings' table.
    - Add a new RLS policy for authenticated users to update `status` to 'cancelled' on `bookings` table.
    - This policy ensures that only authenticated users can change a booking's status to 'cancelled'.
      The application layer (useBookings hook) is responsible for verifying the `department_code`.
*/

-- Drop all existing UPDATE policies for 'authenticated' role on 'bookings' table
DO $$
DECLARE
    policy_name text;
BEGIN
    FOR policy_name IN (
        SELECT polname
        FROM pg_policy
        WHERE polrelid = 'public.bookings'::regclass
          AND polcmd = 'u' -- UPDATE command
          AND EXISTS (
              SELECT 1
              FROM pg_roles
              WHERE oid = ANY(polroles)
                AND rolname = 'authenticated'
          )
    )
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON public.bookings;';
    END LOOP;
END
$$;

-- Ensure RLS is enabled for the bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create the specific policy to allow authenticated users to update status to 'cancelled'
CREATE POLICY "Allow authenticated users to update booking status to cancelled"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (true) -- Allows any authenticated user to attempt an update
  WITH CHECK (status = 'cancelled'); -- Ensures they can only change status to 'cancelled'
