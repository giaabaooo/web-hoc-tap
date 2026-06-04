import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Search, 
  CheckCircle, 
  ShieldAlert,
  Grid,
  GraduationCap,
  LogOut
} from 'lucide-react';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  
  // Quản lý Tab hiện tại: 'overview' | 'users' | 'teachers'
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // States lưu trữ dữ liệu từ Backend
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    approvedTeachers: 0,
    pendingTeachers: 0
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

 const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Gọi cả 3 API cùng lúc cho tối ưu tốc độ
      const [teachersRes, pendingRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/api/auth/teachers`, getAuthHeaders()),
        axios.get(`${API_URL}/api/auth/pending-teachers`, getAuthHeaders()),
        axios.get(`${API_URL}/api/auth/users`, getAuthHeaders()) // <-- Đã thêm API lấy users
      ]);

      const allTeachers = teachersRes.data || [];
      const pendingTeachers = pendingRes.data || [];
      const allUsers = usersRes.data || [];

      // Cập nhật State
      setUsers(allUsers);
      
      // Lọc lại để đảm bảo danh sách teachers = Pending + Approved
      // (Phòng trường hợp allTeachers trả về cả pending rồi bị lặp data)
      const approvedTeachers = allTeachers.filter(t => t.isApproved);
      setTeachers([...pendingTeachers, ...approvedTeachers]);
      
      // Cập nhật stats
      setStats({
        totalUsers: allUsers.length,
        approvedTeachers: approvedTeachers.length,
        pendingTeachers: pendingTeachers.length
      });
    } catch (error) {
      toast.error('Lỗi tải dữ liệu. Vui lòng kiểm tra kết nối mạng hoặc Token!');
      console.error(error); // In ra console để dễ debug nếu có lỗi khác
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveTeacher = async (id, name) => {
    try {
      await axios.put(`${API_URL}/api/auth/approve-teacher/${id}`, {}, getAuthHeaders());
      toast.success(`🎉 Đã duyệt quyền giảng dạy cho giáo viên ${name}!`);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Phê duyệt thất bại!');
    }
  };

  const handleToggleStatus = async (id, currentStatus, role) => {
    try {
      await axios.put(`${API_URL}/api/auth/toggle-status/${id}`, { isActive: !currentStatus }, getAuthHeaders());
      toast.success(`${currentStatus ? '🔒 Đã khóa' : '🔓 Đã kích hoạt'} tài khoản thành công!`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Cập nhật trạng thái tài khoản thất bại!');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeachers = teachers.filter(t => 
    t.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface-strong text-text-primary p-4 sm:p-6 lg:p-8">
      {/* Header Trang */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hệ thống Quản trị Tự Học Vui 🚀</h1>
          <p className="text-sm text-text-tertiary mt-1">Quản lý lớp học, xét duyệt giáo viên và kiểm soát tài khoản học sinh.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 transition-colors"
        >
          <LogOut size={18} /> Đăng xuất
        </button>
      </div>

      {/* Thanh Điều Hướng Tabs */}
      <div className="flex border-b border-border-default mb-6 gap-2">
        <button
          onClick={() => { setActiveTab('overview'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-surface-raised text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-primary'}`}
        >
          <Grid size={18} /> Tổng quan
        </button>
        <button
          onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'users' ? 'border-surface-raised text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-primary'}`}
        >
          <Users size={18} /> Quản lý Học sinh ({stats.totalUsers})
        </button>
        <button
          onClick={() => { setActiveTab('teachers'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'teachers' ? 'border-surface-raised text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-primary'}`}
        >
          <GraduationCap size={18} /> Quản lý Giáo viên ({teachers.length})
        </button>
      </div>

      {/* Giao diện tương ứng từng Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-surface-muted p-5 rounded-lg border border-border-default shadow-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-tertiary">Tổng số Học sinh</span>
                <div className="p-2 bg-blue-100 text-blue-600 rounded-md"><Users size={20} /></div>
              </div>
              <div className="mt-2 text-3xl font-bold">{stats.totalUsers}</div>
            </div>

            <div className="bg-surface-muted p-5 rounded-lg border border-border-default shadow-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-tertiary">Giáo viên đã duyệt</span>
                <div className="p-2 bg-green-100 text-green-600 rounded-md"><UserCheck size={20} /></div>
              </div>
              <div className="mt-2 text-3xl font-bold">{stats.approvedTeachers}</div>
            </div>

            <div className="bg-surface-muted p-5 rounded-lg border border-border-default shadow-1 relative">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-tertiary">Giáo viên chờ duyệt</span>
                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-md"><Clock size={20} /></div>
              </div>
              <div className="mt-2 text-3xl font-bold text-orange-500">{stats.pendingTeachers}</div>
              {stats.pendingTeachers > 0 && (
                <button 
                  onClick={() => setActiveTab('teachers')}
                  className="absolute bottom-5 right-5 text-xs text-surface-raised font-medium hover:underline"
                >
                  Duyệt ngay &rarr;
                </button>
              )}
            </div>
          </div>

          <div className="bg-surface-muted rounded-lg border border-border-default p-6 shadow-1">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-orange-500">
              <ShieldAlert size={20} /> Yêu cầu cấp quyền Giáo viên mới nhất ({stats.pendingTeachers})
            </h2>
            {teachers.filter(t => !t.isApproved).length === 0 ? (
              <p className="text-sm text-text-tertiary text-center py-4">Hiện tại không có hồ sơ giáo viên nào cần phê duyệt. Chúc mừng!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-default text-sm font-semibold text-text-tertiary">
                      <th className="py-3 px-4">Giáo viên</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Ngày đăng ký</th>
                      <th className="py-3 px-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default text-sm">
                    {teachers.filter(t => !t.isApproved).map((teacher) => (
                      <tr key={teacher._id} className="hover:bg-surface-strong transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img src={teacher.avatar || "https://via.placeholder.com/32"} alt="avatar" className="w-8 h-8 rounded-full" />
                          <span className="font-medium">{teacher.displayName}</span>
                        </td>
                        <td className="py-3 px-4 text-text-tertiary">{teacher.email}</td>
                        <td className="py-3 px-4 text-text-tertiary">{new Date(teacher.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleApproveTeacher(teacher._id, teacher.displayName)}
                            className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                          >
                            <CheckCircle size={14} /> Phê duyệt ứng viên
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {(activeTab === 'users' || activeTab === 'teachers') && (
        <div className="bg-surface-muted rounded-lg border border-border-default shadow-1 p-6">
          <div className="mb-4 relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-tertiary">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder={`Tìm kiếm theo họ tên hoặc email của ${activeTab === 'users' ? 'học sinh' : 'giáo viên'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-border-default rounded-md text-sm bg-surface-strong placeholder-text-tertiary focus:outline-none focus:ring-1 focus:ring-surface-raised focus:border-surface-raised"
            />
          </div>

          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-default text-sm font-semibold text-text-tertiary">
                    <th className="py-3 px-4">Học sinh</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Hạng tài khoản</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default text-sm">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-text-tertiary">Không tìm thấy học sinh nào phù hợp.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-surface-strong transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img src={user.avatar || "https://via.placeholder.com/32"} alt="avatar" className="w-8 h-8 rounded-full" />
                          <span className="font-medium">{user.displayName}</span>
                        </td>
                        <td className="py-3 px-4 text-text-tertiary">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.subscription === 'PREMIUM' ? 'bg-purple-100 text-purple-800' : user.subscription === 'PRO' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {user.subscription || 'FREE'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 font-medium ${user.isActive ? 'text-green-500' : 'text-red-500'}`}>
                            {user.isActive ? 'Đang hoạt động' : 'Đã bị khóa'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleStatus(user._id, user.isActive, 'user')}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${user.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                          >
                            {user.isActive ? <><UserX size={14} /> Khóa tài khoản</> : <><UserCheck size={14} /> Kích hoạt lại</>}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'teachers' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-default text-sm font-semibold text-text-tertiary">
                    <th className="py-3 px-4">Giáo viên</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Hồ sơ</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default text-sm">
                  {filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-text-tertiary">Không tìm thấy giáo viên nào phù hợp.</td>
                    </tr>
                  ) : (
                    filteredTeachers.map((teacher) => (
                      <tr key={teacher._id} className="hover:bg-surface-strong transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img src={teacher.avatar || "https://via.placeholder.com/32"} alt="avatar" className="w-8 h-8 rounded-full" />
                          <span className="font-medium">{teacher.displayName}</span>
                        </td>
                        <td className="py-3 px-4 text-text-tertiary">{teacher.email}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${teacher.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {teacher.isApproved ? 'Đã được duyệt' : 'Chờ phê duyệt'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 font-medium ${teacher.isActive ? 'text-green-500' : 'text-red-500'}`}>
                            {teacher.isActive ? 'Đang hoạt động' : 'Đã bị khóa'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right gap-2 space-x-2">
                          {!teacher.isApproved && (
                            <button
                              onClick={() => handleApproveTeacher(teacher._id, teacher.displayName)}
                              className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                            >
                              <CheckCircle size={14} /> Duyệt ứng viên
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleStatus(teacher._id, teacher.isActive, 'teacher')}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${teacher.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                          >
                            {teacher.isActive ? <><UserX size={14} /> Khóa dạy</> : <><UserCheck size={14} /> Kích hoạt lại</>}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};