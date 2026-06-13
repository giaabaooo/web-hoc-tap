import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router-dom'; // Thay đổi: Dùng useSearchParams
import { useAuthStore } from '../store/useAuthStore';
import { Clock } from 'lucide-react';

// Nhập các Components và Tabs
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { OverviewTab } from './tabs/OverviewTab';
import { UsersTab } from './tabs/UsersTab';
import { TeachersTab } from './tabs/TeachersTab';
import { FeedbacksTab } from './tabs/FeedbacksTab';
import { CoursesTab } from './tabs/CoursesTab';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  
  // FIX F5: Đọc và đồng bộ tab hiện tại với URL parameter
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(currentTab);

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

  // Hàm xử lý chuyển tab và đồng bộ lên URL
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchQuery(''); // Xóa nội dung tìm kiếm khi chuyển tab
    setSearchParams({ tab: newTab }); // Đẩy tham số lên URL để chặn lỗi F5
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [teachersRes, pendingRes, usersRes, feedbackRes] = await Promise.all([
        axios.get(`${API_URL}/api/auth/teachers`, getAuthHeaders()).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/auth/pending-teachers`, getAuthHeaders()).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/auth/users`, getAuthHeaders()).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/admin/feedbacks`, getAuthHeaders()).catch(() => ({ data: [] }))
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

  const handleUpdateFeedbackStatus = async (id) => {
    try {
      await axios.put(`${API_URL}/api/admin/feedbacks/${id}/status`, { status: 'resolved' }, getAuthHeaders());
      toast.success('Đã xử lý và lưu trạng thái phản hồi!');
      fetchDashboardData();
    } catch (error) {
      toast.error('Lỗi cập nhật trạng thái phản hồi');
    }
  };

  // FIX LỖI: Thêm hàm xử lý cấp quyền bộ môn
  const handleAssignSubjects = async (teacherId, subjects) => {
    try {
      await axios.put(`${API_URL}/api/admin/teachers/${teacherId}/subjects`, { subjects }, getAuthHeaders());
      toast.success('Đã cập nhật quyền bộ môn thành công!');
      fetchDashboardData(); // Gọi lại data để cập nhật giao diện
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật quyền bộ môn!');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); toast.info("Đã đăng xuất"); };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} // Sử dụng hàm đã bọc để đổi URL
        handleLogout={handleLogout} 
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <AdminHeader 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          startDate={startDate} setStartDate={setStartDate}
          endDate={endDate} setEndDate={setEndDate}
        />

        <main className="p-8 flex-1">
          {activeTab === 'overview' && <OverviewTab stats={stats} chartData={chartData} />}
          {activeTab === 'users' && <UsersTab users={users} searchQuery={searchQuery} handleToggleStatus={handleToggleStatus} />}
          
          {/* FIX LỖI: Đã truyền handleAssignSubjects xuống TeachersTab */}
          {activeTab === 'teachers' && (
            <TeachersTab 
              teachers={teachers} 
              searchQuery={searchQuery} 
              handleApproveTeacher={handleApproveTeacher} 
              handleToggleStatus={handleToggleStatus} 
              handleAssignSubjects={handleAssignSubjects} 
            />
          )}

          {activeTab === 'feedbacks' && <FeedbacksTab feedbacks={feedbacks} handleUpdateFeedbackStatus={handleUpdateFeedbackStatus} />}
          {activeTab === 'courses' && <CoursesTab />}
          
          {/* TAB CHƯA PHÁT TRIỂN */}
          {activeTab === 'revenue' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center max-w-xl mx-auto mt-12 shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100"><Clock size={28} /></div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Chức năng đang được xây dựng</h2>
              <button onClick={() => handleTabChange('overview')} className="mt-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm">Quay về trang tổng quan</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};