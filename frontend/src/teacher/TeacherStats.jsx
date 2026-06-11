// src/teacher/TeacherStats.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { TrendingUp, Users, BookOpen, DollarSign } from 'lucide-react';
import { toast } from 'react-toastify';

export const TeacherStats = () => {
  const { token } = useAuthStore();
  const [stats, setStats] = useState({ totalCourses: 0, totalStudents: 0, totalRevenue: 0, coursesList: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/courses/teacher-stats`, { headers: { Authorization: `Bearer ${token}` } });
        setStats(res.data);
      } catch (err) { toast.error("Lỗi tải thống kê!"); }
      finally { setLoading(false); }
    };
    if (token) fetchStats();
  }, [token]);

  if (loading) return <div className="p-8 text-center text-blue-500 font-bold">Đang tải thống kê...</div>;

  return (
    <div className="w-full font-sans">
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-6 flex items-center gap-3"><TrendingUp className="text-blue-600" size={32}/> Thống Kê Tổng Quan</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 flex items-center gap-4">
           <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><BookOpen size={24}/></div>
           <div>
             <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Số khóa học</p>
             <h3 className="text-3xl font-extrabold text-gray-800">{stats.totalCourses}</h3>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center gap-4">
           <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center"><Users size={24}/></div>
           <div>
             <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Tổng học viên</p>
             <h3 className="text-3xl font-extrabold text-gray-800">{stats.totalStudents}</h3>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex items-center gap-4">
           <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><DollarSign size={24}/></div>
           <div>
             <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Doanh thu ước tính</p>
             <h3 className="text-3xl font-extrabold text-green-600">{stats.totalRevenue.toLocaleString()} đ</h3>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50"><h3 className="font-bold text-gray-700">Chi tiết từng khóa học</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-xs text-gray-400 uppercase tracking-wider">
                <th className="p-4 font-bold">Tên khóa học</th>
                <th className="p-4 font-bold text-center">Giá vé</th>
                <th className="p-4 font-bold text-center">Lượt xem</th>
                <th className="p-4 font-bold text-center">Học viên tham gia</th>
                <th className="p-4 font-bold text-right">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {stats.coursesList.map((course, idx) => (
                <tr key={idx} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                  <td className="p-4 font-bold text-gray-800">{course.title}</td>
                  <td className="p-4 text-center font-medium text-gray-600">{course.price ? `${course.price.toLocaleString()} đ` : 'Miễn phí'}</td>
                  <td className="p-4 text-center font-bold text-gray-500">{course.views}</td>
                  <td className="p-4 text-center font-extrabold text-blue-600">{course.studentCount}</td>
                  <td className="p-4 text-right font-extrabold text-green-600">{(course.price * course.studentCount).toLocaleString()} đ</td>
                </tr>
              ))}
              {stats.coursesList.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500">Chưa có dữ liệu</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};