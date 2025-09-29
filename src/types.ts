export interface Room {
  id: string;
  name: string;
  capacity: number;
  description: string;
  amenities: string[];
  color: string;
  created_at: string;
}

export interface Booking {
  id: string;
  room_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  department_code: string; // Added department_code
  created_at: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  booking?: Booking;
}

export interface DepartmentCode {
  id: string;
  code: string;
  department_name: string;
  role: string;
  created_at: string;
}

export interface BookingStats {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  roomUsage: { [roomId: string]: number };
  departmentUsage: { [departmentCode: string]: number };
  monthlyBookings: { [month: string]: number };
}

export interface ExportData {
  bookings: Booking[];
  rooms: Room[];
  departmentCodes: DepartmentCode[];
}
