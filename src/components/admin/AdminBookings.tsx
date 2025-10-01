import React, { useState, useEffect } from 'react'; // Added useEffect for logging
import { useBookings } from '../../hooks/useBookings';
import { useRooms } from '../../hooks/useRooms';
import { useDepartmentCodes } from '../../hooks/useDepartmentCodes';
import { Calendar, Clock, User, Phone, Mail, X, Search, Filter, Loader2, ChevronDown, Tag, Edit, Building } from 'lucide-react';
import { formatDateThai, formatTime } from '../../utils/dateUtils'; // Removed formatDateTimeThai
import CancelBookingModal from '../../components/CancelBookingModal';
import EditBookingModal from '../../components/EditBookingModal';
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

  // Log bookings and departmentCodes when they change
  useEffect(() => {
    console.log('AdminBookings: Current bookings data:', bookings);
    console.log('AdminBookings: Current departmentCodes data:', departmentCodes);
  }, [bookings, departmentCodes]);

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : 'ไม่พบห้อง';
  };

  const getDepartmentName = (departmentCode: string) => {
    const department = departmentCodes.find(d => d.code === departmentCode);
    return department ? department.department_name : 'ไม่พบแผนก'; // แก้ไขตรงนี้: ใช้ department_name แทน name
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchTerm === '' ||
      (booking.contact_person && booking.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.user_name && booking.user_name.toLowerCase().includes(searchTerm.toLowerCase())) || // เพิ่ม user_name ในการค้นหา
      (booking.contact_email && booking.contact_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.user_email && booking.user_email.toLowerCase().includes(searchTerm.toLowerCase())) || // เพิ่ม user_email ในการค้นหา
      getRoomName(booking.room_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDepartmentName(booking.department_code).toLowerCase().includes(searchTerm.toLowerCase());

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
        await cancelBooking(selectedBookingToCancel.id, selectedBookingToCancel.department_code);
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
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{booking.title}</h3>
                    <div className="flex items-center text-gray-600 mt-1">
                      <Building className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="font-medium">{getRoomName(booking.room_id)}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDateThai(booking.date)}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : booking.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                    {booking.status === 'confirmed' && 'ยืนยันแล้ว'}
                    {booking.status === 'pending' && 'รอดำเนินการ'}
                    {booking.status === 'cancelled' && 'ยกเลิกแล้ว'}
                    {booking.status === 'completed' && 'เสร็จสิ้น'}
                  </span>
                </div>

                <details className="mt-3 pt-3 border-t border-gray-100">
                  <summary className="flex items-center justify-between text-sm font-medium text-gray-700 cursor-pointer">
                    <span>รายละเอียดเพิ่มเติม</span>
                    <ChevronDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="grid grid-cols-1 gap-4 mt-3">
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{formatTime(booking.start_time)} - {formatTime(booking.end_time)}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <User className="w-4 h-4 mr-2" />
                        <span>{booking.contact_person || booking.user_name}</span> {/* แก้ไขตรงนี้: ใช้ user_name เป็นค่าสำรอง */}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{booking.contact_email || booking.user_email}</span> {/* แก้ไขตรงนี้: ใช้ user_email เป็นค่าสำรอง */}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{booking.user_phone}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Tag className="w-4 h-4 mr-2 text-purple-500" />
                        <span>{getDepartmentName(booking.department_code)}</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      <p>จองเมื่อ: {new Date(booking.created_at).toLocaleString('th-TH', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit', hour12: false
                      })}</p>
                    </div>
                  </div>

                  {booking.description && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-gray-600 text-sm">{booking.description}</p>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end space-x-2">
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
                </details>
              </div>
            ))}
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
          isOpen={showEditModal}
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
