import express from 'express';
import { googleLogin, register, login } from '../controllers/auth.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

import { 
  getPendingTeachers, 
  approveTeacher, 
  getAllTeachers, 
  getAllUsers, 
  toggleUserStatus 
} from '../controllers/admin.controller.js';
const router = express.Router();

router.post('/google', googleLogin);
router.post('/register', register);
router.post('/login', login);

// Admin Routes (Gắn vào đây hoặc tách file admin.routes.js riêng tùy ý)
router.get('/pending-teachers', protect, authorize('admin'), getPendingTeachers);
router.put('/approve-teacher/:id', protect, authorize('admin'), approveTeacher);
router.get('/teachers', protect, authorize('admin'), getAllTeachers);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/toggle-status/:id', protect, authorize('admin'), toggleUserStatus);

export default router;