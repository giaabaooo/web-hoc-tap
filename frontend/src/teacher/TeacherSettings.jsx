// src/teacher/TeacherSettings.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Save, User, Camera, Mail, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

export const TeacherSettings = () => {
  // Bỏ destructuring setAuth để tránh văng lỗi nếu hàm không tồn tại
  const authState = useAuthStore();
  const { user, token } = authState;
  
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    avatar: user?.avatar || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Gửi API cập nhật
      const res = await axios.put(`${API_URL}/api/users/profile`, formData, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      // Logic cập nhật State an toàn
      const updatedUser = { ...user, ...res.data.user };
      if (typeof authState.setAuth === 'function') {
        authState.setAuth({ user: updatedUser, token });
      } else if (typeof authState.login === 'function') {
        authState.login(updatedUser, token);
      } else if (typeof useAuthStore.setState === 'function') {
        useAuthStore.setState({ user: updatedUser });
      }
      
      toast.success("Cập nhật hồ sơ thành công!");
      
      // Reload lại trang sau 1s để avatar mới được đồng bộ lên toàn bộ web
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) { 
      // In lỗi thực sự ra console để dễ debug nếu bị lại
      console.error("LỖI CẬP NHẬT FRONTEND:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật!"); 
    }
    finally { setIsSaving(false); }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const toastId = toast.loading("Đang tải ảnh lên...");
    const fd = new FormData(); fd.append('file', file);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }});
      setFormData(prev => ({ ...prev, avatar: res.data.secure_url }));
      toast.update(toastId, { render: "Tải ảnh thành công!", type: "success", isLoading: false, autoClose: 2000 });
    } catch (err) { toast.update(toastId, { render: "Lỗi upload ảnh!", type: "error", isLoading: false, autoClose: 3000 }); }
  };

  return (
    <div className="max-w-3xl mx-auto font-sans">
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-6 flex items-center gap-3"><User className="text-blue-600" size={32}/> Cài Đặt Hồ Sơ</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-8 items-center border-b border-gray-100 pb-8">
            <div className="relative group">
              <img src={formData.avatar || "https://ui-avatars.com/api/?name=" + user?.displayName} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 shadow-md transition-colors">
                <Camera size={18} />
                <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
              </label>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-bold text-gray-800">{user?.displayName}</h3>
              <p className="text-sm text-gray-500 mb-2">{user?.email}</p>
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">Vai trò: Giáo viên</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                  <input type="text" name="displayName" value={formData.displayName} onChange={handleChange} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all font-medium" />
                </div>
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email (Không thể đổi)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                  <input type="email" value={user?.email} disabled className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl outline-none text-gray-500 font-medium cursor-not-allowed" />
                </div>
             </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3 items-start">
             <Shield className="text-yellow-600 flex-shrink-0 mt-0.5" size={20}/>
             <div>
               <h4 className="font-bold text-yellow-800 text-sm">Bảo mật tài khoản</h4>
               <p className="text-xs text-yellow-700 mt-1">Đổi mật khẩu hiện tại đang được quản lý bởi Google OAuth nếu bạn đăng nhập bằng Google. Nếu dùng tài khoản thường, vui lòng liên hệ Admin.</p>
             </div>
          </div>

          <div className="flex justify-end pt-4">
             <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md hover:shadow-blue-500/30 transition-all flex items-center gap-2">
               <Save size={18}/> {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};