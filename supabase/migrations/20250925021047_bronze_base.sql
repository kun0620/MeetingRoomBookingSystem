/*
  # Add sample rooms with proper colors

  1. New Data
    - Insert sample meeting rooms with Thai names
    - Each room has different gradient colors
    - Include capacity and amenities for each room
  
  2. Room Details
    - ห้องใหญ่ ชั้น 2: Blue gradient, 12 people capacity
    - ห้องกลาง ชั้น 2: Green gradient, 8 people capacity  
    - ห้องเล็ก ชั้น 1: Orange gradient, 5 people capacity
*/

-- Insert sample rooms with proper Thai names and gradient colors
INSERT INTO rooms (id, name, capacity, description, amenities, color) VALUES
  ('large-room', 'ห้องใหญ่ ชั้น 2', 12, 'ห้องประชุมใหญ่สำหรับการประชุมใหญ่และงานสำคัญ', ARRAY['จอ LED TV', 'ระบบเสียง', 'WiFi', 'เครื่องปรับอากาศ'], 'from-blue-500 to-blue-600'),
  ('medium-room', 'ห้องกลาง ชั้น 2', 8, 'ห้องประชุมขนาดกลางเหมาะสำหรับการประชุมทีมงาน', ARRAY['โปรเจคเตอร์', 'WiFi', 'เครื่องปรับอากาศ'], 'from-green-500 to-green-600'),
  ('small-room', 'ห้องเล็ก ชั้น 1', 5, 'ห้องประชุมเล็กสำหรับการประชุมส่วนตัวและงานเร่งด่วน', ARRAY['โปรเจคเตอร์', 'WiFi', 'เครื่องปรับอากาศ'], 'from-orange-500 to-orange-600')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  capacity = EXCLUDED.capacity,
  description = EXCLUDED.description,
  amenities = EXCLUDED.amenities,
  color = EXCLUDED.color;
