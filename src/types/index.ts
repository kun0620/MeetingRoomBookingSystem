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
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
};

export type User = {
  id: string;
  email: string;
  name?: string;
  department_code?: string;
};

export type CalendarDay = {
  date: string;
  isToday: boolean;
  isSelected: boolean;
  hasBookings: boolean;
  bookingsCount: number;
};

export type ViewMode = 'booking' | 'status' | 'admin'; // Updated type
