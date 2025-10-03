import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
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

  const updateSetting = async (key: string, value: any) => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .update({ value: JSON.stringify(value) })
        .eq('key', key)
        .select()
        .single();

      if (error) throw error;

      setSettings(prev => 
        prev.map(setting => 
          setting.key === key 
            ? { ...setting, value, updated_at: data.updated_at }
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
    return setting ? setting.value : defaultValue;
  };

  const getThemeSettings = (): ThemeSettings => {
    return {
      primary_color: getSetting('theme_primary_color', '#3B82F6'),
      secondary_color: getSetting('theme_secondary_color', '#1E40AF'),
      accent_color: getSetting('theme_accent_color', '#10B981'),
      success_color: getSetting('theme_success_color', '#059669'),
      warning_color: getSetting('theme_warning_color', '#D97706'),
      error_color: getSetting('theme_error_color', '#DC2626'),
    };
  };

  const getBrandingSettings = (): BrandingSettings => {
    return {
      logo_url: getSetting('branding_logo_url', ''),
      organization_name: getSetting('branding_organization_name', 'ระบบจองห้องประชุม'),
      organization_subtitle: getSetting('branding_organization_subtitle', 'Meeting Room Booking System'),
      favicon_url: getSetting('branding_favicon_url', ''),
    };
  };

  const getOperatingHoursSettings = (): OperatingHoursSettings => {
    return {
      weekdays: getSetting('operating_hours_weekdays', { start: '08:00', end: '17:00' }),
      saturday: getSetting('operating_hours_saturday', { start: '09:00', end: '16:00' }),
      sunday: getSetting('operating_hours_sunday', { enabled: false, start: '09:00', end: '16:00' }),
      holidays: getSetting('operating_hours_holidays', { enabled: false }),
    };
  };

  const getTimeSlotDuration = (): number => {
    return parseInt(getSetting('time_slot_duration', '30'));
  };

  const getBookingAdvanceDays = (): number => {
    return parseInt(getSetting('booking_advance_days', '30'));
  };

  const getBookingCancellationHours = (): number => {
    return parseInt(getSetting('booking_cancellation_hours', '2'));
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