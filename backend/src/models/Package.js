// models/Package.js
import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  durationDays: { type: Number, required: true, default: 365 }, // Hạn sử dụng
  type: { type: String, enum: ['fixed', 'dynamic'], default: 'fixed' }, // Loại gói
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],   // Các khóa học thuộc gói
  
  // CÁC TRƯỜNG MỚI THÊM VÀO ĐỂ HIỂN THỊ ĐẸP BÊN NGOÀI CLIENT
  tags: [{ type: String }], // Ví dụ: ["Luyện thi", "Phổ biến", "Khuyến nghị"]
  priority: { type: Number, default: 0 }, // Độ ưu tiên: Số càng lớn xếp càng lên đầu
  features: [{ type: String }] // Các dòng mô tả (bullet points): ["Ôn thi tất cả...", "Bao gồm 2 khóa..."]
}, { timestamps: true });

export const Package = mongoose.model('Package', packageSchema);