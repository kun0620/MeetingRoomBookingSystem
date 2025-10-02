import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Booking, Room, TimeSlot } from '../types';
import { Loader2, X } from 'lucide-react';
import { useBookings } from '../hooks/useBookings';

interface EditBookingModalProps {
  booking: Booking;
  rooms: Room[];
  onSave: (bookingId: string, updatedData: Partial<Booking>) => Promise<void>;
  onClose: () => void;
}

const bookingEditSchema = z.object({
  title: z.string().min(3, 'หัวข้อต้องมีอย่างน้อย 3 ตัวอักษร').max(100, 'หัวข้อต้องไม่เกิน 100 ตัวอักษร'),
  description: z.string().max(500, 'คำอธิบายต้องไม่เกิน 500 ตัวอักษร').optional(),
  user_phone: z.string().optional().refine(val => !val || /^\d{9,10}$/.test(val), {
    message: 'เบอร์โทรศัพท์ต้องมี 9-10 หลักและเป็นตัวเลขเท่านั้น'
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'รูปแบบเวลาไม่ถูกต้อง (HH:MM)'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'รูปแบบเวลาไม่ถูกต้อง (HH:MM)'),
});

type BookingEditFormData = z.infer<typeof bookingEditSchema>;

export default function EditBookingModal({ booking, rooms, onSave, onClose }: EditBookingModalProps) {
  const { getAvailableTimeSlots } = useBookings();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<BookingEditFormData>({
    resolver: zodResolver(bookingEditSchema),
    defaultValues: {
      title: booking.title,
      description: booking.description || '',
      user_phone: booking.user_phone || '',
      date: booking.date,
      start_time: booking.start_time,
      end_time: booking.end_time,
    },
  });

  const watchDate = watch('date');
  const watchStartTime = watch('start_time');
  const watchEndTime = watch('end_time');

  const currentRoom = rooms.find(r => r.id === booking.room_id);

  useEffect(() => {
    const fetchSlots = async () => {
      if (currentRoom && watchDate) {
        setSlotsLoading(true);
        try {
          const slots = await getAvailableTimeSlots(currentRoom.id, watchDate, booking.id);
          setAvailableSlots(slots);
        } catch (err) {
          console.error('Failed to fetch available slots:', err);
          alert('ไม่สามารถโหลดช่วงเวลาที่ว่างได้');
        } finally {
          setSlotsLoading(false);
        }
      }
    };
    fetchSlots();
  }, [currentRoom, watchDate, booking.id, getAvailableTimeSlots]);

  const onSubmit = async (data: BookingEditFormData) => {
    // Basic time validation: start time must be before end time
    if (data.start_time >= data.end_time) {
      alert('เวลาเริ่มต้นต้องก่อนเวลาสิ้นสุด');
      return;
    }

    // Check if the selected slot is available
    const selectedSlot = availableSlots.find(slot =>
      slot.time === data.start_time && slot.end === data.end_time
    );

    if (!selectedSlot || !selectedSlot.available) {
      alert('ช่วงเวลาที่เลือกไม่ว่าง กรุณาเลือกช่วงเวลาอื่น');
      return;
    }

    try {
      await onSave(booking.id, data);
      onClose();
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถบันทึกการแก้ไขได้'}`);
    }
  };

  const generateTimeOptions = (slots: TimeSlot[]) => {
    const options: { value: string; label: string; available: boolean }[] = [];
    const uniqueStartTimes = new Set<string>();

    slots.forEach(slot => {
      if (!uniqueStartTimes.has(slot.time)) {
        options.push({ value: slot.time, label: slot.time, available: slot.available });
        uniqueStartTimes.add(slot.time);
      }
    });
    return options;
  };

  const generateEndTimeOptions = (slots: TimeSlot[], startTime: string) => {
    const options: { value: string; label: string; available: boolean }[] = [];
    const startIndex = slots.findIndex(slot => slot.time === startTime);

    if (startIndex !== -1) {
      for (let i = startIndex; i < slots.length; i++) {
        const currentSlot = slots[i];
        // Only add end times that are after the start time
        if (currentSlot.end > startTime) {
          options.push({ value: currentSlot.end, label: currentSlot.end, available: currentSlot.available });
        }
      }
    }
    return options;
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-800">แก้ไขการจอง</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Room Info (Read-only) */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <p><strong>ห้อง:</strong> {currentRoom?.name}</p>
              <p><strong>ผู้จอง:</strong> {booking.user_name} ({booking.user_email})</p>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                หัวข้อการประชุม *
              </label>
              <input
                id="title"
                type="text"
                {...register('title')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                รายละเอียด
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label htmlFor="user_phone" className="block text-sm font-medium text-gray-700 mb-1">
                เบอร์โทรศัพท์ผู้ติดต่อ
              </label>
              <input
                id="user_phone"
                type="text"
                {...register('user_phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.user_phone && <p className="text-red-500 text-xs mt-1">{errors.user_phone.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  วันที่ *
                </label>
                <input
                  id="date"
                  type="date"
                  min={today}
                  {...register('date')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
              </div>

              <div>
                <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                  เวลาเริ่มต้น *
                </label>
                <select
                  id="start_time"
                  {...register('start_time')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={slotsLoading}
                >
                  {slotsLoading ? (
                    <option>กำลังโหลด...</option>
                  ) : (
                    generateTimeOptions(availableSlots).map(option => (
                      <option key={option.value} value={option.value} disabled={!option.available}>
                        {option.label} {option.available ? '' : '(ไม่ว่าง)'}
                      </option>
                    ))
                  )}
                </select>
                {errors.start_time && <p className="text-red-500 text-xs mt-1">{errors.start_time.message}</p>}
              </div>

              <div>
                <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                  เวลาสิ้นสุด *
                </label>
                <select
                  id="end_time"
                  {...register('end_time')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={slotsLoading || !watchStartTime}
                >
                  {slotsLoading ? (
                    <option>กำลังโหลด...</option>
                  ) : (
                    generateEndTimeOptions(availableSlots, watchStartTime).map(option => (
                      <option key={option.value} value={option.value} disabled={!option.available}>
                        {option.label} {option.available ? '' : '(ไม่ว่าง)'}
                      </option>
                    ))
                  )}
                </select>
                {errors.end_time && <p className="text-red-500 text-xs mt-1">{errors.end_time.message}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    กำลังบันทึก...
                  </>
                ) : (
                  'บันทึกการแก้ไข'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
