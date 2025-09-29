import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { Booking, Room, DepartmentCode } from '../types';

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  rooms: Room[];
  departmentCodes: DepartmentCode[];
  onSave: (updatedBooking: Booking) => void;
}

export default function EditBookingModal({ isOpen, onClose, booking, rooms, departmentCodes, onSave }: EditBookingModalProps) {
  const [title, setTitle] = useState('');
  const [userPhone, setUserPhone] = useState(''); // เพิ่ม state สำหรับเบอร์โทร
  const [userEmail, setUserEmail] = useState(''); // เพิ่ม state สำหรับอีเมล
  const [description, setDescription] = useState('');

  // ฟิลด์เหล่านี้จะถูกปิดใช้งาน ไม่ให้แก้ไข
  const [roomId, setRoomId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');

  useEffect(() => {
    if (!booking) {
      // Reset states if booking is null to prevent displaying stale data
      setTitle('');
      setUserPhone('');
      setUserEmail('');
      setDescription('');
      setRoomId('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setDepartmentCode('');
      return;
    }

    setTitle(booking.title);
    setUserPhone(booking.user_phone || ''); // ดึงค่า user_phone
    setUserEmail(booking.user_email || ''); // ดึงค่า user_email
    setDescription(booking.description || '');

    // ตั้งค่าฟิลด์ที่ถูกปิดใช้งาน (disabled)
    setRoomId(booking.room_id);
    setDepartmentCode(booking.department_code);

    const fullStartTimeString = `${booking.date}T${booking.start_time}`;
    const fullEndTimeString = `${booking.date}T${booking.end_time}`;

    const start = new Date(fullStartTimeString);
    const end = new Date(fullEndTimeString);

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      setDate(booking.date);
      setStartTime(booking.start_time.substring(0, 5));
      setEndTime(booking.end_time.substring(0, 5));
    } else {
      console.error('Invalid date value received for booking:', booking, 'Full start time string:', fullStartTimeString, 'Full end time string:', fullEndTimeString);
      setDate('');
      setStartTime('');
      setEndTime('');
    }
  }, [booking]);

  const handleSubmit = () => {
    if (!booking) return;

    const updatedBooking: Booking = {
      ...booking,
      title,
      user_phone: userPhone, // อัปเดต user_phone
      user_email: userEmail, // อัปเดต user_email
      description: description,
      // ฟิลด์อื่นๆ ที่ถูกปิดใช้งาน จะใช้ค่าเดิมจาก booking
      room_id: roomId,
      date: date,
      start_time: startTime + ':00',
      end_time: endTime + ':00',
      department_code: departmentCode,
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

          {/* ฟิลด์ ห้องประชุม - ปิดใช้งาน */}
          <div className="mt-4">
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
              ห้องประชุม
            </label>
            <select
              id="roomId"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-100 cursor-not-allowed"
              value={roomId}
              disabled // ปิดใช้งาน
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>

          {/* ฟิลด์ แผนก - ปิดใช้งาน */}
          <div className="mt-4">
            <label htmlFor="departmentCode" className="block text-sm font-medium text-gray-700">
              แผนก
            </label>
            <select
              id="departmentCode"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-100 cursor-not-allowed"
              value={departmentCode}
              disabled // ปิดใช้งาน
            >
              {departmentCodes.map((dept) => (
                <option key={dept.id} value={dept.code}>{dept.department_name}</option>
              ))}
            </select>
          </div>

          {/* ฟิลด์ วันที่ - ปิดใช้งาน */}
          <div className="mt-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              วันที่
            </label>
            <input
              type="date"
              id="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-100 cursor-not-allowed"
              value={date}
              disabled // ปิดใช้งาน
            />
          </div>

          {/* ฟิลด์ เวลาเริ่มต้น/สิ้นสุด - ปิดใช้งาน */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                เวลาเริ่มต้น
              </label>
              <input
                type="time"
                id="startTime"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-100 cursor-not-allowed"
                value={startTime}
                disabled // ปิดใช้งาน
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                เวลาสิ้นสุด
              </label>
              <input
                type="time"
                id="endTime"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-gray-100 cursor-not-allowed"
                value={endTime}
                disabled // ปิดใช้งาน
            />
            </div>
          </div>

          {/* ฟิลด์ เบอร์โทร - เปิดให้แก้ไข */}
          <div className="mt-4">
            <label htmlFor="userPhone" className="block text-sm font-medium text-gray-700">
              เบอร์โทร
            </label>
            <input
              type="text"
              id="userPhone"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
            />
          </div>

          {/* ฟิลด์ อีเมล - เปิดให้แก้ไข */}
          <div className="mt-4">
            <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700">
              อีเมล
            </label>
            <input
              type="email"
              id="userEmail"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </div>

          {/* ฟิลด์ รายละเอียดเพิ่มเติม - เปิดให้แก้ไข */}
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
