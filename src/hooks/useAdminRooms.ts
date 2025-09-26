import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Room } from '../types';

export function useAdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('name');

      if (error) throw error;
      setRooms(data || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูลห้อง');
    } finally {
      setLoading(false);
    }
  };

  // Change signature to omit 'id' for creation, as it's auto-generated
  const createRoom = async (roomData: Omit<Room, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert([roomData])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error); // เพิ่มการ log ข้อผิดพลาดจาก Supabase
        throw error;
      }
      setRooms(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error creating room in hook:', err); // เพิ่มการ log ข้อผิดพลาดใน hook
      throw new Error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเพิ่มห้อง');
    }
  };

  const updateRoom = async (roomId: string, roomData: Partial<Room>) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update(roomData)
        .eq('id', roomId)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error); // เพิ่มการ log ข้อผิดพลาดจาก Supabase
        throw error;
      }
      setRooms(prev => prev.map(room => room.id === roomId ? data : room));
      return data;
    } catch (err) {
      console.error('Error updating room in hook:', err); // เพิ่มการ log ข้อผิดพลาดใน hook
      throw new Error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัปเดตห้อง');
    }
  };

  const deleteRoom = async (roomId: string) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);

      if (error) {
        console.error('Supabase delete error:', error); // เพิ่มการ log ข้อผิดพลาดจาก Supabase
        throw error;
      }
      setRooms(prev => prev.filter(room => room.id !== roomId));
    } catch (err) {
      console.error('Error deleting room in hook:', err); // เพิ่มการ log ข้อผิดพลาดใน hook
      throw new Error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบห้อง');
    }
  };

  return {
    rooms,
    loading,
    error,
    createRoom,
    updateRoom,
    deleteRoom,
    refetch: fetchRooms
  };
}
