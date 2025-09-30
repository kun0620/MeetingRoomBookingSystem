export type Room = {
  id: string;
  name: string;
  capacity: number;
  description: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
};

export type Booking = {
  id: string;
  room_id: string;
  user_id: string;
  date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at: string;
  department_code?: string; // Optional for department code bookings
  user_name?: string; // For display purposes, not stored in DB
  room_name?: string; // For display purposes, not stored in DB
};

export type TimeSlot = {
  time: string;
  isBooked: boolean;
  bookingId?: string;
  purpose?: string;
  bookedBy?: string;
};

export type User = {
  id: string;
  email: string;
  name?: string;
  department_code?: string;
  is_active: boolean;
  role: 'user' | 'admin';
  created_at: string;
};

export type DepartmentCode = {
  id: string;
  code: string;
  department_name: string;
  role: 'user' | 'admin';
  created_at: string;
};

export type ViewMode = 'booking' | 'status' | 'admin' | 'user-dashboard'; // Added 'user-dashboard'
