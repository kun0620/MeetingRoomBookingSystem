import React, { useState } from 'react';
import { 
  Users, 
  Building, 
  Calendar, 
  Settings, 
  BarChart3, 
  LogOut,
  Home
} from 'lucide-react';
import { User } from '../../types';
import AdminRooms from './AdminRooms';
import AdminBookings from './AdminBookings';
import AdminUsers from './AdminUsers';
import AdminStats from './AdminStats';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  onBackToMain: () => void;
}

type AdminView = 'stats' | 'rooms' | 'bookings' | 'users' | 'settings';

export default function AdminDashboard({ user, onLogout, onBackToMain }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<AdminView>('stats');

  const menuItems = [
    { id: 'stats' as AdminView, label: 'สถิติ', icon: BarChart3 },
    { id: 'rooms' as AdminView, label: 'จัดการห้อง', icon: Building },
    { id: 'bookings' as AdminView, label: 'จัดการการจอง', icon: Calendar },
    { id: 'users' as AdminView, label: 'จัดการสมาชิก', icon: Users },
    { id: 'settings' as AdminView, label: 'ตั้งค่า', icon: Settings },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'stats':
        return <AdminStats />;
      case 'rooms':
        return <AdminRooms />;
      case 'bookings':
        return <AdminBookings />;
      case 'users':
        return <AdminUsers />;
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">ตั้งค่าระบบ</h2>
            <p className="text-gray-600">ฟีเจอร์นี้จะพัฒนาในเวอร์ชันถัดไป</p>
          </div>
        );
      default:
        return <AdminStats />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">แอดมิน</h1>
                <p className="text-sm text-gray-500">ระบบจัดการ</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              
              <button
                onClick={onBackToMain}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="กลับสู่หน้าหลัก"
              >
                <Home className="w-4 h-4" />
              </button>
              
              <button
                onClick={onLogout}
                className="flex items-center px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="ออกจากระบบ"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-lg p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setCurrentView(item.id)}
                        className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                          currentView === item.id
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}