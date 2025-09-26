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
          status: string
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
          status?: string
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
          status?: string
          created_at?: string
        }
      }
    }
  }
}
