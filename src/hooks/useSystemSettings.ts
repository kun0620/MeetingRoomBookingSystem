import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Json } from '../lib/database.types'; // Import Json type

export interface SystemSetting {
  id: string;
  key: string;
  value: Json; // Use Json type for value
  category: string;
  description?: string;
  updated_at: string;
  updated_by?: string;
}

export interface ThemeSettings {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  success_color: string;
  warning_color: string;
  error_color: string;
}

export interface BrandingSettings {
  logo_url: string;
  organization_name: string;
  organization_subtitle: string;
  favicon_url: string;
}

export interface OperatingHours {
  start: string;
  end: string;
  enabled?: boolean;
}

export interface OperatingHoursSettings {
  weekdays: OperatingHours;
  saturday: OperatingHours;
  sunday: OperatingHours;
  holidays: OperatingHours;
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setSettings(data || []);
    } catch (err) {
      console.error('Error fetching system settings:', err);
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดการตั้งค่าระบบ');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: Json) => { // Use Json type for value
    try {
      // ลบการ JSON.stringify ค่าพื้นฐานออก
      // Supabase client library จะจัดการการแปลงค่า JavaScript เป็น JSON ที่เหมาะสม
      // สำหรับคอลัมน์ 'jsonb' โดยอัตโนมัติ
      // หาก 'value' เป็นสตริง JavaScript เช่น '#FF0000' จะถูกส่งไปตามปกติ
      // และ PostgREST จะจัดเก็บเป็น '"#FF0000"'::jsonb
      // หาก 'value' เป็นอ็อบเจกต์ JavaScript ก็จะถูกส่งไปตามปกติ
      // และ PostgREST จะจัดเก็บเป็น '{"key": "value"}'::jsonb

      const { data, error } = await supabase
        .from('system_settings')
        .update({ 
          value: value, // ส่งค่าโดยตรง
          updated_at: new Date().toISOString() // รวม updated_at สำหรับการติดตามที่ดีขึ้น
        })
        .eq('key', key)
        .select()
        .single();

      if (error) throw error;

      setSettings(prev => 
        prev.map(setting => 
          setting.key === key 
            ? { ...setting, value, updated_at: data.updated_at } // เก็บ 'value' เดิมสำหรับสถานะภายใน
            : setting
        )
      );

      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัปเดตการตั้งค่า');
    }
  };

  const getSetting = (key: string, defaultValue: any = null) => {
    const setting = settings.find(s => s.key === key);
    // หากค่าเป็น JSON string literal (เช่น '"#FF0000"') ให้แยกวิเคราะห์กลับเป็นสตริง JS
    // หากเป็น JSON number literal (เช่น '30') ให้แยกวิเคราะห์กลับเป็นตัวเลข JS
    if (setting && typeof setting.value === 'string') {
      try {
        const parsed = JSON.parse(setting.value as string);
        // ตรวจสอบว่าค่าที่แยกวิเคราะห์เป็นค่าพื้นฐาน (สตริง, ตัวเลข, บูลีน, null) หรือไม่
        if (typeof parsed === 'string' || typeof parsed === 'number' || typeof parsed === 'boolean' || parsed === null) {
          return parsed;
        }
      } catch (e) {
        // ไม่ใช่ JSON string literal ให้คืนค่าตามเดิม
      }
    }
    return setting ? setting.value : defaultValue;
  };

  const getThemeSettings = (): ThemeSettings => {
    return {
      primary_color: getSetting('theme_primary_color', '#3B82F6') as string,
      secondary_color: getSetting('theme_secondary_color', '#1E40AF') as string,
      accent_color: getSetting('theme_accent_color', '#10B981') as string,
      success_color: getSetting('theme_success_color', '#059669') as string,
      warning_color: getSetting('theme_warning_color', '#D97706') as string,
      error_color: getSetting('theme_error_color', '#DC2626') as string,
    };
  };

  const getBrandingSettings = (): BrandingSettings => {
    return {
      logo_url: getSetting('branding_logo_url', '') as string,
      organization_name: getSetting('branding_organization_name', 'ระบบจองห้องประชุม') as string,
      organization_subtitle: getSetting('branding_organization_subtitle', 'Meeting Room Booking System') as string,
      favicon_url: getSetting('branding_favicon_url', '') as string,
    };
  };

  const getOperatingHoursSettings = (): OperatingHoursSettings => {
    return {
      weekdays: getSetting('operating_hours_weekdays', { start: '08:00', end: '17:00' }) as OperatingHours,
      saturday: getSetting('operating_hours_saturday', { start: '09:00', end: '16:00' }) as OperatingHours,
      sunday: getSetting('operating_hours_sunday', { enabled: false, start: '09:00', end: '16:00' }) as OperatingHours,
      holidays: getSetting('operating_hours_holidays', { enabled: false }) as OperatingHours,
    };
  };

  const getTimeSlotDuration = (): number => {
    return parseInt(getSetting('time_slot_duration', '30') as string);
  };

  const getBookingAdvanceDays = (): number => {
    return parseInt(getSetting('booking_advance_days', '30') as string);
  };

  const getBookingCancellationHours = (): number => {
    return parseInt(getSetting('booking_cancellation_hours', '2') as string);
  };

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSetting,
    getSetting,
    getThemeSettings,
    getBrandingSettings,
    getOperatingHoursSettings,
    getTimeSlotDuration,
    getBookingAdvanceDays,
    getBookingCancellationHours,
  };
}
