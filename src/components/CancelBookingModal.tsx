import React from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { Booking } from '../types'; // Import Booking type

interface CancelBookingModalProps {
  booking: Booking;
  roomName: string;
  onConfirm: () => void;
  onClose: () => void;
  submitting: boolean;
}

export default function CancelBookingModal({
  booking,
  roomName,
  onConfirm,
  onClose,
  submitting,
}: CancelBookingModalProps) {

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="ปิด"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">ยืนยันการยกเลิกการจอง</h3>
          <p className="text-gray-600">คุณต้องการยกเลิกการจองห้อง "<span className="font-semibold">{roomName}</span>" โดย "<span className="font-semibold">{booking.contact_person_name}</span>" ใช่หรือไม่?</p>
          <p className="text-sm text-gray-500 mt-1">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={submitting}
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <X className="w-5 h-5 mr-2" />
            )}
            ยืนยันการยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}
