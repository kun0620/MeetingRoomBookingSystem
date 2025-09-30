import React, { useMemo } from 'react';
import { TimeSlot, Booking } from '../types';
import { Clock } from 'lucide-react';
import { timeSlots as baseTimeSlots } from '../utils/timeSlots'; // Import base time slots
import { isPastDate, isPastTime, formatDate } from '../utils/dateUtils'; // Import utility functions

interface TimeSlotsProps {
  selectedDate: string;
  roomBookings: Booking[];
  selectedStartTime: string;
  selectedEndTime: string;
  onTimeSlotChange: (time: string, type: 'start' | 'end') => void; // Renamed prop
  onSelectTimeSlot: (startTime: string, endTime: string) => void; // New prop for final selection
}

export default function TimeSlots({
  selectedDate,
  roomBookings,
  selectedStartTime,
  selectedEndTime,
  onTimeSlotChange, // Renamed
  onSelectTimeSlot, // New
}: TimeSlotsProps) {

  // Generate available time slots based on selectedDate and roomBookings
  const displayTimeSlots = useMemo(() => {
    const now = new Date();
    const currentSelectedDate = new Date(selectedDate);

    return baseTimeSlots.map(slot => {
      const isBooked = roomBookings.some(booking =>
        (slot.time >= booking.start_time && slot.time < booking.end_time) ||
        (slot.end > booking.start_time && slot.time < booking.end_time) // Covers overlaps
      );

      const isPast = isPastDate(selectedDate) || (selectedDate === formatDate(now) && isPastTime(slot.time, now));

      return {
        time: slot.time,
        end: slot.end,
        available: !isBooked && !isPast,
      };
    });
  }, [selectedDate, roomBookings]);

  const handleStartTimeClick = (time: string) => {
    if (selectedStartTime === time) {
      onTimeSlotChange('', 'start');
      onTimeSlotChange('', 'end'); // Also clear end time if start is deselected
    } else {
      onTimeSlotChange(time, 'start');
      // If new start time is later than current end time, clear end time
      if (selectedEndTime && time >= selectedEndTime) {
        onTimeSlotChange('', 'end');
      }
    }
  };

  const handleEndTimeClick = (time: string) => {
    onTimeSlotChange(time, 'end');
    // Once both start and end are selected, trigger the final selection callback
    if (selectedStartTime && time > selectedStartTime) {
      onSelectTimeSlot(selectedStartTime, time);
    }
  };

  const isTimeSelected = (time: string) => {
    if (!selectedStartTime) return false;
    if (!selectedEndTime) return time === selectedStartTime;
    return time >= selectedStartTime && time <= selectedEndTime;
  };

  const isSelectableAsEndTime = (time: string) => {
    if (!selectedStartTime) return false;
    return time > selectedStartTime;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">เลือกช่วงเวลา</h2>
      
      <div className="mb-6">
        <div className="flex items-center mb-2 text-gray-700">
          <Clock className="w-4 h-4 mr-2" />
          <span className="font-medium">เวลาเริ่มต้น:</span>
          <span className="ml-2 font-bold text-blue-600">{selectedStartTime || 'ยังไม่ได้เลือก'}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <Clock className="w-4 h-4 mr-2" />
          <span className="font-medium">เวลาสิ้นสุด:</span>
          <span className="ml-2 font-bold text-blue-600">{selectedEndTime || 'ยังไม่ได้เลือก'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {displayTimeSlots.map((slot, index) => {
          const isSelected = isTimeSelected(slot.time);
          const isAvailable = slot.available;
          const canBeEndTime = isSelectableAsEndTime(slot.time);

          return (
            <div key={index} className="relative">
              <button
                onClick={() => handleStartTimeClick(slot.time)}
                disabled={!isAvailable}
                className={`
                  w-full py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isSelected
                    ? 'bg-blue-500 text-white'
                    : isAvailable
                      ? 'bg-gray-100 text-gray-800 hover:bg-blue-50 hover:text-blue-700'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {slot.time}
              </button>
              {selectedStartTime && isAvailable && canBeEndTime && !isSelected && (
                <button
                  onClick={() => handleEndTimeClick(slot.time)}
                  className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-80 text-white rounded-lg text-xs opacity-0 hover:opacity-100 transition-opacity duration-200"
                  title="เลือกเป็นเวลาสิ้นสุด"
                >
                  สิ้นสุด
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
