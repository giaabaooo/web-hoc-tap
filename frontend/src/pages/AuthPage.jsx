import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

export const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, isAuthenticated, user } = useAuthStore();

  // 1. CHẶN QUAY LẠI TRANG LOGIN NẾU ĐÃ ĐĂNG NHẬP
  useEffect(() => {
    if (isAuthenticated && user) {
      // Dùng { replace: true } để xóa lịch sử trang auth, tránh việc người dùng bấm back liên tục
      if (user.role === 'admin') navigate('/admin-dashboard', { replace: true });
      else if (user.role === 'teacher') navigate('/teacher-dashboard', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // 2. ĐỒNG BỘ STATE VỚI URL
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const role = searchParams.get('role') === 'teacher' ? 'teacher' : 'user';

  const updateUrlParams = (key, value) => {
    searchParams.set(key, value);
    setSearchParams(searchParams);
  };
  
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (mode === 'register' && !formData.displayName.trim()) {
      toast.error('Vui lòng nhập họ tên!');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Email không hợp lệ!');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    setIsLoading(true);
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload = mode === 'register' ? { ...formData, role } : { email: formData.email, password: formData.password };
      
      const response = await axios.post(`${API_URL}${endpoint}`, payload);
      
      if (response.data.requiresApproval) {
        toast.info(response.data.message || '🕒 Đăng ký thành công! Vui lòng chờ Admin phê duyệt.');
        return; 
      }

      const { token, user } = response.data;
      
      login(user, token);
      toast.success(mode === 'register' ? '🎉 Đăng ký thành công!' : '🎉 Chào mừng bạn đã quay lại!');
      
      if (user.role === 'admin') navigate('/admin-dashboard', { replace: true });
      else if (user.role === 'teacher') navigate('/teacher-dashboard', { replace: true });
      else navigate('/dashboard', { replace: true });
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau!';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const response = await axios.post(`${API_URL}/api/auth/google`, {
        credential: credentialResponse.credential,
        role: role
      });

      const { token, user, requiresApproval, message } = response.data;

      if (requiresApproval || (user.role === 'teacher' && !user.isApproved)) {
        toast.info(message || '🕒 Tài khoản đang chờ Admin phê duyệt.');
        return; 
      }

      login(user, token);
      toast.success('🎉 Đăng nhập thành công!');
      
      if (user.role === 'admin') navigate('/admin-dashboard', { replace: true });
      else if (user.role === 'teacher') navigate('/teacher-dashboard', { replace: true });
      else navigate('/dashboard', { replace: true });
      
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('🕒 Tài khoản Giáo viên đang chờ duyệt.');
      } else {
        toast.error('Lỗi đăng nhập Google!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Nếu đã đăng nhập thì return null để không nháy form login trước khi chuyển trang
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-surface-strong flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* 3. SỬA TÊN THƯƠNG HIỆU */}
        <h2 className="mt-6 text-center text-3xl font-extrabold text-text-primary">
          Tự Học Vui 🚀
        </h2>
        <p className="mt-2 text-center text-md text-text-tertiary">
          {mode === 'login' ? 'Đăng nhập vào tài khoản của bạn' : 'Tạo tài khoản mới'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-muted py-8 px-4 shadow-1 sm:rounded-lg sm:px-10 border border-border-default">
          
          {/* Cập nhật UI nút chọn Role gọi hàm updateUrlParams */}
          <div className="flex rounded-md p-1 bg-surface-strong mb-6 border border-border-default">
            <button
              type="button"
              onClick={() => updateUrlParams('role', 'user')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === 'user' ? 'bg-surface-raised text-surface-muted shadow' : 'text-text-tertiary hover:text-text-primary'}`}
            >
              Học sinh
            </button>
            <button
              type="button"
              onClick={() => updateUrlParams('role', 'teacher')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${role === 'teacher' ? 'bg-surface-raised text-surface-muted shadow' : 'text-text-tertiary hover:text-text-primary'}`}
            >
              Giáo viên
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-text-primary">Họ và tên</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-border-default rounded-md shadow-sm focus:outline-none focus:ring-surface-raised focus:border-surface-raised sm:text-sm bg-surface-muted"
                  placeholder="Nhập họ và tên..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-primary">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border-default rounded-md shadow-sm focus:outline-none focus:ring-surface-raised focus:border-surface-raised sm:text-sm bg-surface-muted"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary">Mật khẩu</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-border-default rounded-md shadow-sm focus:outline-none focus:ring-surface-raised focus:border-surface-raised sm:text-sm bg-surface-muted"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-surface-muted bg-surface-raised hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-surface-raised ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Đang xử lý...' : (mode === 'login' ? 'Đăng nhập' : 'Đăng ký')}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-default" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-muted text-text-tertiary">Hoặc tiếp tục với</span>
              </div>
            </div>

            <div className={`mt-6 flex justify-center ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Kết nối với Google bị lỗi. Hãy thử lại!')}
                useOneTap={false}
                theme="outline"
                size="large"
                width="100%"
                text={mode === 'register' ? 'signup_with' : 'signin_with'}
              />
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-text-tertiary">
              {mode === 'login' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            </span>
            <button
              type="button"
              onClick={() => {
                updateUrlParams('mode', mode === 'login' ? 'register' : 'login');
                setFormData({ displayName: '', email: '', password: '' });
              }}
              className="font-medium text-surface-raised hover:text-blue-600"
            >
              {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};