import React, { useState } from 'react';
import { User, Booking, Room, DepartmentCode } from '../types';
import { useBookings } from '../hooks/useBookings';
import { useRooms } from '../hooks/useRooms';
import { useDepartmentCodes } from '../hooks/useDepartmentCodes';
import { Calendar, Search, Filter, ChevronDown, Clock, User as UserIcon, Tag, Mail, Phone, X, CreditCard as Edit, Home, LogOut, Menu } from 'lucide-react';
import { formatDateThai } from '../utils/dateUtils';
import EditBookingModal from './EditBookingModal';
import CancelBookingModal from './CancelBookingModal';

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
  onBackToMain: () => void;
}

export default function UserDashboard({ user, onLogout, onBackToMain }: UserDashboardProps) {
  const { bookings, loading: bookingsLoading, cancelBooking, updateBooking } = useBookings();
  const { rooms, loading: roomsLoading } = useRooms();
  const { departmentCodes, loading: departmentCodesLoading } = useDepartmentCodes();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const loading = bookingsLoading || roomsLoading || departmentCodesLoading;

  // Get user's department code from user object or extract from email
  const userDepartmentCode = user.department_code || user.email?.split('@')[0]?.toUpperCase() || '';

  // Filter bookings to show only user's bookings based on department code
  const userBookings = bookings.filter(booking => 
    booking.department_code?.toLowerCase() === userDepartmentCode.toLowerCase()
  );

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : 'ไม่พบห้อง';
  };

  const getDepartmentName = (departmentCode: string) => {
    const department = departmentCodes.find(d => d.code === departmentCode);
    return department ? department.department_name : departmentCode;
  };

  const filteredBookings = userBookings.filter(booking => {
    const matchesSearch = searchTerm === '' ||
      booking.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getRoomName(booking.room_id).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleEditClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowEditModal(true);
  };

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (selectedBooking) {
      try {
        await cancelBooking(selectedBooking.id, selectedBooking.department_code);
        alert('ยกเลิกการจองสำเร็จ!');
        setShowCancelModal(false);
        setSelectedBooking(null);
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert(`เกิดข้อผิดพลาดในการยกเลิกการจอง: ${error instanceof Error ? error.message : 'ไม่สามารถยกเลิกการจองได้'}`);
      }
    }
  };

  const handleSaveEdit = async (updatedBooking: Booking) => {
    try {
      await updateBooking(updatedBooking.id, updatedBooking);
      alert('อัปเดตการจองสำเร็จ!');
      setShowEditModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert(`เกิดข้อผิดพลาดในการอัปเดตการจอง: ${error instanceof Error ? error.message : 'ไม่สามารถอัปเดตการจองได้'}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bg-white text-gray-900 h-screen transition-transform duration-300 ease-in-out z-50 border-r border-gray-200
          w-[290px]
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        <div className="py-4 px-6 flex items-center justify-between border-b border-gray-200 lg:justify-start">
          <div className="flex items-center">
            <UserIcon className="w-7 h-7 text-blue-500 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">การจองของฉัน</h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col overflow-y-auto duration-300 ease-in-out no-scrollbar p-6 h-[calc(100vh-70px)]">
          {/* User info */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <UserIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name || 'ผู้ใช้งาน'}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>แผนก:</strong> {getDepartmentName(userDepartmentCode)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                รหัส: {userDepartmentCode}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">สถิติการจอง</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-green-900">
                  {userBookings.filter(b => b.status === 'confirmed').length}
                </p>
                <p className="text-xs text-green-700">ยืนยันแล้ว</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-red-900">
                  {userBookings.filter(b => b.status === 'cancelled').length}
                </p>
                <p className="text-xs text-red-700">ยกเลิกแล้ว</p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-200">
            <button
              onClick={onBackToMain}
              className="flex items-center w-full px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors mb-2"
              title="กลับสู่หน้าหลัก"
            >
              <Home className="w-4 h-4 mr-3" />
              <span>หน้าหลัก</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center w-full px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4 mr-3" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 lg:ml-[290px]">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 mr-3"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="hidden lg:flex items-center">
                  <UserIcon className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">การจองของฉัน</h1>
                    <p className="text-sm text-gray-500">จัดการการจองห้องประชุมของคุณ</p>
                  </div>
                </div>
                <div className="lg:hidden flex items-center">
                  <UserIcon className="w-6 h-6 text-blue-500 mr-2" />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">การจองของฉัน</h1>
                    <p className="text-sm text-gray-500">จัดการการจอง</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <Calendar className="w-6 h-6 text-blue-500 mr-2" />
                <h2 className="text-xl font-bold text-gray-800">การจองของฉัน</h2>
              </div>
              <div className="text-sm text-gray-600">
                ทั้งหมด {filteredBookings.length} รายการ
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาการจอง..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <select
                  className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">สถานะทั้งหมด</option>
                  <option value="confirmed">ยืนยันแล้ว</option>
                  <option value="cancelled">ยกเลิกแล้ว</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">ไม่พบการจอง</h3>
                <p className="text-gray-600">คุณยังไม่มีการจองห้องประชุม</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">{booking.title}</h3>
                        <div className="flex items-center text-gray-600 mt-1">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span className="font-medium">{getRoomName(booking.room_id)}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDateThai(booking.date)}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {booking.status === 'confirmed' ? 'ยืนยันแล้ว' : 'ยกเลิกแล้ว'}
                      </span>
                    </div>

                    <details className="mt-3 pt-3 border-t border-gray-100">
                      <summary className="flex items-center justify-between text-sm font-medium text-gray-700 cursor-pointer">
                        <span>รายละเอียดเพิ่มเติม</span>
                        <ChevronDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="grid grid-cols-1 gap-4 mt-3">
                        <div className="space-y-2">
                          <div className="flex items-center text-gray-600 text-sm">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{booking.start_time} - {booking.end_time}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <UserIcon className="w-4 h-4 mr-2" />
                            <span>{booking.user_name}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Mail className="w-4 h-4 mr-2" />
                            <span>{booking.user_email}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{booking.user_phone}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Tag className="w-4 h-4 mr-2 text-purple-500" />
                            <span>{getDepartmentName(booking.department_code)}</span>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500">
                          <p>จองเมื่อ: {new Date(booking.created_at).toLocaleString('th-TH')}</p>
                        </div>
                      </div>

                      {booking.description && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-gray-600 text-sm">{booking.description}</p>
                        </div>
                      )}

                      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditClick(booking)}
                          className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center transition-colors"
                          title="แก้ไข"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {booking.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelClick(booking)}
                            className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                            title="ยกเลิก"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && selectedBooking && (
        <EditBookingModal
          isOpen={showEditModal}
          booking={selectedBooking}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
          rooms={rooms}
          departmentCodes={departmentCodes}
        />
      )}

      {showCancelModal && selectedBooking && (
        <CancelBookingModal
          booking={selectedBooking}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleConfirmCancel}
          roomName={getRoomName(selectedBooking.room_id)}
          submitting={false}
        />
      )}
    </div>
  );
}