import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Booking, TimeSlot } from '../types'; // Import TimeSlot

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
        .order('created_at', { ascending: false }); // เปลี่ยนเป็นเรียงตาม created_at จากใหม่ไปเก่า

      if (error) throw error;

      // Log the raw data fetched from Supabase
      console.log('useBookings: Raw data from Supabase:', data);

      // Ensure data matches the Booking type from src/types.ts
      setBookings(data as Booking[] || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูลการจอง');
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'created_at' | 'status'>) => { // Removed department_name, contact_person, contact_email
    try {
      // When creating, ensure the data sent matches the DB schema.
      // The Omit type above ensures we don't send id, created_at, status
      // as they are either auto-generated or derived.
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()
        .single();

      if (error) throw error;

      setBookings(prev => [...prev, data as Booking]);
      return data as Booking;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการจองห้อง');
    }
  };

  const cancelBooking = async (bookingId: string, departmentCode?: string) => { // departmentCode is now optional
    try {
      setCancelling(true);

      // Fetch the booking to verify ownership or department code
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('user_id, department_code') // Select user_id as well
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;
      if (!booking) throw new Error('ไม่พบข้อมูลการจอง');

      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      let authorized = false;

      if (departmentCode) {
        // Admin cancellation path (requires department code verification)
        if (typeof booking.department_code !== 'string' || booking.department_code.trim() === '') {
          throw new Error('ข้อมูลรหัสแผนกของการจองไม่สมบูรณ์ หรือไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ');
        }
        if (booking.department_code.trim().toLowerCase() === departmentCode.trim().toLowerCase()) {
          authorized = true;
        } else {
          throw new Error('รหัสแผนกไม่ถูกต้อง');
        }
      } else {
        // User cancellation path (requires user_id verification)
        if (!currentUserId) {
          throw new Error('ผู้ใช้ไม่ได้เข้าสู่ระบบ');
        }
        if (booking.user_id === currentUserId) {
          authorized = true;
        } else {
          throw new Error('คุณไม่มีสิทธิ์ยกเลิกการจองนี้');
        }
      }

      if (!authorized) {
        throw new Error('ไม่ได้รับอนุญาตให้ยกเลิกการจอง');
      }

      // If authorized, proceed with cancellation
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (updateError) {
        console.error('Supabase update error:', updateError);
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
      console.error('Error in cancelBooking hook:', err);
      throw new Error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการยกเลิกการจอง');
    } finally {
      setCancelling(false);
    }
  };

  const updateBooking = async (bookingId: string, updatedBookingData: Partial<Booking>) => {
    try {
      // Ensure updatedBookingData matches the DB schema
      const { data, error } = await supabase
        .from('bookings')
        .update(updatedBookingData)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      setBookings(prev =>
        prev.map(b =>
          b.id === bookingId ? { ...b, ...updatedBookingData } : b
        )
      );

      return data as Booking;
    } catch (err) {
      console.error('Error in updateBooking hook:', err);
      throw new Error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลการจอง');
    }
  };

  const getAvailableTimeSlots = async (roomId: string, date: string, bookingIdToExclude?: string): Promise<TimeSlot[]> => {
    try {
      const { data: existingBookings, error } = await supabase
        .from('bookings')
        .select('id, start_time, end_time')
        .eq('room_id', roomId)
        .eq('date', date)
        .neq('status', 'cancelled'); // Exclude cancelled bookings

      if (error) throw error;

      const bookedSlots = existingBookings
        .filter(b => b.id !== bookingIdToExclude) // Exclude the booking being edited
        .map(b => ({
          start: b.start_time,
          end: b.end_time
        }));

      // Generate all possible 30-minute slots from 8:00 to 17:00
      const allSlots: TimeSlot[] = [];
      for (let hour = 8; hour < 17; hour++) {
        for (const minute of ['00', '30']) {
          const time = `${String(hour).padStart(2, '0')}:${minute}`;
          const endHour = minute === '30' ? hour + 1 : hour;
          const endMinute = minute === '30' ? '00' : '30';
          const end = `${String(endHour).padStart(2, '0')}:${endMinute}`;
          if (end === '17:30') continue; // Don't create a slot that ends after 17:00
          allSlots.push({ time, end, available: true });
        }
      }

      // Mark unavailable slots
      return allSlots.map(slot => {
        const isBooked = bookedSlots.some(booked =>
          (slot.time >= booked.start && slot.time < booked.end) || // Slot starts within a booked period
          (slot.end > booked.start && slot.end <= booked.end) ||   // Slot ends within a booked period
          (booked.start >= slot.time && booked.start < slot.end)   // Booked period starts within the slot
        );
        return { ...slot, available: !isBooked };
      });
    } catch (err) {
      console.error('Error fetching available time slots:', err);
      throw new Error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดช่วงเวลาที่ว่าง');
    }
  };

  return {
    bookings,
    loading,
    error,
    createBooking,
    cancelBooking,
    refetch: fetchBookings,
    cancelling, // Expose cancelling state
    updateBooking,
    getAvailableTimeSlots // Expose getAvailableTimeSlots
  };
}
