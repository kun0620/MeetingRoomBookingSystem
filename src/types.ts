export interface Room {
  id: string;
  name: string;
  capacity: number;
  description: string;
  amenities: string[]; // เพิ่มฟิลด์ amenities
  color: string;       // เพิ่มฟิลด์ color
  created_at: string;  // เพิ่มฟิลด์ created_at
}

export interface Booking {
  id: string;
  room_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  title: string;
  description: string | null;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export interface TimeSlot {
  time: string; // HH:MM
  available: boolean;
  booking?: Booking; // Optional: if a slot is booked, include the booking info
}

export interface User {
  id: string; // uuid, linked to auth.users.id
  email: string;
  is_active: boolean;
  role: 'admin' | 'user';
  created_at: string; // timestamptz
}

export interface DepartmentCode {
  id: string;
  code: string;
  department_name: string;
  role: 'admin' | 'user';
  created_at: string;
}
