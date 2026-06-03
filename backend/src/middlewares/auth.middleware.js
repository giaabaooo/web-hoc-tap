import jwt from 'jsonwebtoken';
import { User } from '../models/User.js'; // Điều chỉnh lại đường dẫn model cho chuẩn

// Middleware kiểm tra user đã đăng nhập chưa
export const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập để truy cập!' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Tìm user trong DB
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Người dùng không tồn tại!' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa!' });
    }

    // Lưu user vào request để các controller sau dùng
    req.user = user;
    next();
  } catch (error) {
    console.error('Lỗi xác thực Token:', error);
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
  }
};

// Middleware phân quyền Role (vd: authorize('admin', 'teacher'))
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Tài khoản ${req.user.role} không có quyền thực hiện hành động này!` 
      });
    }
    next();
  };
};