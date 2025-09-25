import React, { useState, useEffect } from 'react';
import { Room, Booking, TimeSlot } from './types';
import { rooms } from './data/rooms';
import { timeSlots } from './utils/timeSlots';
import { formatDate, isPastDate } from './utils/dateUtils';
import { useLocalStorage } from './hooks/useLocalStorage';
import RoomCard from './components/RoomCard';
import Calendar from './components/Calendar';
import TimeSlots from './components/TimeSlots';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import { CalendarDays, Building, LineChart, MessageSquare } from 'lucide-react';

type ViewMode = 'booking' | 'management';

function App() {
  const [bookings, setBookings] = useLocalStorage<Booking[]>('meeting-room-bookings', []);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [selectedStartTime, setSelectedStartTime] = useState<string>('');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('booking');

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

  const handleBookingSubmit = (bookingData: Omit<Booking, 'id' | 'created_at'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    
    setBookings(prev => [...prev, newBooking]);
    setShowBookingForm(false);
    setSelectedStartTime('');
    setSelectedEndTime('');
    
    // Show success message (could be replaced with a proper toast notification)
    alert('จองห้องประชุมสำเร็จ!');
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm('คุณต้องการยกเลิกการจองนี้หรือไม่?')) {
      setBookings(prev => prev.map(booking =>
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' as const }
          : booking
      ));
    }
  };

  const canProceedToBooking = selectedRoom && selectedDate && selectedStartTime && selectedEndTime;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ระบบจองห้องประชุม</h1>
                <p className="text-sm text-gray-500">Meeting Room Booking System</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('booking')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'booking'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                จองห้อง
              </button>
              <button
                onClick={() => setViewMode('management')}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'management'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LineChart className="w-4 h-4 mr-2" />
                จัดการการจอง
              </button>
              <div className="flex items-center px-4 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200">
                <MessageSquare className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">LINE Official พร้อม</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'booking' ? (
          <>
            {!showBookingForm ? (
              <>
                {/* Room Selection */}
                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">เลือกห้องประชุม</h2>
                  <div className="grid md:grid-cols-3 gap-6">
                    {rooms.map(room => (
                      <RoomCard
                        key={room.id}
                        room={room}
                        onSelect={setSelectedRoom}
                        isSelected={selectedRoom?.id === room.id}
                      />
                    ))}
                  </div>
                </section>

                {/* Date and Time Selection */}
                {selectedRoom && (
                  <div className="grid lg:grid-cols-2 gap-8 mb-8">
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
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p className="mb-2">ระบบจองห้องประชุมออนไลน์</p>
            <p className="text-sm">สำหรับการเชื่อมต่อ LINE Official Account กรุณาติดต่อผู้ดูแลระบบ</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;