// src/controllers/admin.controller.js
import { User } from '../models/User.js';
import Feedback from '../models/Feedback.js';
import { Package } from '../models/Package.js';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { UserPackage } from '../models/UserPackage.js';

// --- QUẢN LÝ GIÁO VIÊN ---
export const getPendingTeachers = async (req, res) => {
  try { res.json(await User.find({ role: 'teacher', isApproved: false }).select('-password')); } 
  catch (error) { res.status(500).json({ message: 'Lỗi' }); }
};

export const approveTeacher = async (req, res) => {
  try {
    const teacher = await User.findById(req.params.id);
    if (!teacher || teacher.role !== 'teacher') return res.status(404).json({ message: 'Không tìm thấy!' });
    teacher.isApproved = true; await teacher.save();
    res.json({ message: `🎉 Đã phê duyệt thành công giáo viên ${teacher.displayName}!` });
  } catch (error) { res.status(500).json({ message: 'Lỗi' }); }
};

export const getAllTeachers = async (req, res) => {
  try { res.json(await User.find({ role: 'teacher' }).select('-password')); } 
  catch (error) { res.status(500).json({ message: 'Lỗi' }); }
};

// --- QUẢN LÝ HỌC SINH & KHÓA TK ---
export const getAllUsers = async (req, res) => {
  try { res.json(await User.find({ role: 'user' }).select('-password')); } 
  catch (error) { res.status(500).json({ message: 'Lỗi' }); }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    user.isActive = req.body.isActive; await user.save();
    res.json({ message: 'Cập nhật trạng thái thành công!' });
  } catch (error) { res.status(500).json({ message: 'Lỗi' }); }
};

// --- QUẢN LÝ QUYỀN TRUY CẬP CỦA HỌC VIÊN ---

// 1. API: Lấy danh sách ID các gói/khóa đang sở hữu
export const getUserAccess = async (req, res) => {
  try {
    const userId = req.params.id;
    const now = new Date();
    
    // Tìm các khóa học lẻ đã lưu tiến độ
    const enrollments = await Enrollment.find({ student: userId });
    // Tìm các gói combo chưa hết hạn
    const userPackages = await UserPackage.find({ user: userId, expireAt: { $gt: now } });
    
    const ownedCourseIds = enrollments.map(e => e.course?.toString()).filter(Boolean);
    const ownedPackageIds = userPackages.map(p => p.package?.toString()).filter(Boolean);
    
    res.json({ ownedIds: [...ownedCourseIds, ...ownedPackageIds] });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thông tin quyền: ' + error.message });
  }
};

// 2. API: Cấp quyền (Combo hoặc Khóa lẻ)
export const grantUserAccess = async (req, res) => {
  try {
    const userId = req.params.id;
    const { itemId } = req.body; 
    if (!itemId) return res.status(400).json({ message: "Vui lòng chọn một khóa học/Combo!" });

    const now = new Date();

    const isPackage = await Package.findById(itemId);
    if (isPackage) {
      const durationMs = (isPackage.durationDays || 365) * 24 * 60 * 60 * 1000;
      let userPkg = await UserPackage.findOne({ user: userId, package: isPackage._id });
      if (userPkg) {
        userPkg.expireAt = userPkg.expireAt > now ? new Date(userPkg.expireAt.getTime() + durationMs) : new Date(now.getTime() + durationMs);
        await userPkg.save();
      } else {
        await UserPackage.create({ user: userId, package: isPackage._id, expireAt: new Date(now.getTime() + durationMs) });
      }
      return res.json({ message: `Đã cấp Combo: ${isPackage.title} thành công!` });
    }

    const isCourse = await Course.findById(itemId);
    if (isCourse) {
      let enrollment = await Enrollment.findOne({ student: userId, course: isCourse._id });
      if (!enrollment) await Enrollment.create({ student: userId, course: isCourse._id });
      return res.json({ message: `Đã cấp Khóa học lẻ: ${isCourse.title} thành công!` });
    }

    return res.status(404).json({ message: 'Không tìm thấy gói hoặc khóa học này!' });
  } catch (error) { res.status(500).json({ message: 'Lỗi cấp quyền: ' + error.message }); }
};

// 3. API: Thu hồi quyền
export const revokeUserAccess = async (req, res) => {
  try {
    const userId = req.params.id;
    const { itemId } = req.body;
    
    if (!itemId) return res.status(400).json({ message: "Thiếu ID sản phẩm!" });

    // Cố gắng xóa ở cả 2 bảng (Nếu trùng ID nó sẽ tự xóa cái khớp)
    const pkgRes = await UserPackage.findOneAndDelete({ user: userId, package: itemId });
    const crsRes = await Enrollment.findOneAndDelete({ student: userId, course: itemId });

    if (pkgRes || crsRes) {
       return res.json({ message: 'Đã thu hồi quyền truy cập thành công!' });
    }
    return res.status(404).json({ message: 'Người dùng không sở hữu mục này!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hệ thống khi thu hồi: ' + error.message });
  }
};

// --- QUẢN LÝ FEEDBACK & PACKAGES ---
export const getAllFeedbacks = async (req, res) => {
  try { res.json(await Feedback.find().populate('userId', 'displayName email').sort({ createdAt: -1 })); } 
  catch (error) { res.status(500).json({ message: "Lỗi" }); }
};

export const updateFeedbackStatus = async (req, res) => {
  try {
    const updatedFeedback = await Feedback.findByIdAndUpdate(req.params.id, { status: req.body.status || 'resolved' }, { new: true });
    res.json({ message: "Thành công", updatedFeedback });
  } catch (error) { res.status(500).json({ message: "Lỗi" }); }
};

export const createPackage = async (req, res) => {
  try {
    const { title, price, durationDays, type, courses, tags, priority, features } = req.body;
    const newPackage = await Package.create({ title, price: Number(price), durationDays: Number(durationDays) || 365, type, courses, tags: Array.isArray(tags) ? tags : [], priority: Number(priority) || 0, features: Array.isArray(features) ? features : [] });
    res.status(201).json({ message: "Tạo Combo thành công!", package: newPackage });
  } catch (error) { res.status(500).json({ message: "Lỗi" }); }
};

export const getAllPackages = async (req, res) => {
  try { res.json(await Package.find().populate('courses', 'title').sort({ priority: -1, createdAt: -1 })); } 
  catch (error) { res.status(500).json({ message: "Lỗi" }); }
};
export const updatePackage = async (req, res) => {
  try {
    const { title, price, durationDays, type, courses, tags, priority, features } = req.body;
    
    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      {
        title,
        price: Number(price),
        durationDays: Number(durationDays) || 365,
        type,
        courses,
        tags: Array.isArray(tags) ? tags : [],
        priority: Number(priority) || 0,
        features: Array.isArray(features) ? features : []
      },
      { new: true } // Trả về document mới sau khi update
    );

    if (!updatedPackage) {
      return res.status(404).json({ message: "Không tìm thấy Combo!" });
    }

    res.json({ message: "Cập nhật Combo thành công!", package: updatedPackage });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật: " + error.message });
  }
};
export const updateCourseMarketing = async (req, res) => {
  try {
    const { price, durationDays, tags, priority, features } = req.body;
    
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      {
        price: Number(price) || 0,
        durationDays: Number(durationDays) || 9999,
        tags: Array.isArray(tags) ? tags : [],
        priority: Number(priority) || 0,
        features: Array.isArray(features) ? features : []
      },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Không tìm thấy khóa học!" });
    }

    res.json({ message: "Cập nhật cấu hình bán khóa học thành công!", course: updatedCourse });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật khóa học: " + error.message });
  }
};
export const assignSubjectsToTeacher = async (req, res) => {
  try {
    const { subjects } = req.body; // Mảng các môn học vd: ['Toán', 'Tiếng Anh']
    const teacherId = req.params.id;

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Không tìm thấy giáo viên này!' });
    }

    teacher.allowedSubjects = Array.isArray(subjects) ? subjects : [];
    await teacher.save();

    res.json({ 
      message: `Đã cập nhật quyền bộ môn cho giáo viên ${teacher.displayName} thành công!`,
      allowedSubjects: teacher.allowedSubjects 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cấp quyền môn học: ' + error.message });
  }
};