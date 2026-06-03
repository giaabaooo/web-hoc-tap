import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Nhập Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { StudentLayout } from './layouts/StudentLayout';
import { TeacherLayout } from './layouts/TeacherLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Nhập Pages
import { Navbar } from './components/ui/Navbar';
import { Home } from './pages/Home';
import { Lessons } from './pages/Lessons';
import { CourseDetail } from './pages/CourseDetail';
import { AuthPage } from './pages/AuthPage';
import { ComingSoon } from './pages/ComingSoon';

// Nhập Dashboard
import { Dashboard } from './pages/Dashboard'; 
import { AdminDashboard } from './admin/AdminDashboard'; 
import { TeacherDashboard } from './teacher/TeacherDashboard'; 
import { CreateCourse } from './teacher/CreateCourse'; 

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      
      <Routes>
        {/* PUBLIC ROUTES - Dùng chung Navbar */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/lessons/:id" element={<CourseDetail />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Hứng các link chưa code từ Navbar */}
          <Route path="/exam-prep" element={<ComingSoon title="Luyện thi" />} />
          <Route path="/documents" element={<ComingSoon title="Tài liệu" />} />
          <Route path="/mock-test" element={<ComingSoon title="Thi thử" />} />
          <Route path="/pricing" element={<ComingSoon title="Mua chương trình" />} />
          <Route path="/games" element={<ComingSoon title="Trò chơi" />} />
        </Route>

        {/* STUDENT ROUTES - Dùng StudentLayout (Sidebar trái) */}
        <Route path="/dashboard" element={<StudentLayout />}>
          <Route index element={<Dashboard />} />
          {/* Ví dụ trang trong: /dashboard/my-courses */}
          <Route path="my-courses" element={<ComingSoon title="Khóa học của tôi" />} />
          <Route path="subscription" element={<ComingSoon title="Gói đăng ký" />} />
          <Route path="settings" element={<ComingSoon title="Cài đặt học viên" />} />
        </Route>

        {/* TEACHER ROUTES - Dùng TeacherLayout (Sidebar trái riêng) */}
        <Route path="/teacher-dashboard" element={<TeacherLayout />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="students" element={<ComingSoon title="Quản lý học viên" />} />
          <Route path="stats" element={<ComingSoon title="Thống kê doanh thu" />} />
          <Route path="settings" element={<ComingSoon title="Cài đặt hồ sơ giáo viên" />} />
          <Route path="create-course" element={<CreateCourse />} />
        </Route>

        {/* ADMIN ROUTES - Dùng AdminLayout */}
        <Route path="/admin-dashboard" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;