import React, { useState } from 'react';
import { useRooms } from '../hooks/useRooms';
import { useBookings } from '../hooks/useBookings';
import RoomCard from '../components/RoomCard';
import BookingModal from '../components/BookingModal';
import BookingList from '../components/BookingList';
import { Room, Booking } from '../types';
import { Loader2, AlertCircle } from 'lucide-react';

export default function HomePage() {
  const { rooms, loading: roomsLoading, error: roomsError } = useRooms();
  const { 
    bookings, 
    loading: bookingsLoading, 
    error: bookingsError, 
    createBooking, 
    cancelBooking, 
    refetch: refetchBookings,
    cancelling // Get the cancelling state
  } = useBookings();

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const handleOpenBookingModal = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleCloseBookingModal = () => {
    setSelectedRoom(null);
  };

  const handleSubmitBooking = async (bookingData: Omit<Booking, 'id' | 'created_at'>) => {
    setSubmittingBooking(true);
    try {
      await createBooking(bookingData);
      await refetchBookings(); // Refetch bookings to update the list
      handleCloseBookingModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการจองห้อง');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleCancelBooking = async (bookingId: string, departmentCode: string) => { // Updated signature
    try {
      await cancelBooking(bookingId, departmentCode);
      await refetchBookings(); // Refetch bookings to update the list
    } catch (err) {
      alert(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการยกเลิกการจอง');
    }
  };

  const loading = roomsLoading || bookingsLoading;
  const error = roomsError || bookingsError;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
          ระบบจองห้องประชุม
        </h1>
        <p className="text-lg text-gray-600">
          เลือกห้องประชุมที่ต้องการและทำการจองได้อย่างง่ายดาย
        </p>
      </header>

      <main className="max-w-6xl mx-auto">
        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            <p className="ml-3 text-lg text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative flex items-center justify-center h-64">
            <AlertCircle className="w-6 h-6 mr-3" />
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} onBookNow={handleOpenBookingModal} />
            ))}
          </div>
        )}

        {!loading && !error && (
          <BookingList 
            bookings={bookings} 
            rooms={rooms} 
            onCancelBooking={handleCancelBooking} 
            cancelling={cancelling} // Pass cancelling state
          />
        )}
      </main>

      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          bookings={bookings}
          onClose={handleCloseBookingModal}
          onSubmitBooking={handleSubmitBooking}
          submitting={submittingBooking}
        />
      )}
    </div>
  );
}
