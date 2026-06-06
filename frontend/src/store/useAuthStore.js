import { create } from 'zustand';

// Hàm hỗ trợ lấy thông tin user từ localStorage an toàn
const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getStoredUser(), // Tự động lấy lại thông tin khi F5
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  
  login: (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData)); // Lưu thông tin vào ổ cứng trình duyệt
    set({ user: userData, token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Xóa sạch khi đăng xuất
    set({ user: null, token: null, isAuthenticated: false });
  }
}));