import React from 'react';
import { Booking, Room } from '../types';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Calendar, Clock, Users, Building, Tag, Phone, Mail, Edit, Trash2 } from 'lucide-react';

interface BookingListProps {
  bookings: Booking[];
  rooms: Room[];
  onCancelBooking: (bookingId: string) => void;
  onEditBooking?: (booking: Booking) => void; // Make onEditBooking optional
  showUserColumn: boolean;
}

export default function BookingList({ bookings, rooms, onCancelBooking, onEditBooking, showUserColumn }: BookingListProps) {
  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : 'ไม่พบห้อง';
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <Building className="inline-block w-4 h-4 mr-1" /> ห้อง
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <Calendar className="inline-block w-4 h-4 mr-1" /> วันที่
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <Clock className="inline-block w-4 h-4 mr-1" /> เวลา
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <Tag className="inline-block w-4 h-4 mr-1" /> หัวข้อ
            </th>
            {showUserColumn && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <Users className="inline-block w-4 h-4 mr-1" /> ผู้จอง
              </th>
            )}
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              สถานะ
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {getRoomName(booking.room_id)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {format(new Date(booking.date), 'dd MMMM yyyy', { locale: th })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {booking.start_time} - {booking.end_time}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {booking.title}
              </td>
              {showUserColumn && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <p className="font-medium">{booking.user_name}</p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <Mail className="w-3 h-3 mr-1" /> {booking.user_email}
                  </p>
                  {booking.user_phone && (
                    <p className="text-xs text-gray-500 flex items-center">
                      <Phone className="w-3 h-3 mr-1" /> {booking.user_phone}
                    </p>
                  )}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                  {booking.status === 'pending' && 'รอการยืนยัน'}
                  {booking.status === 'confirmed' && 'ยืนยันแล้ว'}
                  {booking.status === 'cancelled' && 'ยกเลิกแล้ว'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {booking.status !== 'cancelled' && (
                  <div className="flex items-center justify-end space-x-2">
                    {onEditBooking && ( // Conditionally render edit button
                      <button
                        onClick={() => onEditBooking(booking)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                        title="แก้ไขการจอง"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => onCancelBooking(booking.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                      title="ยกเลิกการจอง"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {bookings.length === 0 && (
        <div className="p-6 text-center text-gray-600 bg-gray-50">
          <p className="text-lg">ไม่พบรายการจอง</p>
        </div>
      )}
    </div>
  );
}
