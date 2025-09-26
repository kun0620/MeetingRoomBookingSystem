import React, { useState, useEffect } from 'react';
import { Room, Booking, TimeSlot } from './types';
import { timeSlots } from './utils/timeSlots';
import { formatDate, isPastDate } from './utils/dateUtils';
import { useRooms } from './hooks/useRooms';
import { useBookings } from './hooks/useBookings';
import { useAuth } from './hooks/useAuth';
import RoomCard from './components/RoomCard';
import Calendar from './components/Calendar';
import TimeSlots from './components/TimeSlots';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import MainLayout from './components/MainLayout'; // Import MainLayout
import { Loader2, AlertCircle } from 'lucide-react';

type ViewMode = 'booking' | 'management' | 'admin';

function App() {
  const { rooms, loading: roomsLoading, error: roomsError } = useRooms();
  const { bookings, loading: bookingsLoading, error: bookingsError, createBooking, cancelBooking } = useBookings();
  const { user, loading: authLoading, error: authError, loginAdminWithDepartmentCode, logout, isAdmin } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [selectedStartTime, setSelectedStartTime] = useState<string>('');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('booking');
  const [submitting, setSubmitting] = useState(false);

  // Reset selections when switching rooms
  useEffect(() => {
    setSelectedStartTime('');
    setSelectedEndTime('');
    setShowBookingForm(false);
  }, [selectedRoom, selectedDate]);

  const getAvailableTimeSlots = (): TimeSlot[] => {
    if (!selectedRoom || !selectedDate) {
      return timeSlots.map(time => ({ time, available: true }));
    }

    const roomBookings = bookings.filter(
      booking => 
        booking.room_id === selectedRoom.id && 
        booking.date === selectedDate &&
        booking.status === 'confirmed'
    );

    return timeSlots.map(time => {
      const isBooked = roomBookings.some(booking => 
        time >= booking.start_time && time < booking.end_time
      );
      
      const isPast = isPastDate(selectedDate) || 
        (selectedDate === formatDate(new Date()) && time <= new Date().toTimeString().slice(0, 5));
      
      return {
        time,
        available: !isBooked && !isPast,
        booking: roomBookings.find(booking => 
          time >= booking.start_time && time < booking.end_time
        )
      };
    });
  };

  const handleTimeSelect = (time: string, type: 'start' | 'end') => {
    if (type === 'start') {
      setSelectedStartTime(time);
      if (selectedEndTime && selectedEndTime <= time) {
        setSelectedEndTime('');
      }
    } else {
      setSelectedEndTime(time);
    }
  };

  const handleBookingSubmit = async (bookingData: Omit<Booking, 'id' | 'created_at'>) => {
    try {
      setSubmitting(true);
      await createBooking(bookingData);
      setShowBookingForm(false);
      setSelectedStartTime('');
      setSelectedEndTime('');
      alert('จองห้องประชุมสำเร็จ!');
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถจองห้องได้'}`);
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

  const canProceedToBooking = selectedRoom && selectedDate && selectedStartTime && selectedEndTime;

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
          {!showBookingForm ? (
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

              {/* Date and Time Selection */}
              {selectedRoom && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <Calendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    bookings={bookings}
                  />
                  <TimeSlots
                    timeSlots={getAvailableTimeSlots()}
                    selectedStartTime={selectedStartTime}
                    selectedEndTime={selectedEndTime}
                    onTimeSelect={handleTimeSelect}
                  />
                </div>
              )}

              {/* Proceed Button */}
              {canProceedToBooking && (
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowBookingForm(true)}
                    className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-lg"
                  >
                    ดำเนินการจอง
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Booking Form */
            selectedRoom && (
              <div className="max-w-2xl mx-auto">
                <BookingForm
                  room={selectedRoom}
                  selectedDate={selectedDate}
                  selectedStartTime={selectedStartTime}
                  selectedEndTime={selectedEndTime}
                  onSubmit={handleBookingSubmit}
                  onCancel={() => setShowBookingForm(false)}
                />
              </div>
            )
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
