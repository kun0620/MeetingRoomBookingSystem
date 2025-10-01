import React, { useState } from 'react';
import {
  Users,
  Building,
  Calendar,
  Settings,
  BarChart3,
  LogOut,
  Home,
  Menu, // Import Menu icon for mobile toggle
  X, // Import X icon for closing sidebar on mobile
  Search // Import Search icon
} from 'lucide-react';
import { User } from '../../types';
import AdminRooms from './AdminRooms';
import AdminBookings from './AdminBookings';
import AdminUsers from './AdminUsers';
import AdminStats from './AdminStats';
import AdminDepartments from './AdminDepartments';
import AdminReports from './AdminReports';
import AdminAdvancedSearch from './AdminAdvancedSearch';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  onBackToMain: () => void;
}

type AdminView = 'stats' | 'rooms' | 'bookings' | 'users' | 'departments' | 'reports' | 'search' | 'settings';

export default function AdminDashboard({ user, onLogout, onBackToMain }: AdminDashboardProps) {
  const [currentView, setCurrentView] = useState<AdminView>('stats');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar visibility

  const menuItems = [
    { id: 'stats' as AdminView, label: 'สถิติ', icon: BarChart3 },
    { id: 'rooms' as AdminView, label: 'จัดการห้อง', icon: Building },
    { id: 'bookings' as AdminView, label: 'จัดการการจอง', icon: Calendar },
    { id: 'users' as AdminView, label: 'จัดการสมาชิก', icon: Users },
    { id: 'departments' as AdminView, label: 'จัดการแผนก', icon: Building },
    { id: 'reports' as AdminView, label: 'รายงานและสถิติ', icon: BarChart3 },
    { id: 'search' as AdminView, label: 'ค้นหาขั้นสูง', icon: Search },
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
      case 'departments':
        return <AdminDepartments />;
      case 'reports':
        return <AdminReports />;
      case 'search':
        return <AdminAdvancedSearch />;
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sidebar Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Global Fixed Header for Admin Dashboard */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-sm border-b z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left section: Admin title and mobile menu button */}
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 mr-3"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center"> {/* Always show app title in header */}
                <Settings className="w-8 h-8 text-gray-700 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">แอดมิน</h1>
                  <p className="text-sm text-gray-500">ระบบจัดการ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bg-white text-gray-900 transition-transform duration-300 ease-in-out z-50 border-r border-gray-200
          w-[290px] h-screen lg:top-16 lg:h-[calc(100vh-4rem)]
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        {/* Sidebar Header (only visible on mobile) */}
        <div className="py-4 px-6 flex items-center justify-between border-b border-gray-200 lg:hidden">
          <div className="flex items-center">
            <Settings className="w-7 h-7 text-gray-700 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">แอดมิน</h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col overflow-y-auto duration-300 ease-in-out no-scrollbar p-6 h-[calc(100%-70px)] lg:h-full">
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="mb-4 text-xs uppercase flex leading-[20px] text-gray-400 justify-start">เมนู</h2>
                <ul className="flex flex-col gap-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => {
                            setCurrentView(item.id);
                            setIsSidebarOpen(false); // Close sidebar on item click for mobile
                          }}
                          className={`flex items-center w-full px-4 py-2 rounded-lg font-medium transition-colors group
                            ${
                              currentView === item.id
                                ? 'bg-gray-200 text-gray-900'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          <Icon className={`w-4 h-4 mr-3 ${currentView === item.id ? 'text-gray-700' : 'text-gray-500 group-hover:text-gray-700'}`} />
                          <span className={`${currentView === item.id ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'}`}>{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </nav>

          {/* User info, Home, Logout buttons moved to sidebar for consistency */}
          <div className="mt-auto pt-6 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <Users className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name || 'ผู้ดูแลระบบ'}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>

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
      <div className="flex-1 lg:ml-[290px] pt-16"> {/* Added pt-16 to push content right on large screens */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
