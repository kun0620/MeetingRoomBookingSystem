import React, { useState, useMemo } from 'react';
import { useBookings } from '../../hooks/useBookings';
import { useRooms } from '../../hooks/useRooms';
import { useDepartmentCodes } from '../../hooks/useDepartmentCodes';
import { Search, Filter, Calendar, Download, FileText, Building, Users, Clock } from 'lucide-react';
import { formatDateThai } from '../../utils/dateUtils';

export default function AdminAdvancedSearch() {
  const { bookings } = useBookings();
  const { rooms } = useRooms();
  const { departmentCodes } = useDepartmentCodes();

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    roomId: '',
    departmentCode: '',
    status: '',
    searchTerm: ''
  });

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      // Date range filter
      if (filters.dateFrom && booking.date < filters.dateFrom) return false;
      if (filters.dateTo && booking.date > filters.dateTo) return false;
      
      // Room filter
      if (filters.roomId && booking.room_id !== filters.roomId) return false;
      
      // Department filter
      if (filters.departmentCode && booking.department_code !== filters.departmentCode) return false;
      
      // Status filter
      if (filters.status && booking.status !== filters.status) return false;
      
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesTitle = booking.title.toLowerCase().includes(searchLower);
        const matchesUserName = booking.user_name.toLowerCase().includes(searchLower);
        const matchesEmail = booking.user_email.toLowerCase().includes(searchLower);
        const roomName = getRoomName(booking.room_id).toLowerCase();
        const matchesRoom = roomName.includes(searchLower);
        
        if (!matchesTitle && !matchesUserName && !matchesEmail && !matchesRoom) return false;
      }
      
      return true;
    });
  }, [bookings, filters]);

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
      ['วันที่', 'ห้อง', 'หัวข้อ', 'แผนก', 'ผู้จอง', 'อีเมล', 'เบอร์โทร', 'เวลาเริ่ม', 'เวลาสิ้นสุด', 'สถานะ', 'รายละเอียด'],
      ...filteredBookings.map(booking => [
        formatDateThai(booking.date),
        getRoomName(booking.room_id),
        booking.title,
        getDepartmentName(booking.department_code),
        booking.user_name,
        booking.user_email,
        booking.user_phone,
        booking.start_time,
        booking.end_time,
        booking.status === 'confirmed' ? 'ยืนยันแล้ว' : booking.status === 'cancelled' ? 'ยกเลิกแล้ว' : booking.status,
        booking.description || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `advanced-search-results-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    // Create a simple HTML table for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>รายงานการค้นหาขั้นสูง</title>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Sarabun', Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .status-confirmed { color: #059669; }
          .status-cancelled { color: #dc2626; }
          .filters { background: #f9f9f9; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>รายงานการค้นหาขั้นสูง</h1>
        <div class="filters">
          <h3>เงื่อนไขการค้นหา:</h3>
          <p><strong>ช่วงวันที่:</strong> ${filters.dateFrom || 'ไม่ระบุ'} - ${filters.dateTo || 'ไม่ระบุ'}</p>
          <p><strong>ห้อง:</strong> ${filters.roomId ? getRoomName(filters.roomId) : 'ทั้งหมด'}</p>
          <p><strong>แผนก:</strong> ${filters.departmentCode ? getDepartmentName(filters.departmentCode) : 'ทั้งหมด'}</p>
          <p><strong>สถานะ:</strong> ${filters.status || 'ทั้งหมด'}</p>
          <p><strong>คำค้นหา:</strong> ${filters.searchTerm || 'ไม่มี'}</p>
          <p><strong>จำนวนผลลัพธ์:</strong> ${filteredBookings.length} รายการ</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>วันที่</th>
              <th>ห้อง</th>
              <th>หัวข้อ</th>
              <th>แผนก</th>
              <th>ผู้จอง</th>
              <th>เวลา</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            ${filteredBookings.map(booking => `
              <tr>
                <td>${formatDateThai(booking.date)}</td>
                <td>${getRoomName(booking.room_id)}</td>
                <td>${booking.title}</td>
                <td>${getDepartmentName(booking.department_code)}</td>
                <td>${booking.user_name}</td>
                <td>${booking.start_time} - ${booking.end_time}</td>
                <td class="status-${booking.status}">
                  ${booking.status === 'confirmed' ? 'ยืนยันแล้ว' : booking.status === 'cancelled' ? 'ยกเลิกแล้ว' : booking.status}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            }
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      roomId: '',
      departmentCode: '',
      status: '',
      searchTerm: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Search className="w-6 h-6 text-blue-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-800">ค้นหาและกรองข้อมูลขั้นสูง</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Search Term */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ค้นหาทั่วไป
            </label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              placeholder="ค้นหาหัวข้อ, ผู้จอง, อีเมล, ห้อง..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วันที่เริ่มต้น
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              วันที่สิ้นสุด
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Room Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ห้องประชุม
            </label>
            <select
              value={filters.roomId}
              onChange={(e) => setFilters(prev => ({ ...prev, roomId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">ทุกห้อง</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              แผนก
            </label>
            <select
              value={filters.departmentCode}
              onChange={(e) => setFilters(prev => ({ ...prev, departmentCode: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">ทุกแผนก</option>
              {departmentCodes.map(dept => (
                <option key={dept.id} value={dept.code}>{dept.department_name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              สถานะ
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">ทุกสถานะ</option>
              <option value="confirmed">ยืนยันแล้ว</option>
              <option value="cancelled">ยกเลิกแล้ว</option>
              <option value="pending">รอดำเนินการ</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={clearFilters}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            ล้างตัวกรอง
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            Print PDF
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            ผลการค้นหา ({filteredBookings.length} รายการ)
          </h3>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">ไม่พบผลการค้นหา</h3>
            <p className="text-gray-600">ลองปรับเงื่อนไขการค้นหาใหม่</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ห้อง
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    หัวข้อ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    แผนก
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ผู้จอง
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    เวลา
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{formatDateThai(booking.date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{getRoomName(booking.room_id)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{booking.title}</div>
                      {booking.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{booking.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-purple-500 mr-2" />
                        <span className="text-sm text-gray-900">{getDepartmentName(booking.department_code)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.user_name}</div>
                      <div className="text-sm text-gray-500">{booking.user_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-900">{booking.start_time} - {booking.end_time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status === 'confirmed' ? 'ยืนยันแล้ว' : 
                         booking.status === 'cancelled' ? 'ยกเลิกแล้ว' : 
                         'รอดำเนินการ'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
