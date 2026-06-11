// server.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import courseRoutes from './routes/course.routes.js'; 
import uploadRoutes from './routes/upload.routes.js'; 
import feedbackRoutes from './routes/feedback.routes.js'; // THÊM DÒNG NÀY
import adminRoutes from './routes/admin.js';             // THÊM DÒNG NÀY
import { seedAdmin } from './scripts/seedAdmin.js'; 
import userRoutes from './routes/user.routes.js';

dotenv.config();
const app = express();

const allowedOrigins = [
  'http://localhost:5173',          
  process.env.CLIENT_URL,           
  'https://tuhocvui.vn',            
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

app.use(express.json());

// --- ĐĂNG KÝ CÁC ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes); 
app.use('/api/upload', uploadRoutes);  
app.use('/api/feedback', feedbackRoutes); // THÊM DÒNG NÀY (Học sinh gửi)
app.use('/api/admin', adminRoutes);       // THÊM DÒNG NÀY (Admin quản lý)
app.use('/api/users', userRoutes);        // THÊM DÒNG NÀY (Cập nhật thông tin người dùng)

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Đã kết nối với MongoDB thành công');
    await seedAdmin();
    app.listen(PORT, () => console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`));
  })
  .catch((error) => console.error('❌ Lỗi kết nối MongoDB:', error.message));