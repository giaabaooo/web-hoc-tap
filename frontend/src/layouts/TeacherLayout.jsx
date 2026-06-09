// src/layouts/TeacherLayout.jsx
import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { BookOpen, Users, BarChart2, Settings, LogOut, Menu } from 'lucide-react';

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
        { name: 'Học viên', path: '/teacher-dashboard/students', icon: <Users size={18} /> },
        { name: 'Doanh thu', path: '/teacher-dashboard/stats', icon: <BarChart2 size={18} /> },
        { name: 'Cài đặt', path: '/teacher-dashboard/settings', icon: <Settings size={18} /> },
    ];

    return (
        <div className="min-h-screen w-full flex flex-col bg-[#f8fafc] text-gray-800 font-sans">
            {/* TOP NAVBAR */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
                            Tự Học Vui <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-semibold">Teacher</span>
                        </Link>
                        
                        {/* NAV LINKS */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {menu.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name} to={item.path}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                                    >
                                        {item.icon} {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* USER PROFILE & LOGOUT */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-gray-200">
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-800 leading-tight">{user?.displayName}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                            <img
                                src={user?.avatar || "https://via.placeholder.com/40"}
                                alt="Avatar"
                                className="w-9 h-9 rounded-full border border-gray-200 object-cover"
                            />
                        </div>
                        <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">
                            <LogOut size={18} /> Đăng xuất
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
};