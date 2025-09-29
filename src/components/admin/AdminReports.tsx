import React, { useState, useMemo } from 'react';
import { useBookings } from '../../hooks/useBookings';
import { useRooms } from '../../hooks/useRooms';
import { useDepartmentCodes } from '../../hooks/useDepartmentCodes';
import { BarChart3, PieChart, TrendingUp, Calendar, Building, Users, Download, FileText } from 'lucide-react';
import { BookingStats } from '../../types';

export default function AdminReports() {
  const { bookings } = useBookings();
  const { rooms } = useRooms();
  const { departmentCodes } = useDepartmentCodes();
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');

  const stats: BookingStats = useMemo(() => {
    const now = new Date();
    let filteredBookings = bookings;

    // Filter by selected period
    switch (selectedPeriod) {
      case 'thisWeek':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        filteredBookings = bookings.filter(b => new Date(b.date) >= weekStart);
        break;
      case 'thisMonth':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        filteredBookings = bookings.filter(b => new Date(b.date) >= monthStart);
        break;
      case 'thisYear':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        filteredBookings = bookings.filter(b => new Date(b.date) >= yearStart);
        break;
    }

    const totalBookings = filteredBookings.length;
    const confirmedBookings = filteredBookings.filter(b => b.status === 'confirmed').length;
    const cancelledBookings = filteredBookings.filter(b => b.status === 'cancelled').length;

    // Room usage statistics
    const roomUsage: { [roomId: string]: number } = {};
    filteredBookings.forEach(booking => {
      roomUsage[booking.room_id] = (roomUsage[booking.room_id] || 0) + 1;
    });

    // Department usage statistics
    const departmentUsage: { [departmentCode: string]: number } = {};
    filteredBookings.forEach(booking => {
      departmentUsage[booking.department_code] = (departmentUsage[booking.department_code] || 0) + 1;
    });

    // Monthly bookings for trend analysis
    const monthlyBookings: { [month: string]: number } = {};
    filteredBookings.forEach(booking => {
      const month = new Date(booking.date).toISOString().substring(0, 7); // YYYY-MM
      monthlyBookings[month] = (monthlyBookings[month] || 0) + 1;
    });

    return {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      roomUsage,
      departmentUsage,
      monthlyBookings
    };
  }, [bookings, selectedPeriod]);

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : roomId;
  };

  const getDepartmentName = (code: string) => {
    const dept = departmentCodes.find(d => d.code === code);
    return dept ? dept.department_name : code;
  };

  const exportToCSV = () => {
    const csvContent = [
      ['วันที่', 'ห้อง', 'หัวข้อ', 'แผนก', 'ผู้จอง', 'เวลาเริ่ม', 'เวลาสิ้นสุด', 'สถานะ'],
      ...bookings.map(booking => [
        booking.date,
        getRoomName(booking.room_id),
        booking.title,
        getDepartmentName(booking.department_code),
        booking.user_name,
        booking.start_time,
        booking.end_time,
        booking.status === 'confirmed' ? 'ยืนยันแล้ว' : booking.status === 'cancelled' ? 'ยกเลิกแล้ว' : booking.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `booking-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const topRooms = Object.entries(stats.roomUsage)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const topDepartments = Object.entries(stats.departmentUsage)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <BarChart3 className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">รายงานและสถิติ</h2>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="thisWeek">สัปดาห์นี้</option>
              <option value="thisMonth">เดือนนี้</option>
              <option value="thisYear">ปีนี้</option>
              <option value="all">ทั้งหมด</option>
            </select>
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-blue-900">{stats.totalBookings}</p>
                <p className="text-blue-700 text-sm">การจองทั้งหมด</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-green-900">{stats.confirmedBookings}</p>
                <p className="text-green-700 text-sm">ยืนยันแล้ว</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-red-900">{stats.cancelledBookings}</p>
                <p className="text-red-700 text-sm">ยกเลิกแล้ว</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <PieChart className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-purple-900">
                  {stats.totalBookings > 0 ? Math.round((stats.confirmedBookings / stats.totalBookings) * 100) : 0}%
                </p>
                <p className="text-purple-700 text-sm">อัตราสำเร็จ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Rooms */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Building className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">ห้องที่ใช้งานมากที่สุด</h3>
          </div>
          <div className="space-y-3">
            {topRooms.map(([roomId, count], index) => (
              <div key={roomId} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{getRoomName(roomId)}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(count / Math.max(...Object.values(stats.roomUsage))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{count} ครั้ง</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Departments */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Users className="w-5 h-5 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">แผนกที่จองมากที่สุด</h3>
          </div>
          <div className="space-y-3">
            {topDepartments.map(([deptCode, count], index) => (
              <div key={deptCode} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{getDepartmentName(deptCode)}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(count / Math.max(...Object.values(stats.departmentUsage))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{count} ครั้ง</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-5 h-5 text-purple-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">แนวโน้มการจองรายเดือน</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(stats.monthlyBookings)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-6)
            .map(([month, count]) => (
              <div key={month} className="text-center">
                <div className="bg-purple-100 rounded-lg p-4 mb-2">
                  <p className="text-2xl font-bold text-purple-900">{count}</p>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(month + '-01').toLocaleDateString('th-TH', { 
                    year: 'numeric', 
                    month: 'short' 
                  })}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">รายละเอียดการใช้งานห้อง</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ห้องประชุม
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จำนวนการจอง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  อัตราการใช้งาน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ความจุ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rooms.map((room) => {
                const bookingCount = stats.roomUsage[room.id] || 0;
                const usageRate = stats.totalBookings > 0 ? (bookingCount / stats.totalBookings) * 100 : 0;
                
                return (
                  <tr key={room.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{room.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{bookingCount} ครั้ง</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${usageRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{usageRate.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{room.capacity} คน</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
