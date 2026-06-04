// routes/course.routes.js
import express from 'express';
import { createCourse, getAllCourses,getCourseById } from '../controllers/course.controller.js';
import { protect } from '../middlewares/auth.middleware.js'; // Đường dẫn có thể thay đổi tùy cấu trúc thư mục của bạn

const router = express.Router();

// Lấy danh sách khóa học (Public hoặc có thể thêm protect nếu muốn)
router.get('/', getAllCourses);
router.get('/:id', getCourseById);


// Tạo khóa học mới (Yêu cầu đăng nhập - Role Teacher)
router.post('/', protect, createCourse);

export default router;