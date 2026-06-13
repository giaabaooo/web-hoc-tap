import express from 'express';
import { updateProfile, getProfile } from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js'; // Lưu ý: Nếu thư mục của bạn tên là 'middleware' không có 's' thì nhớ bỏ chữ 's' đi nhé.

const router = express.Router();

router.get('/profile', protect, getProfile);

router.put('/profile', protect, updateProfile);

export default router;