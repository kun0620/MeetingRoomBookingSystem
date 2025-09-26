import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { User, DepartmentCode } from '../types';

export function useAuth() {
  // State for Supabase Auth users (e.g., regular users)
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [supabaseLoading, setSupabaseLoading] = useState(true);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // State for Department Code authenticated admin
  const [departmentCodeAdmin, setDepartmentCodeAdmin] = useState<User | null>(null);
  const [departmentCodeLoading, setDepartmentCodeLoading] = useState(false);
  const [departmentCodeError, setDepartmentCodeError] = useState<string | null>(null);

  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    // Listener for Supabase Auth changes (for regular users)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted.current) {
        if (session) {
          fetchUserProfile(session.user.id);
        } else {
          setSupabaseUser(null);
          setSupabaseLoading(false);
        }
      }
    });

    // Initial check for Supabase Auth session
    const initAuth = async () => {
      if (mounted.current) {
        await checkSessionAndFetchUser();
      }
    };
    initAuth();

    // Check for locally stored department code admin status
    const storedAdmin = localStorage.getItem('department_code_admin');
    if (storedAdmin) {
      try {
        if (mounted.current) {
          setDepartmentCodeAdmin(JSON.parse(storedAdmin));
        }
      } catch (e) {
        console.error('Failed to parse stored department code admin:', e);
        localStorage.removeItem('department_code_admin');
      }
    }

    return () => {
      mounted.current = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      if (mounted.current) setSupabaseLoading(true);
      // Removed .single() to avoid 406 error if no row or multiple rows are returned
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId);

      if (error) throw error;

      // Check if data is an array and has at least one element
      if (data && data.length > 0) {
        if (mounted.current) setSupabaseUser(data[0]);
      } else {
        if (mounted.current) setSupabaseUser(null);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      if (mounted.current) setSupabaseError(err instanceof Error ? err.message : 'Failed to fetch user profile');
      if (mounted.current) setSupabaseUser(null);
    } finally {
      if (mounted.current) setSupabaseLoading(false);
    }
  };

  const checkSessionAndFetchUser = async () => {
    try {
      if (mounted.current) setSupabaseLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session) {
        await fetchUserProfile(session.user.id);
      } else {
        if (mounted.current) setSupabaseUser(null);
      }
    } catch (err) {
      console.error('Error checking session:', err);
      if (mounted.current) setSupabaseError(err instanceof Error ? err.message : 'Failed to check session');
      if (mounted.current) setSupabaseUser(null);
    } finally {
      if (mounted.current) setSupabaseLoading(false);
    }
  };

  const loginWithEmailPassword = async (email: string, password: string) => {
    try {
      if (mounted.current) setSupabaseLoading(true);
      if (mounted.current) setSupabaseError(null);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;
      
      if (data.user) {
        await fetchUserProfile(data.user.id);
        return true;
      }
      return false;
    } catch (err) {
      if (mounted.current) setSupabaseError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      return false;
    } finally {
      if (mounted.current) setSupabaseLoading(false);
    }
  };

  const loginAdminWithDepartmentCode = async (code: string) => {
    try {
      if (mounted.current) setDepartmentCodeLoading(true);
      if (mounted.current) setDepartmentCodeError(null);

      const { data, error } = await supabase
        .from('department_codes')
        .select('*')
        .eq('code', code)
        .single(); // Keep .single() here as we expect a unique department code

      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          throw new Error('รหัสประจำแผนกไม่ถูกต้อง');
        }
        throw error;
      }

      if (data && data.role === 'admin') {
        const adminUser: User = {
          id: data.id, // Use department code ID as user ID
          email: `${data.department_name.toLowerCase().replace(/\s/g, '')}@department.com`, // Mock email
          is_active: true,
          role: 'admin',
          created_at: data.created_at,
        };
        if (mounted.current) setDepartmentCodeAdmin(adminUser);
        localStorage.setItem('department_code_admin', JSON.stringify(adminUser));
        return true;
      } else {
        throw new Error('รหัสประจำแผนกไม่ถูกต้อง หรือไม่มีสิทธิ์เป็นผู้ดูแลระบบ');
      }
    } catch (err) {
      if (mounted.current) setDepartmentCodeError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วยรหัสแผนก');
      return false;
    } finally {
      if (mounted.current) setDepartmentCodeLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear Supabase Auth session
      if (supabaseUser) {
        if (mounted.current) setSupabaseLoading(true);
        if (mounted.current) setSupabaseError(null);
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        if (mounted.current) setSupabaseUser(null);
      }

      // Clear department code admin session
      if (departmentCodeAdmin) {
        if (mounted.current) setDepartmentCodeAdmin(null);
        localStorage.removeItem('department_code_admin');
      }
    } catch (err) {
      if (mounted.current) setSupabaseError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการออกจากระบบ');
    } finally {
      if (mounted.current) setSupabaseLoading(false);
    }
  };

  // Determine if any user is an admin
  const isAdmin = supabaseUser?.role === 'admin' || departmentCodeAdmin?.role === 'admin';

  return {
    user: supabaseUser || departmentCodeAdmin, // Prioritize Supabase user if both exist, or department code admin
    loading: supabaseLoading || departmentCodeLoading,
    error: supabaseError || departmentCodeError,
    loginWithEmailPassword,
    loginAdminWithDepartmentCode,
    logout,
    isAdmin,
    refetch: checkSessionAndFetchUser
  };
}
