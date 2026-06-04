// src/layouts/TeacherLayout.jsx
import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { BookOpen, Users, BarChart2, Settings, LogOut } from 'lucide-react';

export const TeacherLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menu = [
    { name: 'Quản lý khóa học', path: '/teacher-dashboard', icon: <BookOpen size={18} /> },
    { name: 'Học viên của tôi', path: '/teacher-dashboard/students', icon: <Users size={18} /> },
    { name: 'Thống kê doanh thu', path: '/teacher-dashboard/stats', icon: <BarChart2 size={18} /> },
    { name: 'Cài đặt hồ sơ', path: '/teacher-dashboard/settings', icon: <Settings size={18} /> },
  ];

  return (
    // Đã thay đổi: Dùng h-screen (bằng đúng chiều cao màn hình) và overflow-hidden
    <div className="h-screen w-full flex overflow-hidden bg-surface-strong text-text-primary font-primary">
      
      {/* Sidebar Giáo Viên - Bọc flex-shrink-0 để không bị ép nhỏ lại */}
      <aside className="w-64 h-full flex-shrink-0 bg-surface-muted border-r border-border-default flex flex-col relative z-10 shadow-sm">
        <div className="p-6 border-b border-border-default">
          <Link to="/" className="text-xl font-bold text-surface-raised flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-surface-raised rounded">
            Tự Học Vui <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">Teacher</span>
          </Link>
        </div>
        
        {/* Nơi chứa menu, flex-1 giúp đẩy khu vực logout xuống tận cùng */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menu.map((item) => {
            const isActive = location.pathname === item.path; 
            return (
              <Link
                key={item.name} to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-surface-raised ${
                  isActive ? 'bg-surface-raised text-surface-muted shadow-1' : 'text-text-tertiary hover:bg-surface-strong hover:text-text-primary'
                }`}
              >
                {item.icon} {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Khu vực Logout được đẩy xuống cố định */}
        <div className="p-4 border-t border-border-default mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={user?.avatar || "https://via.placeholder.com/40"} alt="Avatar" className="w-10 h-10 rounded-full border border-border-default" />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.displayName}</p>
              <p className="text-xs text-text-tertiary truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content - Nơi chứa Outlet. Để thẻ main cuộn (overflow-y-auto) thay vì cả trang cuộn */}
      <main className="flex-1 h-full p-8 overflow-y-auto custom-scrollbar relative">
        <Outlet /> 
      </main>
    </div>
  );
};