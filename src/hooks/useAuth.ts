import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      setLoading(true);
      
      // For demo purposes, we'll simulate admin login
      // In production, you'd integrate with Supabase Auth
      const adminEmail = localStorage.getItem('admin_email');
      
      if (adminEmail) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', adminEmail)
          .eq('is_active', true)
          .single();

        if (error) throw error;
        setUser(data);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Simple demo login - in production use proper authentication
      if (email === 'admin@example.com' && password === 'admin123') {
        localStorage.setItem('admin_email', email);
        await checkUser();
        return true;
      } else {
        throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_email');
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAdmin,
    refetch: checkUser
  };
}