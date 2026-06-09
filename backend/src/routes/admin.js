// src/routes/admin.js
import express from 'express';
// Nhập chuẩn xác middleware kiểm tra đăng nhập và phân quyền của dự án bạn
import { protect, authorize } from '../middlewares/auth.middleware.js'; 
// Nhập các hàm xử lý từ tệp controller tập trung
import {
  getPendingTeachers,
  approveTeacher,
  getAllTeachers,
  getAllUsers,
  toggleUserStatus,
  getAllFeedbacks,
  updateFeedbackStatus
} from '../controllers/admin.controller.js';

const router = express.Router();

// Áp dụng lớp bảo vệ bắt buộc: Tất cả các route bên dưới phải ĐĂNG NHẬP và phải có quyền ADMIN mới vào được
router.use(protect);
router.use(authorize('admin'));

/* =========================================================================
   CÁC TUYẾN ĐƯỜNG API QUẢN TRỊ (ADMIN ROUTES)
   ========================================================================= */

// 1. Quản lý Giáo viên
router.get('/pending-teachers', getPendingTeachers);
router.get('/teachers', getAllTeachers);
router.put('/approve-teacher/:id', approveTeacher);

// 2. Quản lý Học sinh
router.get('/users', getAllUsers);
router.put('/toggle-status/:id', toggleUserStatus);

// 3. Quản lý Phản hồi (Feedback)
router.get('/feedbacks', getAllFeedbacks);
router.put('/feedbacks/:id/status', updateFeedbackStatus);

export default router;