import express from 'express';
import { createPaymentLink, payosWebhook, checkPaymentStatus,getPublicPackages,getMyPurchaseHistory } from '../controllers/payment.controller.js';
import { protect } from '../middlewares/auth.middleware.js'; // Nhớ trỏ đúng đường dẫn middleware

const router = express.Router();

// Route tạo mã thanh toán (Bắt buộc đăng nhập)
router.post('/create', protect, createPaymentLink);

// Route Frontend gọi để check xem đã thanh toán chưa
router.get('/status/:orderCode', protect, checkPaymentStatus);

// Route Webhook cho PayOS gọi về (KHÔNG CẦN PROTECT vì hệ thống tự gọi)
router.post('/webhook', payosWebhook);
router.get('/packages', getPublicPackages);
router.get('/history', protect, getMyPurchaseHistory);

export default router;