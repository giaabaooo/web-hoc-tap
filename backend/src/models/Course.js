// models/Course.js
import mongoose from 'mongoose';

// Cấp 3: Nội dung bài học (Video, Ảnh, Quiz...)
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video_upload', 'youtube', 'image', 'document', 'quiz'], default: 'video_upload' },
  contentUrl: { type: String }, // Link file upload hoặc link YouTube
  duration: { type: Number, default: 0 }, // Thời lượng (phút) - hiển thị như trong ảnh của bạn
});

// Cấp 2: Unit / Buổi học
const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true }, // VD: "Unit 1 - Buổi 1"
  lessons: [lessonSchema]
});

// Cấp 1: Ngày / Chương
const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true }, // VD: "Ngày 1"
  sections: [sectionSchema] 
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  subject: { type: String, required: true, default: 'Khác' },
  tag: { type: String, default: 'Cơ bản' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  chapters: [chapterSchema], // Cấu trúc 3 cấp mới
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

export const Course = mongoose.model('Course', courseSchema);