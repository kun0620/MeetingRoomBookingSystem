export interface Booking {
  id: string;
  room_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  title: string;
  description: string | null;
  start_time: string; // HH:MM:SS or HH:MM from DB
  end_time: string;   // HH:MM:SS or HH:MM from DB
  date: string;       // YYYY-MM-DD from DB
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  department_code: string; // Matches DB column name
  department_name: string | null;
  contact_person: string | null; // Matches DB column name
  contact_email: string | null;  // Matches DB column name
  created_at: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  description: string;
  amenities: string[];
  color: string;
  created_at: string;
}

export interface DepartmentCode {
  id: string;
  code: string;
  name: string; // Maps to department_name in DB
  role: string;
  created_at: string;
}
