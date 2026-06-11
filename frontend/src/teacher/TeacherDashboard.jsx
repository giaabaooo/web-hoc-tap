// src/teacher/TeacherDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { BookOpen, PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

export const TeacherDashboard = () => {
  const { user, token } = useAuthStore(); 
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyCourses = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/courses/my-courses`, { headers: { Authorization: `Bearer ${token}` }});
      setCourses(res.data); 
    } catch (error) { toast.error('Không thể tải danh sách khóa học'); } 
    finally { setLoading(false); }
  };

  useEffect(() => { if (token) fetchMyCourses(); }, [token]);

  const handleDelete = async (courseId) => {
    if (!window.confirm('⚠️ Xóa khóa học sẽ xóa luôn lịch sử học của học viên! Bạn chắc chứ?')) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.delete(`${API_URL}/api/courses/${courseId}`, { headers: { Authorization: `Bearer ${token}` }});
      toast.success('Xóa khóa học thành công!');
      setCourses(courses.filter(course => course._id !== courseId));
    } catch (error) { toast.error('Có lỗi xảy ra khi xóa!'); }
  };

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Chào mừng trở lại, {user?.displayName?.split(' ').pop()}! 👋</h1>
        <button onClick={() => navigate('/teacher-dashboard/create-course')} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-blue-700 shadow-sm transition-all w-full sm:w-auto justify-center">
          <PlusCircle size={18} /> Tạo khóa học mới
        </button>
      </header>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[400px]">
        {loading ? <div className="text-center py-12 text-blue-500 font-bold">Đang tải dữ liệu...</div> : 
         courses.length === 0 ? <div className="text-center py-12 text-gray-500">Bạn chưa có khóa học nào. Hãy tạo mới nhé!</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course._id} className="border border-gray-200 rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-shadow bg-white relative group">
                <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full shadow-sm z-10 ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {course.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                </span>

                <img src={course.thumbnail || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400"} alt="Thumb" className="w-full h-44 object-cover" />
                <div className="p-5 flex flex-col flex-1">
                  <h4 className="font-extrabold text-gray-800 text-lg mb-2 line-clamp-2">{course.title}</h4>
                  <div className="text-sm text-gray-500 mb-4 flex-1 space-y-1">
                     <p>Lượt xem: <span className="font-bold text-gray-700">{course.views || 0}</span></p>
                     <p>Giá: <span className="font-bold text-orange-600">{course.price ? `${course.price.toLocaleString()}đ` : 'Miễn phí'}</span></p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-400 uppercase"><BookOpen size={14} className="inline mr-1 -mt-0.5"/> {course.chapters?.length || 0} Chương</span>
                    <div className="flex gap-1.5">
                      <button onClick={() => navigate(`/lessons/${course._id}`)} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors" title="Xem trước"><Eye size={16} /></button>
                      <button onClick={() => navigate(`/teacher-dashboard/edit-course/${course._id}`)} className="p-2 text-gray-400 hover:text-orange-500 bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors" title="Sửa"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(course._id)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors" title="Xóa"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};