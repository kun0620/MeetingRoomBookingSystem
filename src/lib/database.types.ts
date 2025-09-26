export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          is_active: boolean
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          is_active?: boolean
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          is_active?: boolean
          role?: string
          created_at?: string
        }
      }
      department_codes: {
        Row: {
          id: string
          code: string
          department_name: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          department_name: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          department_name?: string
          role?: string
          created_at?: string
        }
      }
      admin_settings: {
        Row: {
          id: string
          key: string
          value: string
          created_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          created_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          created_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          name: string
          capacity: number
          description: string
          amenities: string[]
          color: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          capacity: number
          description: string
          amenities: string[]
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          capacity?: number
          description?: string
          amenities?: string[]
          color?: string
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          room_id: string
          user_name: string
          user_email: string
          user_phone: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          date: string
          status: 'pending' | 'confirmed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          user_name: string
          user_email: string
          user_phone: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          date: string
          status?: 'pending' | 'confirmed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          user_name?: string
          user_email?: string
          user_phone?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          date?: string
          status?: 'pending' | 'confirmed' | 'cancelled'
          created_at?: string
        }
      }
    }
  }
}
