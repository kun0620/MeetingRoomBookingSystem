import React, { useState } from 'react';
import { User, Booking, Room } from '../types';
import { useBookings } from '../hooks/useBookings';
import { useRooms } from '../hooks/useRooms';
import BookingList from './BookingList';
import EditBookingModal from './EditBookingModal'; // Import the new modal
import { Loader2, AlertCircle } from 'lucide-react';

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
  onBackToMain: () => void;
}

export default function UserDashboard({ user, onLogout, onBackToMain }: UserDashboardProps) {
  const { bookings, loading: bookingsLoading, error: bookingsError, cancelBooking, updateBooking, refetch: refetchBookings } = useBookings();
  const { rooms, loading: roomsLoading, error: roomsError } = useRooms();

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const userBookings = bookings.filter(booking => booking.user_id === user.id);

  const handleCancelBooking = async (bookingId: string) => {
    if (confirm('คุณต้องการยกเลิกการจองนี้หรือไม่?')) {
      try {
        await cancelBooking(bookingId); // No departmentCode needed for user's own booking
        alert('ยกเลิกการจองสำเร็จ!');
        refetchBookings(); // Refetch bookings to update the list
      } catch (error) {
        alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถยกเลิกการจองได้'}`);
      }
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowEditModal(true);
  };

  const handleSaveEditedBooking = async (bookingId: string, updatedData: Partial<Booking>) => {
    try {
      await updateBooking(bookingId, updatedData);
      alert('แก้ไขการจองสำเร็จ!');
      refetchBookings(); // Refetch bookings to update the list
    } catch (error) {
      throw error; // Re-throw to be caught by the modal's onSubmit
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedBooking(null);
  };

  if (bookingsLoading || roomsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-3 text-gray-600">กำลังโหลดการจองของคุณ...</p>
      </div>
    );
  }

  if (bookingsError || roomsError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <AlertCircle className="w-8 h-8 mb-3" />
        <p>เกิดข้อผิดพลาดในการโหลดการจอง: {bookingsError || roomsError}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          รีเฟรชหน้า
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">การจองของฉัน</h1>
        <button
          onClick={onBackToMain}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          กลับหน้าหลัก
        </button>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-lg font-medium text-blue-800">ยินดีต้อนรับ, {user.name || user.email}!</p>
        <p className="text-sm text-blue-700">คุณสามารถดูและจัดการการจองห้องประชุมของคุณได้ที่นี่</p>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">รายการการจองของคุณ</h2>
      {userBookings.length > 0 ? (
        <BookingList
          bookings={userBookings}
          rooms={rooms}
          onCancelBooking={handleCancelBooking}
          onEditBooking={handleEditBooking} // Pass the edit handler
          showUserColumn={false} // Don't show user column for user's own dashboard
        />
      ) : (
        <div className="p-6 text-center text-gray-600 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-lg">คุณยังไม่มีการจองห้องประชุม</p>
          <button
            onClick={() => onBackToMain()}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            จองห้องประชุมตอนนี้
          </button>
        </div>
      )}

      {selectedBooking && showEditModal && (
        <EditBookingModal
          booking={selectedBooking}
          rooms={rooms}
          onSave={handleSaveEditedBooking}
          onClose={handleCloseEditModal}
        />
      )}
    </div>
  );
}
