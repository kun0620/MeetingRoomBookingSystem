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
  onTimeSelect 
}: TimeSlotsProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-4">
        <Clock className="w-5 h-5 mr-2 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-800">เลือกช่วงเวลา</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">เวลาเริ่มต้น</label>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
            {timeSlots.map((slot, index) => (
              <button
                key={index}
                onClick={() => onTimeSelect(slot.time, 'start')}
                disabled={!slot.available}
                className={`
                  p-2 text-sm rounded-lg border transition-all duration-200
                  ${selectedStartTime === slot.time 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : slot.available 
                      ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50' 
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">เวลาสิ้นสุด</label>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
            {timeSlots.map((slot, index) => (
              <button
                key={index}
                onClick={() => onTimeSelect(slot.time, 'end')}
                disabled={!slot.available || !selectedStartTime || slot.time <= selectedStartTime}
                className={`
                  p-2 text-sm rounded-lg border transition-all duration-200
                  ${selectedEndTime === slot.time 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : slot.available && selectedStartTime && slot.time > selectedStartTime
                      ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50' 
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedStartTime && selectedEndTime && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>ช่วงเวลาที่เลือก:</strong> {selectedStartTime} - {selectedEndTime}
          </p>
        </div>
      )}
    </div>
  );
}
