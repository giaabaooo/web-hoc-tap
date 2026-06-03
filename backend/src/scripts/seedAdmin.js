import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export const seedAdmin = async () => {
  try {
    // Kiểm tra xem đã có tài khoản admin nào chưa
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123456', salt); // Mật khẩu mặc định của Admin

      await User.create({
        displayName: 'Administrator',
        email: 'admin123@gmail.com', // Email đăng nhập của Admin
        password: hashedPassword,
        role: 'admin',
        isApproved: true,
        isActive: true
      });

      console.log('=======> 🎉 Đã khởi tạo tài khoản Admin thành công !');
    } else {
      console.log('=======> Admin đã tồn tại, bỏ qua bước seeding.');
    }
  } catch (error) {
    console.error('Lỗi khi chạy seed Admin:', error);
  }
};