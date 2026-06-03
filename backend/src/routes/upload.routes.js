// routes/upload.routes.js
import express from 'express';
import { upload } from '../utils/cloudinary.js'; 
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Xử lý upload 1 file với field 'file' trùng với FormData ở frontend
router.post('/', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không có file nào được tải lên.' });
  }
  
  // Cloudinary Storage sẽ tự động upload và trả về url qua req.file.path
  res.status(200).json({
    message: 'Tải lên thành công',
    secure_url: req.file.path 
  });
});

export default router;