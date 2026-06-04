// server.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import courseRoutes from './routes/course.routes.js'; // THÊM DÒNG NÀY
import uploadRoutes from './routes/upload.routes.js'; // THÊM DÒNG NÀY
import { seedAdmin } from './scripts/seedAdmin.js'; 

dotenv.config();

const app = express();
const allowedOrigins = [
  'http://localhost:5173',          // Môi trường Dev của bạn
  process.env.CLIENT_URL,           // Từ biến môi trường (nếu có)
  'https://tuhocvui.vn',            // Thay bằng domain Frontend của bạn
  'https://www.tuhocvui.vn'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Tên miền này không được phép truy cập API (CORS policy).'));
    }
  },
  credentials: true
}));
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});
app.use(express.json());

// --- ĐĂNG KÝ CÁC ROUTES Ở ĐÂY ---
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes); // THÊM DÒNG NÀY ĐỂ FIX 404
app.use('/api/upload', uploadRoutes);  // THÊM DÒNG NÀY ĐỂ FIX UPLOAD VIDEO

app.get('/', (req, res) => {
  res.send(' Backend API đang hoạt động! 🚀');
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Đã kết nối với MongoDB thành công');
    
    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Lỗi kết nối MongoDB:', error.message);
  });