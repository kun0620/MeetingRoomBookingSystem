import React from 'react';
import { TimeSlot } from '../types';
import { Clock } from 'lucide-react';

interface TimeSlotsProps {
  timeSlots: TimeSlot[];
  selectedStartTime: string;
  selectedEndTime: string;
  onTimeSelect: (time: string, type: 'start' | 'end') => void;
}

export default function TimeSlots({
  timeSlots,
  selectedStartTime,
  selectedEndTime,
  onTimeSelect,
}: TimeSlotsProps) {
  const handleStartTimeClick = (time: string) => {
    onTimeSelect(time, 'start');
  };

  const handleEndTimeClick = (time: string) => {
    onTimeSelect(time, 'end');
  };

  const isTimeSelected = (time: string) => {
    if (!selectedStartTime) return false;
    if (!selectedEndTime) return time === selectedStartTime;
    return time >= selectedStartTime && time < selectedEndTime;
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
        {timeSlots.map((slot, index) => {
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
