export interface Room {
  id: string;
  name: string;
  capacity: number;
  description: string;
  amenities: string[];
  color: string;
}

export interface Booking {
  id: string;
  room_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  date: string;
  status: 'confirmed' | 'cancelled';
  created_at: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  booking?: Booking;
}

export interface CalendarDay {
  date: string;
  isToday: boolean;
  isSelected: boolean;
  hasBookings: boolean;
  bookingsCount: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminSettings {
  id: string;
  key: string;
  value: string;
  description?: string;
  updated_at: string;
}