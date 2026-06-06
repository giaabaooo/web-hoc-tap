// models/Course.js
import mongoose from 'mongoose';

// Cấp 4: Bài tập đi kèm bài học
const exerciseSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['multiple_choice', 'speaking', 'listening', 'flashcard', 'vocab', 'matching', 'fill_blank','essay'], 
    required: true 
  },
  question: { type: String, required: true }, // Câu hỏi hoặc Từ vựng cần đọc
  options: [{ type: String }], // Dùng cho Multiple Choice hoặc Matching (Mảng các lựa chọn)
  correctAnswer: { type: String, required: true }, // Đáp án đúng
  points: { type: Number, default: 10 }, // Điểm số
  contentUrl: { type: String }
});

// Cấp 3: Nội dung bài học (Video, Ảnh, PDF...)
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video_upload', 'youtube', 'image', 'document'], default: 'video_upload' },
  contentUrl: { type: String }, 
  duration: { type: Number, default: 0 }, 
  exercises: [exerciseSchema] // MỚI: Thêm mảng bài tập vào sau mỗi bài học
});

// Cấp 2: Unit / Buổi học
const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [lessonSchema]
});

// Cấp 1: Ngày / Chương
const chapterSchema = new mongoose.Schema({
  title: { type: String, required: true }, 
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
  chapters: [chapterSchema], 
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

export const Course = mongoose.model('Course', courseSchema);