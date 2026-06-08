// routes/course.routes.js
import express from 'express';
import { 
  createCourse, getAllCourses, getCourseById, getMyCourses, 
  deleteCourse, updateCourse, enrollCourse, submitLesson, 
  getCourseParticipants, checkEnrollment 
} from '../controllers/course.controller.js';
import { protect } from '../middlewares/auth.middleware.js'; 

const router = express.Router();

router.get('/', getAllCourses);
router.get('/my-courses', protect, getMyCourses);
router.get('/:id', getCourseById);
router.post('/', protect, createCourse);
router.delete('/:id', protect, deleteCourse);
router.put('/:id', protect, updateCourse);

// --- CÁC API CHO TIẾN TRÌNH HỌC TẬP ---
router.get('/:id/check-enrollment', protect, checkEnrollment); // Fix lỗi F5
router.post('/:id/enroll', protect, enrollCourse);
router.post('/:id/lessons/:lessonId/submit', protect, submitLesson);
router.get('/:id/participants', protect, getCourseParticipants);

export default router;