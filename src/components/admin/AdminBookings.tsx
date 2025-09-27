import React, { useState } from 'react';
import { useBookings } from '../../hooks/useBookings';
import { useRooms } from '../../hooks/useRooms';
import { useDepartmentCodes } from '../../hooks/useDepartmentCodes'; // Import the new hook
import { Calendar, Clock, User, Phone, Mail, X, Search, Filter, Loader2, ChevronDown, Tag, Edit, Building } from 'lucide-react'; // Resolved import
import { formatDateTimeThai } from '../../utils/dateUtils';
import CancelBookingModal from '../../components/CancelBookingModal'; // Corrected import path
import EditBookingModal from '../../components/EditBookingModal'; // Corrected import path
import { Booking, Room, DepartmentCode } from '../../types';

export default function AdminBookings() {
  const { bookings, loading: bookingsLoading, cancelBooking, updateBooking } = useBookings();
  const { rooms, loading: roomsLoading } = useRooms();
  const { departmentCodes, loading: departmentCodesLoading } = useDepartmentCodes();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState<Booking | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBookingToEdit, setSelectedBookingToEdit] = useState<Booking | null>(null);

  const loading = bookingsLoading || roomsLoading || departmentCodesLoading;

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : 'ไม่พบห้อง';
  };

  const getDepartmentName = (departmentCodeId: string) => {
    const department = departmentCodes.find(d => d.id === departmentCodeId);
    return department ? department.name : 'ไม่พบแผนก';
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchTerm === '' ||
      booking.contact_person_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.contact_person_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getRoomName(booking.room_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDepartmentName(booking.department_code_id).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'ทั้งหมด' || booking.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleCancelClick = (booking: Booking) => {
    setSelectedBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (selectedBookingToCancel) {
      try {
        await cancelBooking(selectedBookingToCancel.id);
        alert('ยกเลิกการจองสำเร็จ!');
        setShowCancelModal(false);
        setSelectedBookingToCancel(null);
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert(`เกิดข้อผิดพลาดในการยกเลิกการจอง: ${error instanceof Error ? error.message : 'ไม่สามารถยกเลิกการจองได้'}`);
      }
    }
  };

  const handleEditClick = (booking: Booking) => {
    setSelectedBookingToEdit(booking);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedBooking: Booking) => {
    try {
      await updateBooking(updatedBooking.id, updatedBooking);
      alert('อัปเดตการจองสำเร็จ!');
      setShowEditModal(false);
      setSelectedBookingToEdit(null);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert(`เกิดข้อผิดพลาดในการอัปเดตการจอง: ${error instanceof Error ? error.message : 'ไม่สามารถอัปเดตการจองได้'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">จัดการการจอง</h2>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อผู้ติดต่อ, อีเมล, ห้อง, แผนก..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ทั้งหมด">สถานะทั้งหมด</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="confirmed">ยืนยันแล้ว</option>
              <option value="cancelled">ยกเลิกแล้ว</option>
              <option value="completed">เสร็จสิ้น</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            ไม่พบข้อมูลการจอง
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">ห้องประชุม</th>
                  <th className="py-3 px-6 text-left">ผู้ติดต่อ</th>
                  <th className="py-3 px-6 text-left">แผนก</th>
                  <th className="py-3 px-6 text-left">เวลา</th>
                  <th className="py-3 px-6 text-left">สถานะ</th>
                  <th className="py-3 px-6 text-center">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="font-medium">{getRoomName(booking.room_id)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-left">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-500" />
                        <span>{booking.contact_person_name}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Mail className="w-3 h-3 mr-1" />
                        <span>{booking.contact_person_email}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Phone className="w-3 h-3 mr-1" />
                        <span>{booking.contact_person_phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-left">
                      <Tag className="w-4 h-4 mr-2 text-purple-500 inline-block" />
                      {getDepartmentName(booking.department_code_id)}
                    </td>
                    <td className="py-3 px-6 text-left">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-green-500" />
                        <span>{formatDateTimeThai(booking.start_time, 'date')}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{formatDateTimeThai(booking.start_time, 'time')} - {formatDateTimeThai(booking.end_time, 'time')}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-left">
                      <span
                        className={`py-1 px-3 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-200 text-green-800'
                            : booking.status === 'pending'
                            ? 'bg-yellow-200 text-yellow-800'
                            : booking.status === 'cancelled'
                            ? 'bg-red-200 text-red-800'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {booking.status === 'confirmed' && 'ยืนยันแล้ว'}
                        {booking.status === 'pending' && 'รอดำเนินการ'}
                        {booking.status === 'cancelled' && 'ยกเลิกแล้ว'}
                        {booking.status === 'completed' && 'เสร็จสิ้น'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex item-center justify-center space-x-2">
                        <button
                          onClick={() => handleEditClick(booking)}
                          className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center transition-colors"
                          title="แก้ไข"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <button
                            onClick={() => handleCancelClick(booking)}
                            className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                            title="ยกเลิก"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCancelModal && selectedBookingToCancel && (
        <CancelBookingModal
          booking={selectedBookingToCancel}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleConfirmCancel}
          roomName={getRoomName(selectedBookingToCancel.room_id)}
        />
      )}

      {showEditModal && selectedBookingToEdit && (
        <EditBookingModal
          booking={selectedBookingToEdit}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
          rooms={rooms}
          departmentCodes={departmentCodes}
        />
      )}
    </div>
  );
}
