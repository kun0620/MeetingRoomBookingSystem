import React, { useState, useEffect } from 'react';
import { Room, Booking, TimeSlot, User } from '../types';
import { timeSlots as baseTimeSlots } from '../utils/timeSlots'; // Import base time slots
import { formatDate, isPastDate } from '../utils/dateUtils';
import Calendar from './Calendar';
import TimeSlots from './TimeSlots';
import BookingForm from './BookingForm';
import BookingReview from './BookingReview'; // Import the new component
import { X, Calendar as CalendarIcon, Clock, Info } from 'lucide-react';

interface BookingModalProps {
  room: Room;
  bookings: Booking[];
  onClose: () => void;
  onSubmitBooking: (booking: Omit<Booking, 'id' | 'created_at'>) => Promise<void>;
  submitting?: boolean;
  user: User | null; // New prop for current user
}

export default function BookingModal({
  room,
  bookings,
  onClose,
  onSubmitBooking,
  submitting = false,
  user // Destructure user prop
}: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [selectedStartTime, setSelectedStartTime] = useState<string>('');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('');
  const [showReview, setShowReview] = useState(false); // New state for review step
  const [showForm, setShowForm] = useState(false);

  // Filter bookings for the selected room and date
  const roomBookingsForSelectedDate = bookings.filter(
    (b) => b.room_id === room.id && b.date === selectedDate && b.status !== 'cancelled'
  );

  // Handler for individual time slot changes (start/end)
  const handleTimeSlotChange = (time: string, type: 'start' | 'end') => {
    if (type === 'start') {
      setSelectedStartTime(time);
    } else {
      setSelectedEndTime(time);
    }
  };

  // Handler for when a full time slot range is confirmed in TimeSlots component
  const handleConfirmTimeSlotSelection = (startTime: string, endTime: string) => {
    setSelectedStartTime(startTime);
    setSelectedEndTime(endTime);
    setShowReview(true); // Show review step after time slot is selected
  };

  const handleReviewConfirm = () => {
    setShowReview(false);
    setShowForm(true); // Proceed to form from review
  };

  const handleReviewEdit = () => {
    setShowReview(false);
    setSelectedStartTime('');
    setSelectedEndTime('');
  };

  const handleFormSubmit = async (booking: Omit<Booking, 'id' | 'created_at'>) => {
    try {
      await onSubmitBooking(booking);
      onClose();
    } catch (error) {
      console.error("Booking submission failed in modal:", error);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setShowReview(true); // Go back to review from form
  };

  // Reset time selection and view when date or room changes
  useEffect(() => {
    setSelectedStartTime('');
    setSelectedEndTime('');
    setShowReview(false);
    setShowForm(false);
  }, [selectedDate, room.id]);


  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-1">จองห้อง: {room.name}</h3>
          <p className="text-gray-600">{room.description}</p>
        </div>

        <div className="p-6">
          {!showReview && !showForm ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-blue-500" />
                  เลือกวันที่
                </h4>
                <Calendar
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  bookings={bookings.filter(b => b.room_id === room.id)}
                />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-500" />
                  เลือกช่วงเวลา
                </h4>
                <TimeSlots
                  selectedDate={selectedDate}
                  roomBookings={roomBookingsForSelectedDate}
                  selectedStartTime={selectedStartTime}
                  selectedEndTime={selectedEndTime}
                  onTimeSlotChange={handleTimeSlotChange}
                  onSelectTimeSlot={handleConfirmTimeSlotSelection}
                />
              </div>
            </div>
          ) : showReview && !showForm ? (
            <BookingReview
              room={room}
              selectedDate={selectedDate}
              selectedStartTime={selectedStartTime}
              selectedEndTime={selectedEndTime}
              onConfirm={handleReviewConfirm}
              onEdit={handleReviewEdit}
            />
          ) : (
            <BookingForm
              room={room}
              selectedDate={selectedDate}
              selectedStartTime={selectedStartTime}
              selectedEndTime={selectedEndTime}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              submitting={submitting}
              currentUser={user}
            />
          )}
        </div>
      </div>
    </div>
  );
}
