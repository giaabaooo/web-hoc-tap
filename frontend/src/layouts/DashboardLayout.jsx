import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Settings, LayoutDashboard, Star } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const DashboardLayout = ({ children }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  const menu = [
    { name: 'Tổng quan', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Khóa học của tôi', path: '/dashboard/my-courses', icon: <BookOpen size={20} /> },
    { name: 'Gói đăng ký', path: '/dashboard/subscription', icon: <Star size={20} /> },
    { name: 'Cài đặt', path: '/dashboard/settings', icon: <Settings size={20} /> },
  ];

  // Ghi đè màu nền body theo token mới của Dashboard (#eaf3ff)
  return (
    <div className="min-h-screen bg-[#eaf3ff] flex font-primary">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-muted border-r border-border-default flex flex-col shadow-4">
        <div className="p-6">
          <Link to="/" className="text-2xl font-bold text-text-primary">Hoc10K<span className="text-surface-raised text-sm ml-2">App</span></Link>
        </div>
        
        <div className="px-4 pb-6 flex flex-col items-center border-b border-border-default">
          <img src={user?.avatar || "https://via.placeholder.com/150"} alt="Avatar" className="w-20 h-20 rounded-full mb-3 shadow-3" />
          <h3 className="font-bold text-text-primary text-lg">{user?.displayName || "Học viên"}</h3>
          {/* Badge Subscription: FREE, PRO, PREMIUM */}
          <span className={`mt-1 px-3 py-1 rounded-full text-xs font-bold ${
            user?.subscription === 'PRO' ? 'bg-blue-100 text-blue-700' :
            user?.subscription === 'PREMIUM' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            Gói {user?.subscription || 'FREE'}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-[16px] text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-surface-raised ${
                  isActive ? 'bg-surface-raised text-surface-muted shadow-2' : 'text-text-secondary hover:bg-[#eaf3ff] hover:text-text-primary'
                }`}
              >
                {item.icon} {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};