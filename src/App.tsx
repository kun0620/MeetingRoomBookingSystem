import React, { useState, useEffect } from 'react';
import { Room, Booking, TimeSlot } from './types';
import { timeSlots } from './utils/timeSlots';
import { formatDate, isPastDate } from './utils/dateUtils';
import { useRooms } from './hooks/useRooms';
import { useBookings } from './hooks/useBookings';
import { useAuth } from './hooks/useAuth';
import RoomCard from './components/RoomCard';
import Calendar from './components/Calendar'; // Keep for now, might be removed if only used in modal
import TimeSlots from './components/TimeSlots'; // Keep for now, might be removed if only used in modal
import BookingForm from './components/BookingForm'; // Keep for now, might be removed if only used in modal
import BookingList from './components/BookingList';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import MainLayout from './components/MainLayout';
import BookingModal from './components/BookingModal'; // Import BookingModal
import { Loader2, AlertCircle } from 'lucide-react';

type ViewMode = 'booking' | 'management' | 'admin';

function App() {
  const { rooms, loading: roomsLoading, error: roomsError } = useRooms();
  const { bookings, loading: bookingsLoading, error: bookingsError, createBooking, cancelBooking } = useBookings();
  const { user, loading: authLoading, error: authError, loginAdminWithDepartmentCode, logout, isAdmin } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false); // New state for modal visibility
  const [viewMode, setViewMode] = useState<ViewMode>('booking');
  const [submitting, setSubmitting] = useState(false);

  const handleBookingSubmit = async (bookingData: Omit<Booking, 'id' | 'created_at'>) => {
    try {
      setSubmitting(true);
      await createBooking(bookingData);
      alert('จองห้องประชุมสำเร็จ!');
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถจองห้องได้'}`);
      throw error; // Re-throw to allow modal to handle error if needed
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (confirm('คุณต้องการยกเลิกการจองนี้หรือไม่?')) {
      try {
        await cancelBooking(bookingId);
        alert('ยกเลิกการจองสำเร็จ!');
      } catch (error) {
        alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถยกเลิกการจองได้'}`);
      }
    }
  };

  // Admin login handling - now uses department code
  const handleAdminLogin = async (code: string) => {
    const success = await loginAdminWithDepartmentCode(code); // Call the new function
    if (success) {
      setViewMode('admin');
    }
    return success;
  };

  // Loading state
  if (roomsLoading || bookingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (roomsError || bookingsError) {
    console.error('App errors:', { roomsError, bookingsError });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
          <p className="text-gray-600">{roomsError || bookingsError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            รีเฟรชหน้า
          </button>
        </div>
      </div>
    );
  }

  // Admin login view
  if (viewMode === 'admin' && !user) {
    return (
      <AdminLogin 
        onLogin={handleAdminLogin}
        loading={authLoading}
        error={authError}
        onBackToMain={() => setViewMode('booking')} // Pass the function to go back
      />
    );
  }

  // Admin dashboard view
  if (viewMode === 'admin' && user && isAdmin) {
    return (
      <AdminDashboard 
        user={user}
        onLogout={() => {
          logout();
          setViewMode('booking');
        }}
        onBackToMain={() => setViewMode('booking')}
      />
    );
  }

  return (
    <MainLayout
      viewMode={viewMode}
      setViewMode={setViewMode}
      user={user}
      isAdmin={isAdmin}
      onLogout={logout}
      onAdminLoginClick={() => setViewMode('admin')}
    >
      {viewMode === 'booking' ? (
        <>
          {/* Room Selection */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">เลือกห้องประชุม</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onSelect={setSelectedRoom}
                  isSelected={selectedRoom?.id === room.id}
                  submitting={submitting}
                />
              ))}
            </div>
          </section>

          {/* Proceed Button to open modal - now fixed at bottom */}
          {selectedRoom && (
            <div className="fixed bottom-0 left-0 right-0 bg-transparent p-4 shadow-lg z-30 lg:ml-[290px] flex justify-center">
              <button
                onClick={() => setShowBookingModal(true)}
                className="px-8 py-3 bg-blue-500 border border-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
              >
                ดำเนินการจองห้อง {selectedRoom.name}
              </button>
            </div>
          )}

          {/* Booking Modal */}
          {showBookingModal && selectedRoom && (
            <BookingModal
              room={selectedRoom}
              bookings={bookings}
              onClose={() => setShowBookingModal(false)}
              onSubmitBooking={handleBookingSubmit}
              submitting={submitting}
            />
          )}
        </>
      ) : (
        /* Booking Management */
        <BookingList
          bookings={bookings}
          rooms={rooms}
          onCancelBooking={handleCancelBooking}
        />
      )}
    </MainLayout>
  );
}

export default App;
