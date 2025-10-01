import { z } from 'zod';

export type Room = {
  id: string;
  name: string;
  capacity: number;
  description: string;
  image_url: string;
  created_at: string;
};

export type TimeSlot = {
  id: string;
  time: string;
};

export type Booking = {
  id: string;
  room_id: string;
  date: string;
  start_time: string;
  end_time: string;
  title: string;
  department_name: string; // Added for display
  department_code: string; // For cancellation verification
  contact_person: string;
  contact_email: string;
  user_name: string; // เพิ่ม user_name
  user_email: string; // เพิ่ม user_email
  user_phone: string; // เพิ่ม user_phone
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
};

export type User = {
  id: string;
  email: string;
  name?: string;
  role?: string;
  department_code?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type DepartmentCode = {
  id: string;
  code: string;
  department_name: string;
  role: 'admin' | 'user';
  created_at: string;
};

export type CalendarDay = {
  date: string;
  isToday: boolean;
  isSelected: boolean;
  hasBookings: boolean;
  bookingsCount: number;
};

export type ViewMode = 'booking' | 'status' | 'admin'; // Updated type

// Zod Schemas for validation
export const userSchema = z.object({
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').min(1, 'กรุณากรอกอีเมล'),
  name: z.string().min(1, 'กรุณากรอกชื่อ'),
  phone: z.string().optional(),
  role: z.enum(['admin', 'user'], { message: 'บทบาทไม่ถูกต้อง' }).default('user'),
  is_active: z.boolean().default(true),
});

export const departmentCodeSchema = z.object({
  code: z.string().min(1, 'กรุณากรอกรหัสแผนก').max(10, 'รหัสแผนกต้องไม่เกิน 10 ตัวอักษร').regex(/^[A-Z0-9]+$/, 'รหัสแผนกต้องเป็นตัวอักษรภาษาอังกฤษตัวพิมพ์ใหญ่หรือตัวเลขเท่านั้น'),
  department_name: z.string().min(1, 'กรุณากรอกชื่อแผนก'),
  role: z.enum(['admin', 'user'], { message: 'สิทธิ์การใช้งานไม่ถูกต้อง' }).default('user'),
});
