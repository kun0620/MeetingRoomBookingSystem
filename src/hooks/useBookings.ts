import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Booking } from '../types';

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false); // New state for cancellation loading

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      setBookings(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูลการจอง');
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (error) throw error;

      setBookings(prev => [...prev, data]);
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการจองห้อง');
    }
  };

  const cancelBooking = async (bookingId: string, departmentCode: string) => { // Added departmentCode parameter
    try {
      setCancelling(true); // Set cancelling state to true
      // First, fetch the booking to verify the department code
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('department_code')
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;
      if (!booking) throw new Error('ไม่พบข้อมูลการจอง');

      // CRITICAL: Enhanced defensive check for department_code data integrity
      // Ensure department_code is a non-null, non-empty string before calling .trim()
      if (typeof booking.department_code !== 'string' || booking.department_code.trim() === '') {
        throw new Error('ข้อมูลรหัสแผนกของการจองไม่สมบูรณ์ หรือไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ');
      }

      // Compare department codes, making them case-insensitive and trimming whitespace
      if (booking.department_code.trim().toLowerCase() !== departmentCode.trim().toLowerCase()) {
        throw new Error('รหัสแผนกไม่ถูกต้อง');
      }

      // If department code matches, proceed with cancellation
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (updateError) {
        console.error('Supabase update error:', updateError); // Log the specific Supabase error
        throw updateError;
      }

      setBookings(prev => 
        prev.map(b => 
          b.id === bookingId 
            ? { ...b, status: 'cancelled' as const }
            : b
        )
      );
    } catch (err) {
      console.error('Error in cancelBooking hook:', err); // Log general errors in the hook
      throw new Error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการยกเลิกการจอง');
    } finally {
      setCancelling(false); // Reset cancelling state
    }
  };

  return { 
    bookings, 
    loading, 
    error, 
    createBooking, 
    cancelBooking, 
    refetch: fetchBookings,
    cancelling // Expose cancelling state
  };
}
