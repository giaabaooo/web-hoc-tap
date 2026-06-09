// routes/feedback.routes.js
import express from 'express';
import Feedback from '../models/Feedback.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Cổng POST: Người dùng gửi phản hồi (Public hoặc đã đăng nhập)
router.post('/', async (req, res) => {
  try {
    const { topic, message, rating, email, image, phone } = req.body;
    let userId = null;
    let finalEmail = email;

    // Kiểm tra token xác thực thủ công nếu học viên đã đăng nhập
    const token = req.header('x-auth-token') || req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.user?.id || decoded.id;
        if (decoded.user?.email || decoded.email) {
          finalEmail = decoded.user?.email || decoded.email;
        }
      } catch (e) {
        console.warn("Token gửi kèm không hợp lệ hoặc hết hạn.");
      }
    }

    if (!message || !topic) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ các thông tin bắt buộc!" });
    }

    const newFeedback = new Feedback({
      userId,
      email: finalEmail || 'khachvanglai@tuhocvui.vn',
      phone,
      topic,
      message,
      rating,
      image
    });

    await newFeedback.save();
    res.status(201).json({ message: "Gửi phản hồi đóng góp thành công! Cảm ơn bạn." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ: " + err.message });
  }
});

export default router;