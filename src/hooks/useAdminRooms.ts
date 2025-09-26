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

  const createRoom = async (roomData: Omit<Room, 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert([roomData])
        .select()
        .single();

      if (error) throw error;
      setRooms(prev => [...prev, data]);
      return data;
    } catch (err) {
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

      if (error) throw error;
      setRooms(prev => prev.map(room => room.id === roomId ? data : room));
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัปเดตห้อง');
    }
  };

  const deleteRoom = async (roomId: string) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);

      if (error) throw error;
      setRooms(prev => prev.filter(room => room.id !== roomId));
    } catch (err) {
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
