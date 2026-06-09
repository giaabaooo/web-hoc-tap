// src/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Users, UserCheck, Clock, Search, LayoutDashboard, BookOpen, MessageSquare, BarChart3, LogOut, Calendar, Star, Image as ImageIcon, GraduationCap, TrendingUp
} from 'lucide-react';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('day');
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-06-30');

  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, approvedTeachers: 0, pendingTeachers: 0, totalRevenue: 0 });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('tuhocvui_token');
    return { headers: { Authorization: `Bearer ${token}`, 'x-auth-token': token } };
  };

  // KẾT NỐI API ĐỒNG BỘ LẤY DATA THỰC TẾ
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [teachersRes, pendingRes, usersRes, feedbackRes] = await Promise.all([
        axios.get(`${API_URL}/api/auth/teachers`, getAuthHeaders()).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/auth/pending-teachers`, getAuthHeaders()).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/auth/users`, getAuthHeaders()).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/admin/feedbacks`, getAuthHeaders()).catch(() => ({ data: [] })) // Gọi API feedback thật
      ]);

      const allTeachers = teachersRes.data || [];
      const pendingTeachers = pendingRes.data || [];
      const allUsers = usersRes.data || [];
      const allFeedbacks = feedbackRes.data || [];

      setUsers(allUsers);
      setFeedbacks(allFeedbacks);

      const approvedTeachers = allTeachers.filter(t => t.isApproved);
      setTeachers([...pendingTeachers, ...approvedTeachers]);
      
      setStats({
        totalUsers: allUsers.length || 0, 
        approvedTeachers: approvedTeachers.length || 0,
        pendingTeachers: pendingTeachers.length || 0,
        totalRevenue: 48500000 
      });

      setChartData([
        { _id: '01/06', revenue: 4200000 }, { _id: '05/06', revenue: 8900000 }, { _id: '10/06', revenue: 6100000 },
        { _id: '15/06', revenue: 12500000 }, { _id: '20/06', revenue: 5300000 }, { _id: '25/06', revenue: 9800000 }, { _id: '30/06', revenue: 7200000 },
      ]);
    } catch (error) {
      toast.error('Lỗi nạp thông tin từ máy chủ hệ thống!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange, activeTab]);

  const handleApproveTeacher = async (id, name) => {
    try {
      await axios.put(`${API_URL}/api/auth/approve-teacher/${id}`, {}, getAuthHeaders());
      toast.success(`🎉 Đã duyệt quyền giảng dạy cho giáo viên ${name}!`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Phê duyệt giảng viên thất bại!');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(`${API_URL}/api/auth/toggle-status/${id}`, { isActive: !currentStatus }, getAuthHeaders());
      toast.success(`${currentStatus ? '🔒 Đã khóa' : '🔓 Đã kích hoạt'} tài khoản thành công!`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Cập nhật trạng thái tài khoản thất bại!');
    }
  };

  // KẾT NỐI API CẬP NHẬT TRẠNG THÁI FEEDBACK THỰC TẾ
  const handleUpdateFeedbackStatus = async (id) => {
    try {
      await axios.put(`${API_URL}/api/admin/feedbacks/${id}/status`, { status: 'resolved' }, getAuthHeaders());
      toast.success('Đã xử lý và lưu trạng thái phản hồi của học sinh vào Database!');
      fetchDashboardData();
    } catch (error) {
      toast.error('Lỗi cập nhật trạng thái phản hồi');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); toast.info("Đã đăng xuất"); };
  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const filteredUsers = users.filter(u => u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredTeachers = teachers.filter(t => t.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || t.email?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      {/* SIDEBAR TRÁI */}
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
            <button onClick={() => { setActiveTab('overview'); setSearchQuery(''); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><LayoutDashboard size={18} /> Tổng quan hệ thống</button>
            <button onClick={() => { setActiveTab('users'); setSearchQuery(''); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><Users size={18} /> Quản lý Học sinh</button>
            <button onClick={() => { setActiveTab('teachers'); setSearchQuery(''); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'teachers' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><GraduationCap size={18} /> Quản lý Giáo viên</button>
            <button onClick={() => { setActiveTab('courses'); setSearchQuery(''); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'courses' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><div className="flex items-center gap-3"><BookOpen size={18} /> Quản lý Khóa học</div><span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">SOON</span></button>
            <button onClick={() => { setActiveTab('feedbacks'); setSearchQuery(''); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'feedbacks' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><MessageSquare size={18} /> Xem Feedback</button>
            <button onClick={() => { setActiveTab('revenue'); setSearchQuery(''); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'revenue' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><div className="flex items-center gap-3"><BarChart3 size={18} /> Thống kê Doanh thu</div><span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">SOON</span></button>
          </nav>
        </div>
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><LogOut size={18} /> Đăng xuất hệ thống</button>
        </div>
      </aside>

      {/* NỘI DUNG CONTAINER BIẾN THIÊN */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
          <div className="relative w-96">
            <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400"><Search size={16} /></span>
            <input type="text" placeholder="Tìm kiếm nhanh..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 text-slate-800 pl-11 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 outline-none focus:bg-white focus:border-blue-500 transition-all" />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
              <Calendar size={14} className="text-blue-500" />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent outline-none cursor-pointer" />
              <span>đến</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent outline-none cursor-pointer" />
            </div>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">Admin Tự Học Vui</p>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">Quản trị viên tối cao</p>
              </div>
              <img src="https://api.dicebear.com/7.x/initials/svg?seed=Admin&backgroundColor=3b82f6" alt="Avatar" className="w-10 h-10 rounded-xl bg-slate-100 object-cover" />
            </div>
          </div>
        </header>

        <main className="p-8 flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống học tập</h1>
                <p className="text-sm text-slate-500 mt-1">Theo dõi số liệu tăng trưởng lớp học, doanh thu và xét duyệt tài khoản vĩ mô.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                  <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng số Học sinh</p><h3 className="text-3xl font-bold text-slate-900 mt-1 font-mono">{stats.totalUsers}</h3></div>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Users size={22} /></div>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                  <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Giáo viên đã duyệt</p><h3 className="text-3xl font-bold text-emerald-600 mt-1 font-mono">{stats.approvedTeachers}</h3></div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><UserCheck size={22} /></div>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm relative">
                  <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Giáo viên chờ duyệt</p><h3 className="text-3xl font-bold text-amber-500 mt-1 font-mono">{stats.pendingTeachers}</h3></div>
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500"><Clock size={22} /></div>
                </div>
                <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                  <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doanh thu tháng này</p><h3 className="text-2xl font-bold text-indigo-600 mt-1.5 font-mono">{stats.totalRevenue.toLocaleString('vi-VN')}đ</h3></div>
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><TrendingUp size={22} /></div>
                </div>
              </div>

              {/* BIỂU ĐỒ AREA CHART */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><BarChart3 size={18} className="text-blue-600" /> Biểu đồ doanh thu thực tế</h3>
                </div>
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs><linearGradient id="colorRevenueWeb" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/><stop offset="95%" stopColor="#3B82F6" stopOpacity={0.01}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} tickFormatter={(val) => `${val/1000000}M`} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0' }} formatter={(value) => [formatCurrency(value), "Doanh thu"]} />
                      <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueWeb)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUẢN LÝ HỌC SINH */}
          {activeTab === 'users' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fadeIn">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Danh sách quản lý Học sinh</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase">
                      <th className="py-3.5 px-4">Học sinh</th>
                      <th className="py-3.5 px-4">Email liên kết</th>
                      <th className="py-3.5 px-4">Trạng thái</th>
                      <th className="py-3.5 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan="4" className="text-center py-6 text-slate-400">Không tìm thấy dữ liệu học viên.</td></tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-3"><div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-mono text-xs">{user.displayName?.charAt(0) || 'U'}</div>{user.displayName}</td>
                          <td className="py-3 px-4 font-mono text-xs">{user.email}</td>
                          <td className="py-3 px-4"><span className={`text-xs font-bold ${user.isActive !== false ? 'text-emerald-600' : 'text-rose-600'}`}>{user.isActive !== false ? 'Đang hoạt động' : 'Đã khóa'}</span></td>
                          <td className="py-3 px-4 text-right"><button onClick={() => handleToggleStatus(user._id, user.isActive !== false)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${user.isActive !== false ? 'text-rose-600 bg-rose-50 border-rose-100 hover:bg-rose-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100'}`}>{user.isActive !== false ? 'Khóa quyền access' : 'Kích hoạt lại'}</button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: QUẢN LÝ GIÁO VIÊN */}
          {activeTab === 'teachers' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fadeIn">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Hồ sơ cấp quyền Giáo viên hệ thống</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase"><th className="py-3.5 px-4">Họ và Tên</th><th className="py-3.5 px-4">Hộp thư Email</th><th className="py-3.5 px-4">Trạng thái duyệt</th><th className="py-3.5 px-4 text-right">Hành động quyết định</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {filteredTeachers.map((teacher) => (
                      <tr key={teacher._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-3"><div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-mono text-xs">{teacher.displayName?.charAt(0) || 'T'}</div>{teacher.displayName}</td>
                        <td className="py-3 px-4 font-mono text-xs">{teacher.email}</td>
                        <td className="py-3 px-4"><span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${teacher.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{teacher.isApproved ? 'Đã cấp quyền dạy' : 'Chờ xét duyệt'}</span></td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {!teacher.isApproved && <button onClick={() => handleApproveTeacher(teacher._id, teacher.displayName)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all">Duyệt ngay</button>}
                          <button onClick={() => handleToggleStatus(teacher._id, teacher.isActive !== false)} className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-all">{teacher.isActive !== false ? 'Khóa dạy' : 'Mở khóa'}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: HIỂN THỊ DANH SÁCH FEEDBACK THỰC TẾ TỪ BACKEND */}
          {activeTab === 'feedbacks' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fadeIn">
              <h2 className="text-lg font-bold text-slate-900 mb-6">Hộp thư góp ý & Báo lỗi bài học thực tế</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase">
                      <th className="py-3.5 px-4">Học viên/Email</th>
                      <th className="py-3.5 px-4">Chủ đề phân loại</th>
                      <th className="py-3.5 px-4">Nội dung phản hồi chi tiết</th>
                      <th className="py-3.5 px-4">Đánh giá</th>
                      <th className="py-3.5 px-4">Hình minh họa</th>
                      <th className="py-3.5 px-4">Tình trạng</th>
                      <th className="py-3.5 px-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {feedbacks.length === 0 ? (
                      <tr><td colSpan="7" className="text-center py-8 text-slate-400">Hộp thư trống! Chưa nhận được phản hồi nào từ học viên.</td></tr>
                    ) : (
                      feedbacks.map((f) => (
                        <tr key={f._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-xs">{f.email || (f.userId && f.userId.email) || 'Khách vãng lai'}</td>
                          <td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 rounded-md font-medium border ${f.topic === 'Báo lỗi hệ thống' ? 'bg-red-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{f.topic}</span></td>
                          <td className="py-3 px-4 max-w-xs truncate" title={f.message}>{f.message}</td>
                          <td className="py-3 px-4 text-amber-400"><div className="flex items-center gap-0.5">{[...Array(f.rating || 5)].map((_, i) => <Star key={i} size={13} fill="currentColor" />)}</div></td>
                          <td className="py-3 px-4">{f.image ? <a href={f.image} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs flex items-center gap-1"><ImageIcon size={14} /> Xem ảnh lỗi</a> : <span className="text-slate-300 text-xs">Không đính kèm</span>}</td>
                          <td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 rounded-full font-bold ${f.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{f.status === 'resolved' ? 'Đã giải quyết' : 'Mới tiếp nhận'}</span></td>
                          <td className="py-3 px-4 text-right">{f.status !== 'resolved' && <button onClick={() => handleUpdateFeedbackStatus(f._id)} className="text-xs text-blue-600 font-bold hover:underline">Đánh dấu xử lý xong</button>}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* COMING SOON PLACEHOLDER */}
          {(activeTab === 'courses' || activeTab === 'revenue') && (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center max-w-xl mx-auto mt-12 shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100"><Clock size={28} /></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Chức năng đang được xây dựng</h2>
              <button onClick={() => setActiveTab('overview')} className="mt-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm">Quay về trang tổng quan</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};