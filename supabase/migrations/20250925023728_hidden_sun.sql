/*
  # Fix rooms data and ensure proper structure

  1. Update existing rooms with proper data
  2. Insert sample rooms if none exist
  3. Ensure all required fields have values
*/

-- First, let's check if we have any rooms
DO $$
BEGIN
  -- If no rooms exist, insert sample data
  IF NOT EXISTS (SELECT 1 FROM rooms LIMIT 1) THEN
    INSERT INTO rooms (id, name, capacity, description, amenities, color) VALUES
    ('room-1', 'ห้องใหญ่ ชั้น 2', 12, 'ห้องประชุมใหญ่สำหรับการประชุมใหญ่และงานสำคัญ', 
     ARRAY['จอ LED TV', 'ระบบเสียง', 'WiFi', 'เครื่องปรับอากาศ'], 'from-blue-500 to-blue-600'),
    
    ('room-2', 'ห้องกลาง ชั้น 2', 8, 'ห้องประชุมขนาดกลางเหมาะสำหรับการประชุมทีมงาน', 
     ARRAY['โปรเจคเตอร์', 'WiFi', 'เครื่องปรับอากาศ'], 'from-green-500 to-green-600'),
    
    ('room-3', 'ห้องเล็ก ชั้น 1', 5, 'ห้องประชุมเล็กสำหรับการประชุมส่วนตัวและงานด่วน', 
     ARRAY['โปรเจคเตอร์', 'WiFi', 'เครื่องปรับอากาศ'], 'from-orange-500 to-orange-600');
  ELSE
    -- Update existing rooms to ensure they have proper data
    UPDATE rooms SET 
      color = CASE 
        WHEN id = 'room-1' THEN 'from-blue-500 to-blue-600'
        WHEN id = 'room-2' THEN 'from-green-500 to-green-600'
        WHEN id = 'room-3' THEN 'from-orange-500 to-orange-600'
        ELSE 'from-blue-500 to-blue-600'
      END,
      name = CASE 
        WHEN name IS NULL OR name = '' THEN 'ห้องประชุม'
        ELSE name
      END,
      capacity = CASE 
        WHEN capacity IS NULL OR capacity = 0 THEN 8
        ELSE capacity
      END,
      description = CASE 
        WHEN description IS NULL OR description = '' THEN 'ห้องประชุมสำหรับการประชุม'
        ELSE description
      END,
      amenities = CASE 
        WHEN amenities IS NULL OR array_length(amenities, 1) IS NULL THEN ARRAY['WiFi', 'เครื่องปรับอากาศ']
        ELSE amenities
      END;
  END IF;
END $$;
