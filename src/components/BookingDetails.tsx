import React from 'react';
import { Booking, Room } from '../types';
import { formatDateThai, formatTime } from '../utils/dateUtils';
import { Calendar, Clock, User, Phone, Mail, Tag } from 'lucide-react';

interface BookingDetailsProps {
  booking: Booking;
  rooms: Room[];
}

export default function BookingDetails({ booking, rooms }: BookingDetailsProps) {
  const getRoomById = (roomId: string) => rooms.find(room => room.id === roomId);

  const room = getRoomById(booking.room_id);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-800">{booking.title}</h3>
          <div className="flex items-center text-gray-600 mt-1">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="font-medium">{room?.name}</span>
            <span className="mx-2">•</span>
            <span>{formatDateThai(booking.date)}</span>
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            booking.status === 'confirmed' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
          {booking.status === 'confirmed' ? 'ยืนยันแล้ว' : 'ยกเลิกแล้ว'}
        </span>
      </div>

      <details className="mt-3 pt-3 border-t border-gray-100">
        <summary className="flex items-center justify-between text-sm font-medium text-gray-700 cursor-pointer">
          <span>รายละเอียดเพิ่มเติม</span>
        </summary>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <div className="space-y-2">
            <div className="flex items-center text-gray-600 text-sm">
              <Clock className="w-4 h-4 mr-2" />
              <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <User className="w-4 h-4 mr-2" />
              <span>{booking.user_name}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <Tag className="w-4 h-4 mr-2" />
              <span>{booking.department_name}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-gray-600 text-sm">
              <Mail className="w-4 h-4 mr-2" />
              <span>{booking.user_email}</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <Phone className="w-4 h-4 mr-2" />
              <span>{booking.user_phone}</span>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            <p>จองเมื่อ: {new Date(booking.created_at).toLocaleString('th-TH')}</p>
          </div>
        </div>

        {booking.description && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-gray-600 text-sm">{booking.description}</p>
          </div>
        )}
      </details>
    </div>
  );
}
