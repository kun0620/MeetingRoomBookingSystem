export interface Room {
  id: string;
  name: string;
  capacity: number;
  description: string;
  image_url: string;
}

export interface Booking {
  id: string;
  room_id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  purpose: string;
  booked_by_email: string;
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
