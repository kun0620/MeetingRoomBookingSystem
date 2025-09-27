import React, { useState, ReactNode } from 'react';
import { CalendarDays, Building, LineChart, MessageSquare, Settings, LogOut, Home, Menu, X, Users } from 'lucide-react';
import { User } from '../types';

interface MainLayoutProps {
  children: ReactNode;
  viewMode: 'booking' | 'management' | 'admin';
  setViewMode: (mode: 'booking' | 'management' | 'admin') => void;
  user: User | null;
  isAdmin: boolean;
  onLogout: () => void;
  onAdminLoginClick: () => void;
}

export default function MainLayout({
  children,
  viewMode,
  setViewMode,
  user,
  isAdmin,
  onLogout,
  onAdminLoginClick,
}: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'booking', label: 'จองห้อง', icon: CalendarDays },
    { id: 'management', label: 'จัดการการจอง', icon: LineChart },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
            <Building className="w-7 h-7 text-blue-500 mr-2" />
            <h1 className="text-xl font-bold text-gray-900">ระบบจองห้องประชุม</h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col overflow-y-auto duration-300 ease-in-out no-scrollbar p-6 h-[calc(100vh-70px)]"> {/* Adjusted height */}
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
                            setViewMode(item.id as 'booking' | 'management');
                            setIsSidebarOpen(false);
                          }}
                          className={`flex items-center w-full px-4 py-2 rounded-lg font-medium transition-colors group
                            ${
                              viewMode === item.id
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          <Icon className={`w-4 h-4 mr-3 ${viewMode === item.id ? 'text-white' : 'text-gray-500 group-hover:text-blue-500'}`} />
                          <span className={`${viewMode === item.id ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'}`}>{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-200">
            {user ? (
              <>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name || 'ผู้ใช้งาน'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center w-full px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  <span>ออกจากระบบ</span>
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-500 mb-4">ยังไม่ได้เข้าสู่ระบบ</p>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  setViewMode('admin');
                  setIsSidebarOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors mt-4"
                title="เข้าสู่ระบบแอดมิน"
              >
                <Settings className="w-4 h-4 mr-3" />
                <span>แอดมิน</span>
              </button>
            )}
            {!user && !isAdmin && (
              <button
                onClick={() => {
                  onAdminLoginClick();
                  setIsSidebarOpen(false);
                }}
                className="flex items-center w-full px-4 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors mt-4"
                title="เข้าสู่ระบบแอดมิน"
              >
                <Settings className="w-4 h-4 mr-3" />
                <span>เข้าสู่ระบบแอดมิน</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 lg:ml-[290px] flex flex-col">
        {/* Header for main content */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              {/* Left section: App title and mobile menu button */}
              <div className="flex items-center">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 mr-3"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="hidden lg:flex items-center"> {/* Hide on mobile, show on lg+ */}
                  <Building className="w-8 h-8 text-blue-500 mr-3" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">ระบบจองห้องประชุม</h1>
                    <p className="text-sm text-gray-500">Meeting Room Booking System</p>
                  </div>
                </div>
                <div className="lg:hidden"> {/* Show on mobile, hide on lg+ */}
                  <h1 className="text-xl font-bold text-gray-900">ระบบจองห้องประชุม</h1>
                  <p className="text-sm text-gray-500">Meeting Room Booking System</p>
                </div>
              </div>
              {/* Right section: LINE Official status */}
              <div className="flex items-center px-4 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200">
                <MessageSquare className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">LINE Official พร้อม</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pb-20"> {/* Added pb-20 here */}
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-500">
              <p className="mb-2">ระบบจองห้องประชุมออนไลน์</p>
              <p className="text-sm">ระบบออนไลน์พร้อมใช้งาน - ข้อมูลจะถูกเก็บไว้อย่างปลอดภัย</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
