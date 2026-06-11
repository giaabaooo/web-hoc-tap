import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Plus, Package, CheckCircle2, Settings } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore'; 

export const CoursesTab = () => {
  const [courses, setCourses] = useState([]);
  const [courseTab, setCourseTab] = useState('list');
  const [isLoading, setIsLoading] = useState(true);
  
  const { token } = useAuthStore();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${API_URL}/api/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(res.data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách khóa học:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCourses();
  }, [API_URL, token]);

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Khóa học & Gói Combo</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý nội dung học và thiết lập luật kết hợp Combo bán hàng.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button onClick={() => setCourseTab('list')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${courseTab === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Danh sách</button>
          <button onClick={() => setCourseTab('combo')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${courseTab === 'combo' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Thiết lập Combo</button>
        </div>
      </div>

      {courseTab === 'list' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase">
                <th className="py-3.5 px-4">Tên Chương trình</th>
                <th className="py-3.5 px-4">Giáo viên tạo</th>
                <th className="py-3.5 px-4">Phân loại</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Giá gốc</th>
                <th className="py-3.5 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">Đang tải dữ liệu...</td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">Chưa có khóa học nào trên hệ thống.</td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{course.title}</td>
                    <td className="py-3 px-4">{course.teacher?.displayName || 'Giáo viên'}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                        {course.subject || 'Cơ bản'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${course.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {course.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-orange-600 font-bold">
                      {(course.price || 0).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link 
                        to={`/admin-dashboard/edit-course/${course._id}`} 
                        className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Edit size={14} /> Chỉnh sửa
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {courseTab === 'combo' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><Plus size={20} className="text-emerald-500" /> Tạo luật Combo mới</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tên Combo hiển thị</label>
                <input type="text" placeholder="VD: Combo 3 Sách Starter, Mover, Flyer" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Giá ưu đãi (VNĐ)</label>
                  <input type="number" placeholder="1300000" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Loại Combo</label>
                  <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500">
                    <option value="fixed">Gói Cố định</option>
                    <option value="dynamic">Gói Linh hoạt</option>
                  </select>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mt-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Chọn Khóa học gán vào</label>
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                   {courses.map(c => (
                     <label key={c._id} className="flex items-center gap-3 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-emerald-300">
                       <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded border-slate-300" />
                       <span className="text-sm font-medium text-slate-700">{c.title}</span>
                     </label>
                   ))}
                </div>
              </div>
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-md mt-4">Lưu cấu hình Combo</button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
             <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><Package size={20} className="text-indigo-500" /> Combo đang hoạt động</h3>
             <div className="space-y-4">
                <div className="border border-slate-200 p-4 rounded-xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">CỐ ĐỊNH</div>
                   <h4 className="font-bold text-slate-800 text-base">Combo 3: Starters + Movers + Flyers</h4>
                   <div className="text-xs text-slate-500 mt-1 flex gap-1"><CheckCircle2 size={14} className="text-emerald-500"/> Gộp 3 khóa học cố định</div>
                   <div className="mt-3 font-mono font-bold text-lg text-indigo-600">1.300.000đ</div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};