import { z } from 'zod';

export type Room = {
  id: string;
  name: string;
  description: string;
  capacity: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
  // เพิ่มฟิลด์เหล่านี้เพื่อให้ตรงกับการใช้งานใน AdminRooms.tsx
  amenities: string[];
  color: string;
};

export type Booking = {
  id: string;
  room_id: string;
  date: string;
  start_time: string;
  end_time: string;
  user_id: string; // เพิ่ม user_id
  user_name: string;
  user_email: string;
  user_phone: string;
  title: string;
  description?: string;
  department_code: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
};

export type TimeSlot = {
  time: string;
  end: string;
  available: boolean;
};

export type CalendarDay = {
  date: string;
  isToday: boolean;
  isSelected: boolean;
  hasBookings: boolean;
  bookingsCount: number;
};

export type ViewMode = 'booking' | 'status' | 'admin' | 'user-dashboard';

export type User = {
  id: string;
  email: string;
  name?: string;
  phone?: string; // เพิ่ม phone field
  department_code?: string;
  is_active: boolean;
  role: 'admin' | 'user';
  created_at: string;
  updated_at?: string; // เพิ่ม updated_at field
};

export type DepartmentCode = {
  id: string;
  code: string;
  department_name: string;
  role: 'admin' | 'user';
  created_at: string;
};

// Zod schemas for validation
export const departmentCodeSchema = z.object({
  code: z.string().min(2, { message: 'รหัสแผนกต้องมีอย่างน้อย 2 ตัวอักษร' }).max(10, { message: 'รหัสแผนกต้องไม่เกิน 10 ตัวอักษร' }).regex(/^[A-Z0-9]+$/, { message: 'รหัสแผนกต้องเป็นตัวอักษรภาษาอังกฤษตัวพิมพ์ใหญ่หรือตัวเลขเท่านั้น' }),
  department_name: z.string().min(3, { message: 'ชื่อแผนกต้องมีอย่างน้อย 3 ตัวอักษร' }).max(100, { message: 'ชื่อแผนกต้องไม่เกิน 100 ตัวอักษร' }),
  role: z.enum(['admin', 'user'], { message: 'บทบาทไม่ถูกต้อง' }),
});

export const userSchema = z.object({
  email: z.string().email({ message: 'รูปแบบอีเมลไม่ถูกต้อง' }),
  name: z.string().min(3, { message: 'ชื่อต้องมีอย่างน้อย 3 ตัวอักษร' }).max(100, { message: 'ชื่อต้องไม่เกิน 100 ตัวอักษร' }),
  phone: z.string().optional().refine(val => !val || /^\d{9,10}$/.test(val), {
    message: 'เบอร์โทรศัพท์ต้องมี 9-10 หลักและเป็นตัวเลขเท่านั้น'
  }),
  role: z.enum(['admin', 'user'], { message: 'บทบาทไม่ถูกต้อง' }),
  is_active: z.boolean(),
});
