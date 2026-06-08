import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, Home, BookOpen, BarChart2, FileText, Edit3, ShoppingBag, Gamepad2, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getDashboardRoute = () => {
        if (user?.role === 'admin') return '/admin-dashboard';
        if (user?.role === 'teacher') return '/teacher-dashboard';
        return '/dashboard';
    };

    const getDashboardText = () => {
        if (user?.role === 'admin') return 'Quản trị hệ thống';
        if (user?.role === 'teacher') return 'Quản lý giảng dạy';
        return 'Quản lý học tập';
    };

    const navLinks = [
        { name: 'Trang chủ', path: '/', icon: <Home size={18} /> },
        {
            name: 'Bài học',
            path: '/lessons',
            icon: <BookOpen size={18} />,
            dropdown: [
                { name: 'Tiếng Anh', path: '/lessons?subject=Tiếng Anh' },
                { name: 'Tiếng Trung', path: '/lessons?subject=Tiếng Trung' },
                { name: 'Tiếng Đức (Sắp ra mắt)', path: '#', disabled: true },
                { name: 'Tiếng Nhật (Sắp ra mắt)', path: '#', disabled: true },
                { name: 'Tiếng Hàn (Sắp ra mắt)', path: '#', disabled: true },
                { name: 'Toán (Sắp ra mắt)', path: '#', disabled: true },
                { name: 'Tiếng Việt (Sắp ra mắt)', path: '#', disabled: true },
            ]
        },
        { name: 'Luyện thi', path: '/exam-prep', icon: <BarChart2 size={18} /> },
        { name: 'Tài liệu', path: '/documents', icon: <FileText size={18} /> },
        { name: 'Thi thử', path: '/mock-test', icon: <Edit3 size={18} /> },
        { name: 'Mua chương trình', path: '/pricing', icon: <ShoppingBag size={18} /> },
        { name: 'Trò chơi', path: '/games', icon: <Gamepad2 size={18} /> },
    ];

    return (
        <header className="sticky top-0 z-50 shadow-3">
            {/* Tầng 1: Trắng */}
            <div className="bg-surface-muted px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-surface-raised rounded pr-2">
                    {/* ĐÃ THÊM LOGO TẠI ĐÂY */}
                    <img
                        src="/logo.png"
                        alt="Tự Học Vui Logo"
                        className="h-12 w-auto object-contain drop-shadow-sm mix-blend-multiply"
                    />
                    <div>
                        <h1 className="text-xl font-bold text-text-primary leading-none">Tự Học Vui</h1>
                        <p className="text-xs text-orange-500 font-medium">Học vui mỗi ngày</p>
                    </div>
                </Link>

                <div className="flex items-center gap-4">
                    <button className="p-2 border border-border-default rounded-full hover:bg-surface-strong outline-none focus-visible:ring-2 focus-visible:ring-surface-raised">
                        <ShoppingCart size={20} className="text-text-tertiary" />
                    </button>

                    <div className="hidden md:flex gap-2 items-center">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1 bg-surface-strong rounded-full border border-border-default">
                                    <img
                                        src={user?.avatar || "https://via.placeholder.com/32"}
                                        alt="avatar"
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/32"; }}
                                        className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                                    />
                                    <span className="text-sm font-medium text-text-primary">{user?.displayName}</span>
                                </div>
                                <Link to={getDashboardRoute()} className="px-5 py-2 bg-surface-raised text-surface-muted rounded-full hover:bg-blue-600 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-surface-raised shadow-1 whitespace-nowrap">
                                    Vào Dashboard
                                </Link>
                                <button onClick={handleLogout} className="p-2 text-text-tertiary hover:text-red-500 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-surface-raised rounded">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/auth?role=teacher" className="px-5 py-2 border border-border-default rounded-full text-text-tertiary hover:bg-surface-strong text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-surface-raised">
                                    Giáo viên
                                </Link>
                                <Link to="/auth" className="px-5 py-2 border border-border-default rounded-full text-text-primary hover:bg-surface-strong text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-surface-raised">
                                    Đăng nhập
                                </Link>
                                <Link to="/auth?mode=register" className="px-5 py-2 bg-surface-raised text-surface-muted rounded-full hover:bg-blue-600 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-surface-raised shadow-1">
                                    Đăng ký
                                </Link>
                            </>
                        )}
                    </div>

                    <button className="md:hidden p-2 text-text-tertiary outline-none focus-visible:ring-2 focus-visible:ring-surface-raised rounded" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Tầng 2: Xanh */}
            <nav className="bg-surface-raised text-surface-muted relative z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="hidden md:flex justify-between items-center h-14">
                        <ul className="flex space-x-2">
                            {navLinks.map((link) => {
                                const isActive = location.pathname.includes(link.path) && link.path !== '/';
                                return (
                                    <li key={link.name} className="relative group">
                                        <Link
                                            to={link.path}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white ${isActive ? 'bg-surface-muted text-surface-raised' : 'hover:bg-blue-600'}`}
                                        >
                                            {link.icon} {link.name}
                                            {/* {link.dropdown && <ChevronDown size={14} className="ml-1" />} */}
                                        </Link>

                                        {link.dropdown && (
                                            <div className="absolute top-full left-0 mt-1 w-64 bg-surface-muted rounded-lg shadow-4 border border-border-default opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-fast">
                                                <ul className="py-2">
                                                    {link.dropdown.map((subItem, idx) => (
                                                        <li key={idx}>
                                                            <Link
                                                                to={subItem.path}
                                                                className={`block px-4 py-2 text-sm ${subItem.disabled ? 'text-text-tertiary cursor-not-allowed bg-surface-strong opacity-70' : 'text-text-primary hover:bg-surface-strong hover:text-surface-raised'}`}
                                                                onClick={(e) => subItem.disabled && e.preventDefault()}
                                                            >
                                                                {subItem.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                        {isAuthenticated && (
                            <Link to={getDashboardRoute()} className="flex items-center gap-2 px-4 py-2 bg-surface-muted text-surface-raised rounded-full text-sm font-medium hover:bg-gray-100 outline-none focus-visible:ring-2 focus-visible:ring-white whitespace-nowrap">
                                <UserIcon size={18} /> {getDashboardText()}
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};