import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DepartmentCode } from '../types';

export function useDepartmentCodes() {
  const [departmentCodes, setDepartmentCodes] = useState<DepartmentCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartmentCodes();
  }, []);

  const fetchDepartmentCodes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('department_codes')
        .select('*');

      if (error) throw error;

      setDepartmentCodes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูลแผนก');
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentNameByCode = (code: string) => {
    const department = departmentCodes.find(dc => dc.code.trim().toLowerCase() === code.trim().toLowerCase());
    return department ? department.department_name : code; // Fallback to code if name not found
  };

  const createDepartmentCode = async (departmentData: Omit<DepartmentCode, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('department_codes')
        .insert([departmentData])
        .select()
        .single();

      if (error) throw error;
      setDepartmentCodes(prev => [...prev, data]);
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเพิ่มแผนก');
    }
  };

  const updateDepartmentCode = async (departmentId: string, departmentData: Partial<DepartmentCode>) => {
    try {
      const { data, error } = await supabase
        .from('department_codes')
        .update(departmentData)
        .eq('id', departmentId)
        .select()
        .single();

      if (error) throw error;
      setDepartmentCodes(prev => prev.map(dept => dept.id === departmentId ? data : dept));
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัปเดตแผนก');
    }
  };

  const deleteDepartmentCode = async (departmentId: string) => {
    try {
      const { error } = await supabase
        .from('department_codes')
        .delete()
        .eq('id', departmentId);

      if (error) throw error;
      setDepartmentCodes(prev => prev.filter(dept => dept.id !== departmentId));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบแผนก');
    }
  };

  return {
    departmentCodes,
    loading,
    error,
    getDepartmentNameByCode,
    refetch: fetchDepartmentCodes,
    createDepartmentCode,
    updateDepartmentCode,
    deleteDepartmentCode,
  };
}
