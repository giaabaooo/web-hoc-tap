// src/routes/admin.js
import express from 'express';
import { protect, authorize } from '../middlewares/auth.middleware.js'; 
import {
  getPendingTeachers,
  approveTeacher,
  getAllTeachers,
  getAllUsers,
  toggleUserStatus,
  getAllFeedbacks,
  updateFeedbackStatus,
  createPackage, 
  getAllPackages,
  grantUserAccess,
  getUserAccess,     // MỚI: API Lấy danh sách sở hữu
  revokeUserAccess,
  updatePackage,
  updateCourseMarketing
} from '../controllers/admin.controller.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

// 1. Quản lý Giáo viên
router.get('/pending-teachers', getPendingTeachers);
router.get('/teachers', getAllTeachers);
router.put('/approve-teacher/:id', approveTeacher);

// 2. Quản lý Học sinh
router.get('/users', getAllUsers);
router.put('/toggle-status/:id', toggleUserStatus);

// API QUẢN LÝ QUYỀN TRUY CẬP KHÓA HỌC/COMBO
router.get('/users/:id/access', getUserAccess);
router.put('/users/:id/grant-access', grantUserAccess);
router.put('/users/:id/revoke-access', revokeUserAccess);

// 3. Quản lý Phản hồi (Feedback)
router.get('/feedbacks', getAllFeedbacks);
router.put('/feedbacks/:id/status', updateFeedbackStatus);

// 4. Quản lý Combo
router.post('/packages', createPackage);
router.get('/packages', getAllPackages);
router.put('/packages/:id', updatePackage);
router.put('/courses/:id/marketing', updateCourseMarketing);
export default router;