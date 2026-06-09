// src/controllers/admin.controller.js
import { User } from '../models/User.js';
import Feedback from '../models/Feedback.js';

// --- QUẢN LÝ GIÁO VIÊN ---
// Lấy danh sách giáo viên chưa được duyệt
export const getPendingTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher', isApproved: false }).select('-password');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy danh sách giáo viên chờ duyệt' });
  }
};

// Phê duyệt quyền dạy cho giáo viên
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
    res.status(500).json({ message: 'Lỗi hệ thống khi phê duyệt giáo viên' });
  }
};

// Lấy danh sách TẤT CẢ giáo viên
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy danh sách giáo viên' });
  }
};


// --- QUẢN LÝ HỌC SINH & KHÓA TK ---
// Lấy danh sách TẤT CẢ học sinh
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy danh sách học sinh' });
  }
};

// Khóa / Kích hoạt lại tài khoản người dùng
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

    res.json({ message: 'Cập nhật trạng thái tài khoản thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống khi cập nhật trạng thái hoạt động' });
  }
};


// --- QUẢN LÝ FEEDBACK HỌC VIÊN ---
// Lấy danh sách toàn bộ Feedback (Sắp xếp mới nhất lên đầu)
export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('userId', 'displayName email')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: "Không thể tải danh sách phản hồi: " + error.message });
  }
};

// Cập nhật trạng thái xử lý phản hồi góp ý
export const updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'resolved', 'processing', 'ignored'
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id, 
      { status: status || 'resolved' }, 
      { new: true }
    );
    
    if (!updatedFeedback) {
      return res.status(404).json({ message: "Không tìm thấy dữ liệu phản hồi này!" });
    }
    
    res.json({ message: "Cập nhật trạng thái xử lý feedback thành công!", updatedFeedback });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật trạng thái phản hồi: " + error.message });
  }
};