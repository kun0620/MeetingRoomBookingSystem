import React, { useState, useEffect } from 'react';
import Calendar from '../../components/Calendar';
import { useBookings } from '../../hooks/useBookings';
import { useRooms } from '../../hooks/useRooms';
import { formatDateThai } from '../../utils/dateUtils';
import { Loader2, AlertCircle, Calendar as CalendarIcon, Search, Filter, ChevronDown } from 'lucide-react';

export default function BookingStatusPage() {
  const [selectedDate, setSelectedDate] = useState(formatDateThai(new Date()));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { rooms } = useRooms();
  const { bookings: allBookings, loading: bookingsLoading, error: bookingsError } = useBookings();

  useEffect(() => {
    if (allBookings) {
      setBookings(allBookings);
    }
  }, [allBookings]);

  useEffect(() => {
    setLoading(bookingsLoading);
    setError(bookingsError);
  }, [bookingsLoading, bookingsError]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const getRoomById = (roomId: string) => rooms.find(room => room.id === roomId);

  const getDepartmentNameByCode = (departmentCode: string) => {
    // Replace this with your actual logic to fetch department names
    return departmentCode || 'N/A';
  };

  const filteredBookings = allBookings
    ? allBookings.filter(booking => {
        const dateMatch = booking.date === selectedDate;
        const searchTermMatch = booking.title.toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = statusFilter === 'all' || booking.status === statusFilter;
        return dateMatch && searchTermMatch && statusMatch;
      })
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
          สถานะการจองห้องประชุม
        </h1>
        <p className="text-lg text-gray-600">
          ตรวจสอบสถานะการจองห้องประชุมของคุณ
        </p>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="mb-6">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              bookings={allBookings}
            />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <CalendarIcon className="w-6 h-6 text-blue-500 mr-2" />
                <h2 className="text-xl font-bold text-gray-800">จัดการการจอง</h2>
              </div>
              <div className="text-sm text-gray-600">
                ทั้งหมด {filteredBookings.length} รายการ
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="ค้นหาการจอง..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">ทุกสถานะ</option>
                  <option value="confirmed">ยืนยันแล้ว</option>
                  <option value="cancelled">ยกเลิกแล้ว</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Bookings List */}
            {loading && (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <p className="ml-3 text-gray-600">กำลังโหลดข้อมูล...</p>
              </div>
            )}
            {error && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
                <p className="text-red-600">{error}</p>
              </div>
            )}
            {!loading && !error && (
              <div>
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">ไม่พบการจอง</h3>
                    <p className="text-gray-600">ไม่มีการจองที่ตรงกับเงื่อนไขการค้นหา</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ห้องประชุม
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            วันที่
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            เวลา
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            หัวข้อ
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            แผนก
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredBookings.map((booking) => {
                          const room = getRoomById(booking.room_id);
                          const departmentName = getDepartmentNameByCode(booking.department_code);

                          return (
                            <tr key={booking.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{room?.name || 'ไม่ระบุ'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatDateThai(booking.date)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{booking.start_time} - {booking.end_time}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{booking.title}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{departmentName}</div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
