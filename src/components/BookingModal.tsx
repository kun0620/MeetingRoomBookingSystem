import React, { useState, useEffect } from 'react';
import { Room, Booking, TimeSlot } from '../types';
import { timeSlots } from '../utils/timeSlots';
import { formatDate, isPastDate } from '../utils/dateUtils';
import Calendar from './Calendar';
import TimeSlots from './TimeSlots';
import BookingForm from './BookingForm';
import { X, Loader2 } from 'lucide-react';

interface BookingModalProps {
  room: Room;
  bookings: Booking[];
  onClose: () => void;
  onSubmitBooking: (booking: Omit<Booking, 'id' | 'created_at'>) => Promise<void>;
  submitting: boolean;
}

export default function BookingModal({
  room,
  bookings,
  onClose,
  onSubmitBooking,
  submitting
}: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [selectedStartTime, setSelectedStartTime] = useState<string>('');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('');
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Reset selections when room or date changes
  useEffect(() => {
    setSelectedStartTime('');
    setSelectedEndTime('');
    setShowBookingForm(false);
  }, [room.id, selectedDate]);

  const getAvailableTimeSlots = (): TimeSlot[] => {
    if (!room || !selectedDate) {
      return timeSlots.map(time => ({ time, available: true }));
    }

    const roomBookings = bookings.filter(
      booking => 
        booking.room_id === room.id && 
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
    await onSubmitBooking(bookingData);
    onClose(); // Close modal after submission
  };

  const canProceedToForm = selectedDate && selectedStartTime && selectedEndTime;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative"> {/* Added flex flex-col */}
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            จองห้องประชุม: {room.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
            title="ปิด"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-grow overflow-y-auto"> {/* Added flex-grow overflow-y-auto */}
          <div className="p-6 space-y-8"> {/* Inner padding for content */}
            {!showBookingForm ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              </>
            ) : (
              <BookingForm
                room={room}
                selectedDate={selectedDate}
                selectedStartTime={selectedStartTime}
                selectedEndTime={selectedEndTime}
                onSubmit={handleBookingSubmit}
                onCancel={() => setShowBookingForm(false)}
                submitting={submitting}
              />
            )}
          </div>
        </div>

        {/* Sticky Footer for "ดำเนินการจอง" button */}
        {!showBookingForm && (
          <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 flex justify-center z-10">
            <button
              onClick={() => setShowBookingForm(true)}
              disabled={!canProceedToForm || submitting}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  กำลังดำเนินการ...
                </>
              ) : (
                'ดำเนินการจอง'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
