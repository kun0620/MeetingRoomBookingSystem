import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Booking, Room, DepartmentCode } from '../types'; // Import DepartmentCode
import { formatDateThai } from '../utils/dateUtils'; // Keep if needed elsewhere, but not directly used for date input formatting here

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  rooms: Room[];
  departmentCodes: DepartmentCode[]; // Add departmentCodes prop
  onSave: (updatedBooking: Booking) => void; // Renamed from onUpdate to onSave for consistency
}

export default function EditBookingModal({ isOpen, onClose, booking, rooms, departmentCodes, onSave }: EditBookingModalProps) {
  const [title, setTitle] = useState('');
  const [roomId, setRoomId] = useState('');
  const [date, setDate] = useState(''); // YYYY-MM-DD
  const [startTime, setStartTime] = useState(''); // HH:MM
  const [endTime, setEndTime] = useState(''); // HH:MM
  const [description, setDescription] = useState('');
  const [departmentCodeId, setDepartmentCodeId] = useState(''); // New state for department code

  useEffect(() => {
    if (booking) {
      setTitle(booking.title);
      setRoomId(booking.room_id);
      setDescription(booking.description || '');
      setDepartmentCodeId(booking.department_code_id);

      // Extract date and time from ISO strings
      const start = new Date(booking.start_time);
      const end = new Date(booking.end_time);

      setDate(start.toISOString().substring(0, 10)); // YYYY-MM-DD
      setStartTime(start.toISOString().substring(11, 16)); // HH:MM
      setEndTime(end.toISOString().substring(11, 16)); // HH:MM
    }
  }, [booking]);

  const handleSubmit = () => {
    if (!booking) return;

    // Combine date and time inputs into ISO strings
    const updatedStartTime = new Date(`${date}T${startTime}:00`).toISOString();
    const updatedEndTime = new Date(`${date}T${endTime}:00`).toISOString();

    const updatedBooking: Booking = {
      ...booking,
      title,
      room_id: roomId,
      start_time: updatedStartTime,
      end_time: updatedEndTime,
      description: description,
      department_code_id: departmentCodeId, // Include updated department code
    };

    onSave(updatedBooking);
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md">
          <Dialog.Title className="text-lg font-semibold text-gray-900">
            แก้ไขรายละเอียดการจอง
          </Dialog.Title>

          <div className="mt-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              หัวข้อการจอง
            </label>
            <input
              type="text"
              id="title"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
              ห้องประชุม
            </label>
            <select
              id="roomId"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label htmlFor="departmentCodeId" className="block text-sm font-medium text-gray-700">
              แผนก
            </label>
            <select
              id="departmentCodeId"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={departmentCodeId}
              onChange={(e) => setDepartmentCodeId(e.target.value)}
            >
              {departmentCodes.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              วันที่
            </label>
            <input
              type="date"
              id="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                เวลาเริ่มต้น
              </label>
              <input
                type="time"
                id="startTime"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                เวลาสิ้นสุด
              </label>
              <input
                type="time"
                id="endTime"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              รายละเอียดเพิ่มเติม
            </label>
            <textarea
              id="description"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={onClose}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              className="ml-3 rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={handleSubmit}
            >
              บันทึก
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
