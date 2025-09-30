export type Room = {
  id: string;
  name: string;
  description: string;
  capacity: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
};

export type Booking = {
  id: string;
  room_id: string;
  date: string;
  start_time: string;
  end_time: string;
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
  time: string; // Changed from 'start' to 'time' to match baseTimeSlots
  end: string;
  available: boolean; // Changed from 'isBooked' and 'isPast' to a single 'available'
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
  name?: string; // Added name field
  department_code?: string;
  is_active: boolean;
  role: 'admin' | 'user';
  created_at: string;
};

export type DepartmentCode = {
  id: string;
  code: string;
  department_name: string;
  role: 'admin' | 'user';
  created_at: string;
};
