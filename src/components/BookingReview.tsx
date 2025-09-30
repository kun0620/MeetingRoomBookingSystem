import React from 'react';
import { Room } from '../types';
import { Calendar, Clock, Info } from 'lucide-react';
import { formatDateThai } from '../utils/dateUtils';

interface BookingReviewProps {
  room: Room;
  selectedDate: string;
  selectedStartTime: string;
  selectedEndTime: string;
  onConfirm: () => void;
  onEdit: () => void;
}

export default function BookingReview({
  room,
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  onConfirm,
  onEdit,
}: BookingReviewProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">ตรวจสอบการจอง</h2>
      <p className="text-gray-600 mb-6">โปรดตรวจสอบรายละเอียดการจองของคุณก่อนดำเนินการต่อ</p>

      <div className="bg-blue-50 rounded-lg p-4 space-y-3 mb-8">
        <div className="flex items-center text-blue-800">
          <Info className="w-5 h-5 mr-2" />
          <span className="font-medium">ห้อง:</span>
          <span className="ml-2 font-semibold">{room.name}</span>
        </div>
        <div className="flex items-center text-blue-800">
          <Calendar className="w-5 h-5 mr-2" />
          <span className="font-medium">วันที่:</span>
          <span className="ml-2 font-semibold">{formatDateThai(selectedDate)}</span>
        </div>
        <div className="flex items-center text-blue-800">
          <Clock className="w-5 h-5 mr-2" />
          <span className="font-medium">เวลา:</span>
          <span className="ml-2 font-semibold">{selectedStartTime} - {selectedEndTime}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          แก้ไขเวลา
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          ดำเนินการต่อ
        </button>
      </div>
    </div>
  );
}
