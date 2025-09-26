import React from 'react';
import { Booking, Room } from '../types';
import { Calendar, Clock, User, Phone, Mail, X } from 'lucide-react';
import { formatDateThai } from '../utils/dateUtils';

interface BookingListProps {
  bookings: Booking[];
  rooms: Room[];
  onCancelBooking: (bookingId: string) => void;
}

export default function BookingList({ bookings, rooms, onCancelBooking }: BookingListProps) {
  const getRoomById = (roomId: string) => rooms.find(room => room.id === roomId);

  const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');

  if (confirmedBookings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">ยังไม่มีการจอง</h3>
        <p className="text-gray-600">เลือกห้องประชุมและทำการจองเพื่อเริ่มต้นใช้งาน</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">รายการจองทั้งหมด</h2>
      <div className="space-y-4">
        {confirmedBookings.map((booking) => {
          const room = getRoomById(booking.room_id);
          
          return (
            <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
                <button
                  onClick={() => onCancelBooking(booking.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                  title="ยกเลิกการจอง"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{booking.start_time} - {booking.end_time}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <User className="w-4 h-4 mr-2" />
                    <span>{booking.user_name}</span>
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
              </div>
              
              {booking.description && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-gray-600 text-sm">{booking.description}</p>
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ยืนยันแล้ว
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
