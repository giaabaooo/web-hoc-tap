import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// 1. Đăng ký bằng Email/Password (Giữ nguyên logic của bạn)
export const register = async (req, res) => {
  try {
    const { displayName, email, password, role } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email này đã được sử dụng!' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      displayName,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    if (user.role === 'teacher') {
      return res.status(201).json({
        message: 'Đăng ký tài khoản Giáo viên thành công! Vui lòng đợi Ban quản trị duyệt.',
        requiresApproval: true 
      });
    }

    res.status(201).json({
      // Đã thêm isApproved
      user: { id: user._id, email: user.email, displayName: user.displayName, role: user.role, isApproved: user.isApproved },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống khi đăng ký', error: error.message });
  }
};

// 2. Đăng nhập bằng Email/Password
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác!' });
    }

    if (user.role === 'teacher' && !user.isApproved) {
      return res.status(403).json({ 
        message: 'Tài khoản Giáo viên của bạn hiện đang chờ Admin phê duyệt. Vui lòng quay lại sau!' 
      });
    }

    res.json({
      // BỔ SUNG isApproved VÀO ĐÂY
      user: { id: user._id, email: user.email, displayName: user.displayName, role: user.role, isApproved: user.isApproved },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống khi đăng nhập' });
  }
};

// 3. Đăng nhập/Đăng ký bằng Google
export const googleLogin = async (req, res) => {
  try {
    const { credential, role } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        googleId,
        email,
        displayName: name,
        avatar: picture,
        role: role || 'user', 
        subscription: 'FREE', // Gói mặc định bạn đã setup trước đó
        isApproved: role !== 'teacher'
      });

      if (user.role === 'teacher') {
        return res.status(201).json({
          message: 'Hồ sơ Giáo viên của bạn đã được ghi nhận qua Google! Vui lòng chờ Admin phê duyệt.',
          requiresApproval: true
        });
      }
    }

    if (user.role === 'teacher' && !user.isApproved) {
      return res.status(403).json({ 
        message: 'Tài khoản Giáo viên của bạn đang chờ Admin xét duyệt hồ sơ!' 
      });
    }

    res.status(200).json({
      message: 'Đăng nhập thành công',
      token: generateToken(user._id),
      // BỔ SUNG isApproved VÀO ĐÂY
      user: { id: user._id, email: user.email, displayName: user.displayName, avatar: user.avatar, role: user.role, subscription: user.subscription, isApproved: user.isApproved }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Xác thực Google thất bại.' });
  }
};