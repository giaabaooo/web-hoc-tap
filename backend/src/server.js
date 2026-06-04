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

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173", // URL frontend của bạn
  credentials: true
}));
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