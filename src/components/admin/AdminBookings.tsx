import React, { useState } from 'react';
import { useBookings } from '../../hooks/useBookings';
import { useRooms } from '../../hooks/useRooms';
import { useDepartmentCodes } from '../../hooks/useDepartmentCodes'; // Import the new hook
import { Calendar, Clock, User, Phone, Mail, X, Search, Filter, Loader2, ChevronDown, Tag, Edit } from 'lucide-react'; // Add Edit icon
import { formatDateThai } from '../../utils/dateUtils';
import CancelBookingModal from '../CancelBookingModal'; // Import the CancelBookingModal
import EditBookingModal from '../EditBookingModal'; // Import the EditBookingModal
import { Booking } from '../../types'; // Import Booking type

export default function AdminBookings() {
  const { bookings, loading, cancelBooking, cancelling, updateBooking } = useBookings(); // Get 'cancelling' and 'updateBooking' state/function
  const { rooms } = useRooms();
  const { getDepartmentNameByCode } = useDepartmentCodes(); // Use the new hook
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<{ id: string; title: string } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false); // State for edit modal
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<Booking | null>(null); // State for selected booking to edit

  const getRoomById = (roomId: string) => rooms.find(room => room.id === roomId);

  const filteredBookings = bookings.filter(booking => {
    const room = getRoomById(booking.room_id);
    const departmentName = getDepartmentNameByCode(booking.department_code); // Get department name for search

    const matchesSearch = 
      booking.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) || // Search by department name
      (room?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false); // Search by room name
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleOpenCancelModal = (bookingId: string, bookingTitle: string) => {
    setSelectedBookingForCancel({ id: bookingId, title: bookingTitle });
    setShowCancelModal(true);
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setSelectedBookingForCancel(null);
  };

  const handleConfirmCancel = async (bookingId: string, departmentCode: string) => { // Now receives departmentCode
    try {
      await cancelBooking(bookingId, departmentCode);
      alert('ยกเลิกการจองสำเร็จ!');
      handleCloseCancelModal();
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถยกเลิกการจองได้'}`);
    }
  };

  const handleOpenEditModal = (booking: Booking) => {
    setSelectedBookingForEdit(booking);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedBookingForEdit(null);
  };

  const handleUpdateBooking = async (updatedBooking: Booking) => {
    try {
      if (updatedBooking.id) {
        await updateBooking(updatedBooking.id, updatedBooking);
        alert('แก้ไขการจองสำเร็จ!');
        handleCloseEditModal();
      }
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถแก้ไขการจองได้'}`);
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Calendar className="w-6 h-6 text-blue-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-800">จัดการการจอง</h2>
        </div>
        <div className="text-sm text-gray-600">
          ทั้งหมด {filteredBookings.length} รายการ
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="ค้นหาการจอง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="confirmed">ยืนยันแล้ว</option>
            <option value="cancelled">ยกเลิกแล้ว</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">ไม่พบการจอง</h3>
          <p className="text-gray-600">ไม่มีการจองที่ตรงกับเงื่อนไขการค้นหา</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const room = getRoomById(booking.room_id);
            const departmentName = getDepartmentNameByCode(booking.department_code); // Get department name
            
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
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.status === 'confirmed' ? 'ยืนยันแล้ว' : 'ยกเลิกแล้ว'}
                    </span>
                    
                    {booking.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(booking)}
                          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-full transition-colors"
                          title="แก้ไขการจอง"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenCancelModal(booking.id, booking.title)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                          title="ยกเลิกการจอง"
                          disabled={cancelling}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <details className="mt-3 pt-3 border-t border-gray-100">
                  <summary className="flex items-center justify-between text-sm font-medium text-gray-700 cursor-pointer">
                    <span>รายละเอียดเพิ่มเติม</span>
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{booking.start_time} - {booking.end_time}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <User className="w-4 h-4 mr-2" />
                        <span>{booking.user_name}</span>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Tag className="w-4 h-4 mr-2" />
                        <span>{departmentName}</span> {/* Display department name */}
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
          })}
        </div>
      )}

      {showCancelModal && selectedBookingForCancel && (
        <CancelBookingModal
          bookingId={selectedBookingForCancel.id}
          bookingTitle={selectedBookingForCancel.title}
          onConfirm={handleConfirmCancel}
          onClose={handleCloseCancelModal}
          submitting={cancelling}
        />
      )}

      {showEditModal && selectedBookingForEdit && (
        <EditBookingModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          booking={selectedBookingForEdit}
          rooms={rooms}
          onUpdate={handleUpdateBooking}
        />
      )}
    </div>
  );
}
