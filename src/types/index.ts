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