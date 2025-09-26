import React from 'react';
import { useRooms } from '../../hooks/useRooms';
import { useBookings } from '../../hooks/useBookings';
import { useUsers } from '../../hooks/useUsers';
import { Building, Calendar, Users, TrendingUp, Loader2 } from 'lucide-react';

export default function AdminStats() {
  const { rooms, loading: roomsLoading } = useRooms();
  const { bookings, loading: bookingsLoading } = useBookings();
  const { users, loading: usersLoading } = useUsers();

  const loading = roomsLoading || bookingsLoading || usersLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const todayBookings = confirmedBookings.filter(b => b.date === new Date().toISOString().split('T')[0]);
  const activeUsers = users.filter(u => u.is_active);

  const stats = [
    {
      title: 'ห้องประชุมทั้งหมด',
      value: rooms.length,
      icon: Building,
      color: 'bg-blue-500',
      change: '+0%'
    },
    {
      title: 'การจองทั้งหมด',
      value: confirmedBookings.length,
      icon: Calendar,
      color: 'bg-green-500',
      change: '+12%'
    },
    {
      title: 'การจองวันนี้',
      value: todayBookings.length,
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+5%'
    },
    {
      title: 'สมาชิกทั้งหมด',
      value: activeUsers.length,
      icon: Users,
      color: 'bg-purple-500',
      change: '+8%'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">ภาพรวมระบบ</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                  <span className="text-gray-600 text-sm ml-2">จากเดือนที่แล้ว</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">การจองล่าสุด</h3>
        <div className="space-y-3">
          {confirmedBookings.slice(0, 5).map((booking) => {
            const room = rooms.find(r => r.id === booking.room_id);
            return (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{booking.title}</p>
                  <p className="text-sm text-gray-600">
                    {room?.name} • {booking.date} • {booking.start_time}-{booking.end_time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{booking.user_name}</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ยืนยันแล้ว
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}