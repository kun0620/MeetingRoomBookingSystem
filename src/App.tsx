import React, { useState, useEffect } from 'react';
import { Room, Booking, TimeSlot, ViewMode } from './types'; // Import ViewMode
import { timeSlots } from './utils/timeSlots';
import { formatDate, isPastDate } from './utils/dateUtils';
import { useRooms } from './hooks/useRooms';
import { useBookings } from './hooks/useBookings';
import { useAuth } from './hooks/useAuth';
import { ThemeProvider } from './components/ThemeProvider';
import RoomCard from './components/RoomCard';
import Calendar from './components/Calendar';
import TimeSlots from './components/TimeSlots';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import MainLayout from './components/MainLayout';
import BookingModal from './components/BookingModal';
import { Loader2, AlertCircle } from 'lucide-react';

function App() {
  const { rooms, loading: roomsLoading, error: roomsError } = useRooms();
  const { bookings, loading: bookingsLoading, error: bookingsError, createBooking, cancelBooking } = useBookings();
  const { user, loading: authLoading, error: authError, loginAdminWithDepartmentCode, logout, isAdmin } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('booking'); // Use ViewMode type
  const [submitting, setSubmitting] = useState(false);
  const [selectedDateForStatus, setSelectedDateForStatus] = useState<string>(formatDate(new Date())); // New state for calendar in status view

  const handleBookingSubmit = async (bookingData: Omit<Booking, 'id' | 'created_at'>) => {
    try {
      setSubmitting(true);
      await createBooking(bookingData);
      alert('จองห้องประชุมสำเร็จ!');
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถจองห้องได้'}`);
      throw error;
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

  const handleAdminLogin = async (code: string) => {
    const success = await loginAdminWithDepartmentCode(code);
    if (success) {
      // After successful login, determine view mode based on user role
      if (isAdmin) { // isAdmin will be true if the logged-in user (departmentCodeAdmin) has role 'admin'
        setViewMode('admin');
      } else { // If not admin, it's a regular user (departmentCodeAdmin with role 'user')
        setViewMode('user-dashboard');
      }
    }
    return success;
  };

  // New handler for proceeding to booking, with login enforcement
  const handleProceedToBooking = () => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการจองห้องประชุม');
      setViewMode('admin'); // Redirect to admin login view (which also serves as a general login for department codes)
    } else {
      setShowBookingModal(true);
    }
  };

  // Filter bookings for the status page based on selectedDateForStatus
  const filteredBookingsForStatus = bookings.filter(booking => 
    booking.date === selectedDateForStatus
  );

  if (roomsLoading || bookingsLoading || authLoading) { // Include authLoading
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (roomsError || bookingsError || authError) { // Include authError
    console.error('App errors:', { roomsError, bookingsError, authError });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
          <p className="text-gray-600">{roomsError || bookingsError || authError}</p>
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

  // Conditional rendering for dashboards and login
  if (!user && viewMode === 'admin') { // Only show AdminLogin if no user is logged in and viewMode is 'admin'
    return (
      <AdminLogin 
        onLogin={handleAdminLogin}
        loading={authLoading}
        error={authError}
        onBackToMain={() => setViewMode('booking')}
      />
    );
  }

  if (user && isAdmin && viewMode === 'admin') { // Show AdminDashboard if admin is logged in and viewMode is 'admin'
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

  if (user && !isAdmin && viewMode === 'user-dashboard') { // Show UserDashboard if non-admin user is logged in and viewMode is 'user-dashboard'
    return (
      <UserDashboard 
        user={user}
        onLogout={() => {
          logout();
          setViewMode('booking');
        }}
        onBackToMain={() => setViewMode('booking')}
      />
    );
  }

  // Default rendering for booking and status views, wrapped in MainLayout
  return (
    <ThemeProvider>
      <MainLayout
        viewMode={viewMode}
        setViewMode={setViewMode}
        user={user}
        isAdmin={isAdmin}
        onLogout={logout}
        onAdminLoginClick={() => setViewMode('admin')} // Set viewMode to 'admin' to show AdminLogin form
      >
        {viewMode === 'booking' ? (
          <>
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

            {selectedRoom && (
              <div className="fixed bottom-0 left-0 right-0 bg-transparent p-4 shadow-lg z-30 lg:ml-[290px] flex justify-center">
                <button
                  onClick={handleProceedToBooking} // Use the new handler
                  className="px-8 py-3 bg-blue-500 border border-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                >
                  ดำเนินการจองห้อง {selectedRoom.name}
                </button>
              </div>
            )}

            {showBookingModal && selectedRoom && (
              <BookingModal
                room={selectedRoom}
                bookings={bookings}
                onClose={() => setShowBookingModal(false)}
                onSubmitBooking={handleBookingSubmit}
                submitting={submitting}
                user={user} // Pass the user object
              />
            )}
          </>
        ) : (
          /* Booking Status View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">ปฏิทินสถานะการจอง</h2>
              <Calendar
                selectedDate={selectedDateForStatus}
                onDateSelect={setSelectedDateForStatus}
                bookings={bookings} // Pass all bookings to highlight days
              />
            </div>
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                การจองสำหรับวันที่ {formatDate(new Date(selectedDateForStatus), 'thai')}
              </h2>
              <BookingList
                bookings={filteredBookingsForStatus} // Pass filtered bookings
                rooms={rooms}
                onCancelBooking={handleCancelBooking}
              />
            </div>
          </div>
        )}
      </MainLayout>
    </ThemeProvider>
  );
}

export default App;
