// routes/course.routes.js
import express from 'express';
import { createCourse, getAllCourses, getCourseById, getMyCourses, deleteCourse ,updateCourse} from '../controllers/course.controller.js';
import { protect } from '../middlewares/auth.middleware.js'; 

const router = express.Router();

// Lấy tất cả khóa học (Dành cho trang chủ / trang bài học của học sinh)
router.get('/', getAllCourses);

// Phải đặt /my-courses TRƯỚC /:id để tránh bị nhầm lẫn route
router.get('/my-courses', protect, getMyCourses);

// Lấy chi tiết 1 khóa học
router.get('/:id', getCourseById);

// Thêm khóa học mới
router.post('/', protect, createCourse);

// --- MỚI: Xóa khóa học ---
router.delete('/:id', protect, deleteCourse);

// --- MỚI: Cập nhật khóa học ---
router.put('/:id', protect, updateCourse);

export default router;