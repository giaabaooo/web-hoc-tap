// src/teacher/TeacherDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { BookOpen, PlusCircle, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

export const TeacherDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tự động lấy danh sách khóa học để hiển thị lên Dashboard
  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/courses`);
        setCourses(res.data); 
      } catch (error) {
        console.error(error);
        toast.error('Không thể tải danh sách khóa học');
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Chào mừng trở lại, Thầy/Cô {user?.displayName?.split(' ').pop()}! 👋</h1>
          <p className="text-text-tertiary mt-1">Chúc bạn một ngày giảng dạy hiệu quả.</p>
        </div>
        
        {/* Đã sửa: Nút này giờ sẽ chuyển hướng sang trang Create Course riêng */}
        <button 
          onClick={() => navigate('/teacher-dashboard/create-course')}
          className="flex items-center gap-2 bg-surface-raised hover:bg-blue-600 text-surface-muted px-4 py-2 rounded-md text-sm font-bold transition-colors shadow-1"
        >
          <PlusCircle size={18} /> Tạo khóa học mới
        </button>
      </header>

      {/* DANH SÁCH KHÓA HỌC */}
      <div className="bg-surface-muted border border-border-default rounded-lg p-6 shadow-1 min-h-[400px]">
        <h3 className="text-xl font-bold mb-6 text-gray-800">Các khóa học đang giảng dạy</h3>
        
        {loading ? (
          <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-text-tertiary border-2 border-dashed border-border-default rounded-lg">
            <BookOpen size={48} className="mx-auto mb-3 opacity-20" />
            <p>Bạn chưa tạo khóa học nào trên hệ thống.</p>
            <button 
              onClick={() => navigate('/teacher-dashboard/create-course')} 
              className="mt-4 text-surface-raised font-bold hover:underline"
            >
              Bắt đầu tạo khóa học đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="h-40 bg-gray-100 relative">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><BookOpen size={32} /></div>
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded shadow-sm ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {course.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                  </span>
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit mb-2">
                    {course.subject} - {course.tag}
                  </span>
                  <h4 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2">{course.title}</h4>
                  <p className="text-sm text-gray-500 mb-4 font-medium flex-1">
                    Giá: {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString('vi-VN')} đ`}
                  </p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <button className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-sm font-medium">
                      <Eye size={16} /> Xem
                    </button>
                    <div className="flex gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Chỉnh sửa">
                        <Edit size={16} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Xóa">
                        <Trash2 size={16} />
                      </button>
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