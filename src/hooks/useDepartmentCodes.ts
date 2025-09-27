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

  return {
    departmentCodes,
    loading,
    error,
    getDepartmentNameByCode,
    refetch: fetchDepartmentCodes,
  };
}
