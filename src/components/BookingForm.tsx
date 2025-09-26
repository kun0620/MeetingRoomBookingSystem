import React, { useState } from 'react';
import { Room, Booking } from '../types';
import { User, Mail, Phone, FileText, Calendar, Loader2 } from 'lucide-react';
import { formatDateThai } from '../utils/dateUtils';

interface BookingFormProps {
  room: Room;
  selectedDate: string;
  selectedStartTime: string;
  selectedEndTime: string;
  onSubmit: (booking: Omit<Booking, 'id' | 'created_at'>) => void;
  onCancel: () => void;
  submitting?: boolean;
}

export default function BookingForm({
  room,
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  onSubmit,
  onCancel,
  submitting = false
}: BookingFormProps) {
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_phone: '',
    title: '',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.user_name.trim()) {
      newErrors.user_name = 'กรุณาระบุชื่อผู้จอง';
    }

    if (!formData.user_email.trim()) {
      newErrors.user_email = 'กรุณาระบุอีเมล';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.user_email)) {
      newErrors.user_email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (!formData.user_phone.trim()) {
      newErrors.user_phone = 'กรุณาระบุเบอร์โทรศัพท์';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'กรุณาระบุหัวข้อการประชุม';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const booking: Omit<Booking, 'id' | 'created_at'> = {
      room_id: room.id,
      date: selectedDate,
      start_time: selectedStartTime,
      end_time: selectedEndTime,
      status: 'confirmed',
      ...formData
    };

    onSubmit(booking);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ยืนยันการจอง</h2>
        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center text-blue-800">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="font-medium">ห้อง:</span>
            <span className="ml-2">{room.name}</span>
          </div>
          <div className="flex items-center text-blue-800">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="font-medium">วันที่:</span>
            <span className="ml-2">{formatDateThai(selectedDate)}</span>
          </div>
          <div className="flex items-center text-blue-800">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="font-medium">เวลา:</span>
            <span className="ml-2">{selectedStartTime} - {selectedEndTime}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 mr-2" />
            ชื่อผู้จอง *
          </label>
          <input
            type="text"
            value={formData.user_name}
            onChange={(e) => handleChange('user_name', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.user_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="กรอกชื่อของคุณ"
          />
          {errors.user_name && (
            <p className="text-red-500 text-sm mt-1">{errors.user_name}</p>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 mr-2" />
            อีเมล *
          </label>
          <input
            type="email"
            value={formData.user_email}
            onChange={(e) => handleChange('user_email', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.user_email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="example@email.com"
          />
          {errors.user_email && (
            <p className="text-red-500 text-sm mt-1">{errors.user_email}</p>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 mr-2" />
            เบอร์โทรศัพท์ *
          </label>
          <input
            type="tel"
            value={formData.user_phone}
            onChange={(e) => handleChange('user_phone', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.user_phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0xx-xxx-xxxx"
          />
          {errors.user_phone && (
            <p className="text-red-500 text-sm mt-1">{errors.user_phone}</p>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 mr-2" />
            หัวข้อการประชุม *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="ระบุหัวข้อหรือชื่อการประชุม"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 mr-2" />
            รายละเอียดเพิ่มเติม
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            placeholder="รายละเอียดหรือข้อมูลเพิ่มเติม (ไม่บังคับ)"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                กำลังจอง...
              </>
            ) : (
              'ยืนยันการจอง'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
