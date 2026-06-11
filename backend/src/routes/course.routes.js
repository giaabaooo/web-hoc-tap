// routes/course.routes.js
import express from 'express';
import { 
  createCourse, getAllCourses, getCourseById, getMyCourses, 
  deleteCourse, updateCourse, enrollCourse, submitLesson, 
  getCourseParticipants, checkEnrollment, getMyEnrolledCourses
} from '../controllers/course.controller.js';
import { protect } from '../middlewares/auth.middleware.js'; 

const router = express.Router();

// --- API Quản lý Khóa Học ---
router.get('/', getAllCourses);
router.get('/my-courses', protect, getMyCourses);
router.get('/student/enrollments', protect, getMyEnrolledCourses);
router.get('/:id', getCourseById);
router.post('/', protect, createCourse);
router.put('/:id', protect, updateCourse);    // API Update dùng cho Auto-save
router.delete('/:id', protect, deleteCourse); // API Delete dùng ở Dashboard

// --- API Cho Tiến Trình Học Tập ---
router.get('/:id/check-enrollment', protect, checkEnrollment);
router.post('/:id/enroll', protect, enrollCourse);
router.post('/:id/lessons/:lessonId/submit', protect, submitLesson);
router.get('/:id/participants', protect, getCourseParticipants);

export default router;