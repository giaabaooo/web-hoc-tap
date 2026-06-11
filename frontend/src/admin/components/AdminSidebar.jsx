import React from 'react';
import { 
  Users, LayoutDashboard, BookOpen, MessageSquare, BarChart3, LogOut, GraduationCap
} from 'lucide-react';

export const AdminSidebar = ({ activeTab, setActiveTab, setSearchQuery, handleLogout }) => {
  const navItems = [
    { id: 'overview', icon: <LayoutDashboard size={18} />, label: 'Tổng quan hệ thống' },
    { id: 'users', icon: <Users size={18} />, label: 'Quản lý Học sinh' },
    { id: 'teachers', icon: <GraduationCap size={18} />, label: 'Quản lý Giáo viên' },
    { id: 'courses', icon: <BookOpen size={18} />, label: 'Khóa học & Combo' },
    { id: 'feedbacks', icon: <MessageSquare size={18} />, label: 'Xem Feedback' },
    { id: 'revenue', icon: <BarChart3 size={18} />, label: 'Thống kê Doanh thu', badge: 'SOON' },
  ];

  return (
    <aside className="w-68 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 sticky top-0 h-screen z-20">
      <div>
        <div className="h-20 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">THV</div>
          <div>
            <span className="text-base font-bold text-slate-900 block">Tự Học Vui</span>
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">Hệ quản trị</span>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSearchQuery(''); }} 
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <div className="flex items-center gap-3">{item.icon} {item.label}</div>
              {item.badge && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">{item.badge}</span>}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-100">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
          <LogOut size={18} /> Đăng xuất hệ thống
        </button>
      </div>
    </aside>
  );
};