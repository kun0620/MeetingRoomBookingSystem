import React, { useState, useEffect } from 'react';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { Settings, Palette, Building2, Clock, Save, RotateCcw, Loader as Loader2, Upload, Eye, EyeOff } from 'lucide-react';

export default function AdminSystemSettings() {
  const { 
    settings, 
    loading, 
    updateSetting, 
    getThemeSettings, 
    getBrandingSettings, 
    getOperatingHoursSettings,
    getTimeSlotDuration,
    getBookingAdvanceDays,
    getBookingCancellationHours
  } = useSystemSettings();

  const [activeTab, setActiveTab] = useState<'theme' | 'branding' | 'operating'>('theme');
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Theme state
  const [themeSettings, setThemeSettings] = useState(getThemeSettings());
  
  // Branding state
  const [brandingSettings, setBrandingSettings] = useState(getBrandingSettings());
  
  // Operating hours state
  const [operatingHours, setOperatingHours] = useState(getOperatingHoursSettings());
  const [timeSlotDuration, setTimeSlotDuration] = useState(getTimeSlotDuration());
  const [bookingAdvanceDays, setBookingAdvanceDays] = useState(getBookingAdvanceDays());
  const [bookingCancellationHours, setBookingCancellationHours] = useState(getBookingCancellationHours());

  useEffect(() => {
    if (!loading) {
      setThemeSettings(getThemeSettings());
      setBrandingSettings(getBrandingSettings());
      setOperatingHours(getOperatingHoursSettings());
      setTimeSlotDuration(getTimeSlotDuration());
      setBookingAdvanceDays(getBookingAdvanceDays());
      setBookingCancellationHours(getBookingCancellationHours());
    }
  }, [loading, settings]);

  const handleSaveTheme = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateSetting('theme_primary_color', themeSettings.primary_color),
        updateSetting('theme_secondary_color', themeSettings.secondary_color),
        updateSetting('theme_accent_color', themeSettings.accent_color),
        updateSetting('theme_success_color', themeSettings.success_color),
        updateSetting('theme_warning_color', themeSettings.warning_color),
        updateSetting('theme_error_color', themeSettings.error_color),
      ]);
      
      // Apply theme to document
      applyThemeToDocument(themeSettings);
      alert('บันทึกการตั้งค่าธีมสำเร็จ!');
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถบันทึกได้'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBranding = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateSetting('branding_logo_url', brandingSettings.logo_url),
        updateSetting('branding_organization_name', brandingSettings.organization_name),
        updateSetting('branding_organization_subtitle', brandingSettings.organization_subtitle),
        updateSetting('branding_favicon_url', brandingSettings.favicon_url),
      ]);
      
      // Update document title and favicon
      document.title = brandingSettings.organization_name;
      if (brandingSettings.favicon_url) {
        updateFavicon(brandingSettings.favicon_url);
      }
      
      alert('บันทึกการตั้งค่าแบรนด์สำเร็จ!');
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถบันทึกได้'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOperatingHours = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateSetting('operating_hours_weekdays', operatingHours.weekdays),
        updateSetting('operating_hours_saturday', operatingHours.saturday),
        updateSetting('operating_hours_sunday', operatingHours.sunday),
        updateSetting('operating_hours_holidays', operatingHours.holidays),
        updateSetting('time_slot_duration', timeSlotDuration),
        updateSetting('booking_advance_days', bookingAdvanceDays),
        updateSetting('booking_cancellation_hours', bookingCancellationHours),
      ]);
      
      alert('บันทึกการตั้งค่าเวลาทำการสำเร็จ!');
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถบันทึกได้'}`);
    } finally {
      setSaving(false);
    }
  };

  const applyThemeToDocument = (theme: typeof themeSettings) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary_color);
    root.style.setProperty('--color-secondary', theme.secondary_color);
    root.style.setProperty('--color-accent', theme.accent_color);
    root.style.setProperty('--color-success', theme.success_color);
    root.style.setProperty('--color-warning', theme.warning_color);
    root.style.setProperty('--color-error', theme.error_color);
  };

  const updateFavicon = (url: string) => {
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = url;
    document.getElementsByTagName('head')[0].appendChild(link);
  };

  const resetToDefaults = () => {
    if (activeTab === 'theme') {
      setThemeSettings({
        primary_color: '#3B82F6',
        secondary_color: '#1E40AF',
        accent_color: '#10B981',
        success_color: '#059669',
        warning_color: '#D97706',
        error_color: '#DC2626',
      });
    } else if (activeTab === 'branding') {
      setBrandingSettings({
        logo_url: '',
        organization_name: 'ระบบจองห้องประชุม',
        organization_subtitle: 'Meeting Room Booking System',
        favicon_url: '',
      });
    } else if (activeTab === 'operating') {
      setOperatingHours({
        weekdays: { start: '08:00', end: '17:00' },
        saturday: { start: '09:00', end: '16:00' },
        sunday: { enabled: false, start: '09:00', end: '16:00' },
        holidays: { enabled: false },
      });
      setTimeSlotDuration(30);
      setBookingAdvanceDays(30);
      setBookingCancellationHours(2);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const tabs = [
    { id: 'theme' as const, label: 'ธีมสี', icon: Palette },
    { id: 'branding' as const, label: 'แบรนด์', icon: Building2 },
    { id: 'operating' as const, label: 'เวลาทำการ', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Settings className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">ตั้งค่าระบบ</h2>
          </div>
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {previewMode ? 'ปิดตัวอย่าง' : 'ดูตัวอย่าง'}
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Theme Settings */}
        {activeTab === 'theme' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สีหลัก (Primary)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={themeSettings.primary_color}
                    onChange={(e) => setThemeSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={themeSettings.primary_color}
                    onChange={(e) => setThemeSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สีรอง (Secondary)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={themeSettings.secondary_color}
                    onChange={(e) => setThemeSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={themeSettings.secondary_color}
                    onChange={(e) => setThemeSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สีเน้น (Accent)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={themeSettings.accent_color}
                    onChange={(e) => setThemeSettings(prev => ({ ...prev, accent_color: e.target.value }))}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={themeSettings.accent_color}
                    onChange={(e) => setThemeSettings(prev => ({ ...prev, accent_color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สีสำเร็จ (Success)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={themeSettings.success_color}
                    onChange={(e) => setThemeSettings(prev => ({ ...prev, success_color: e.target.value }))}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={themeSettings.success_color}
                    onChange={(e) => setThemeSettings(prev => ({ ...prev, success_color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สีเตือน (Warning)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={themeSettings.warning_color}
                    onChange={(e) => setThemeSettings(prev => ({ ...prev, warning_color: e.target.value }))}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={themeSettings.warning_color}
                    onChange={(e) => setThemeSettings(prev => ({ ...prev, warning_color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  สีข้อผิดพลาด (Error)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={themeSettings.error_color}
                    onChange={(e) => setThemeSettings(prev => ({ ...prev, error_color: e.target.value }))}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={themeSettings.error_color}
                    onChange={(e) => setThemeSettings(prev => ({ ...prev, error_color: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {previewMode && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">ตัวอย่างธีม</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-lg mx-auto mb-2"
                      style={{ backgroundColor: themeSettings.primary_color }}
                    ></div>
                    <p className="text-sm text-gray-600">Primary</p>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-lg mx-auto mb-2"
                      style={{ backgroundColor: themeSettings.secondary_color }}
                    ></div>
                    <p className="text-sm text-gray-600">Secondary</p>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-lg mx-auto mb-2"
                      style={{ backgroundColor: themeSettings.accent_color }}
                    ></div>
                    <p className="text-sm text-gray-600">Accent</p>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-lg mx-auto mb-2"
                      style={{ backgroundColor: themeSettings.success_color }}
                    ></div>
                    <p className="text-sm text-gray-600">Success</p>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-lg mx-auto mb-2"
                      style={{ backgroundColor: themeSettings.warning_color }}
                    ></div>
                    <p className="text-sm text-gray-600">Warning</p>
                  </div>
                  <div className="text-center">
                    <div 
                      className="w-16 h-16 rounded-lg mx-auto mb-2"
                      style={{ backgroundColor: themeSettings.error_color }}
                    ></div>
                    <p className="text-sm text-gray-600">Error</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={resetToDefaults}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                รีเซ็ตเป็นค่าเริ่มต้น
              </button>
              <button
                onClick={handleSaveTheme}
                disabled={saving}
                className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                บันทึกธีม
              </button>
            </div>
          </div>
        )}

        {/* Branding Settings */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อองค์กร
                </label>
                <input
                  type="text"
                  value={brandingSettings.organization_name}
                  onChange={(e) => setBrandingSettings(prev => ({ ...prev, organization_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ระบบจองห้องประชุม"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  คำบรรยายใต้ชื่อ
                </label>
                <input
                  type="text"
                  value={brandingSettings.organization_subtitle}
                  onChange={(e) => setBrandingSettings(prev => ({ ...prev, organization_subtitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Meeting Room Booking System"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL โลโก้
                </label>
                <input
                  type="url"
                  value={brandingSettings.logo_url}
                  onChange={(e) => setBrandingSettings(prev => ({ ...prev, logo_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-gray-500 mt-1">แนะนำขนาด: 200x60 พิกเซล</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Favicon
                </label>
                <input
                  type="url"
                  value={brandingSettings.favicon_url}
                  onChange={(e) => setBrandingSettings(prev => ({ ...prev, favicon_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/favicon.ico"
                />
                <p className="text-xs text-gray-500 mt-1">แนะนำขนาด: 32x32 พิกเซล (.ico หรือ .png)</p>
              </div>
            </div>

            {previewMode && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">ตัวอย่างแบรนด์</h3>
                <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border">
                  {brandingSettings.logo_url && (
                    <img 
                      src={brandingSettings.logo_url} 
                      alt="Logo" 
                      className="h-12 w-auto"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {brandingSettings.organization_name}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {brandingSettings.organization_subtitle}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={resetToDefaults}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                รีเซ็ตเป็นค่าเริ่มต้น
              </button>
              <button
                onClick={handleSaveBranding}
                disabled={saving}
                className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                บันทึกแบรนด์
              </button>
            </div>
          </div>
        )}

        {/* Operating Hours Settings */}
        {activeTab === 'operating' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Weekdays */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3">วันจันทร์ - ศุกร์</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">เวลาเปิด</label>
                    <input
                      type="time"
                      value={operatingHours.weekdays.start}
                      onChange={(e) => setOperatingHours(prev => ({
                        ...prev,
                        weekdays: { ...prev.weekdays, start: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">เวลาปิด</label>
                    <input
                      type="time"
                      value={operatingHours.weekdays.end}
                      onChange={(e) => setOperatingHours(prev => ({
                        ...prev,
                        weekdays: { ...prev.weekdays, end: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Saturday */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3">วันเสาร์</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">เวลาเปิด</label>
                    <input
                      type="time"
                      value={operatingHours.saturday.start}
                      onChange={(e) => setOperatingHours(prev => ({
                        ...prev,
                        saturday: { ...prev.saturday, start: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">เวลาปิด</label>
                    <input
                      type="time"
                      value={operatingHours.saturday.end}
                      onChange={(e) => setOperatingHours(prev => ({
                        ...prev,
                        saturday: { ...prev.saturday, end: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Sunday */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3">วันอาทิตย์</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sunday-enabled"
                      checked={operatingHours.sunday.enabled !== false}
                      onChange={(e) => setOperatingHours(prev => ({
                        ...prev,
                        sunday: { ...prev.sunday, enabled: e.target.checked }
                      }))}
                      className="mr-2"
                    />
                    <label htmlFor="sunday-enabled" className="text-sm text-gray-600">
                      เปิดให้บริการ
                    </label>
                  </div>
                  {operatingHours.sunday.enabled !== false && (
                    <>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">เวลาเปิด</label>
                        <input
                          type="time"
                          value={operatingHours.sunday.start}
                          onChange={(e) => setOperatingHours(prev => ({
                            ...prev,
                            sunday: { ...prev.sunday, start: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">เวลาปิด</label>
                        <input
                          type="time"
                          value={operatingHours.sunday.end}
                          onChange={(e) => setOperatingHours(prev => ({
                            ...prev,
                            sunday: { ...prev.sunday, end: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ระยะเวลาช่วงการจอง (นาที)
                </label>
                <select
                  value={timeSlotDuration}
                  onChange={(e) => setTimeSlotDuration(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={15}>15 นาที</option>
                  <option value={30}>30 นาที</option>
                  <option value={60}>60 นาที</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  จองล่วงหน้าได้กี่วัน
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={bookingAdvanceDays}
                  onChange={(e) => setBookingAdvanceDays(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ยกเลิกได้ก่อนกี่ชั่วโมง
                </label>
                <input
                  type="number"
                  min="0"
                  max="72"
                  value={bookingCancellationHours}
                  onChange={(e) => setBookingCancellationHours(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={resetToDefaults}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                รีเซ็ตเป็นค่าเริ่มต้น
              </button>
              <button
                onClick={handleSaveOperatingHours}
                disabled={saving}
                className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                บันทึกเวลาทำการ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}