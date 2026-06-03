import { User } from '../models/User.js';

// Lấy danh sách giáo viên chưa được duyệt
export const getPendingTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher', isApproved: false }).select('-password');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy danh sách giáo viên chờ duyệt' });
  }
};

// Phê duyệt giáo viên
export const approveTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    
    const teacher = await User.findById(id);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Không tìm thấy giáo viên này!' });
    }

    teacher.isApproved = true;
    await teacher.save();

    res.json({ message: `🎉 Đã phê duyệt thành công giáo viên ${teacher.displayName}!` });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống khi phê duyệt' });
  }
};
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy danh sách giáo viên' });
  }
};

// 2. Lấy danh sách TẤT CẢ học sinh
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy danh sách học sinh' });
  }
};

// 3. Khóa / Kích hoạt lại tài khoản
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({ message: 'Cập nhật trạng thái thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống khi cập nhật trạng thái' });
  }
};