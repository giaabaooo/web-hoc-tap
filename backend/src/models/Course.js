// models/Course.js
import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['multiple_choice', 'speaking', 'listening', 'flashcard', 'vocab', 'matching', 'fill_blank','essay'], 
    required: true 
  },
  instruction: { type: String, default: '' },
  question: { type: String, default: '' }, // Nới lỏng để lưu nháp
  options: [{ type: String }], 
  correctAnswer: { type: String, default: '' }, // Nới lỏng để lưu nháp
  points: { type: Number, default: 10 }, 
  contentUrl: { type: String },
  startTime: { type: Number, default: 0 }, 
  endTime: { type: Number, default: 0 }
});

const lessonSchema = new mongoose.Schema({
  title: { type: String, default: '' }, // Nới lỏng để lưu nháp
  type: { type: String, enum: ['video_upload', 'youtube', 'image', 'document'], default: 'video_upload' },
  contentUrl: { type: String, default: '' }, 
  duration: { type: Number, default: 0 }, 
  exercises: [exerciseSchema]
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, default: '' }, // Nới lỏng để lưu nháp
  lessons: [lessonSchema]
});

const chapterSchema = new mongoose.Schema({
  title: { type: String, default: '' }, // Nới lỏng để lưu nháp
  sections: [sectionSchema] 
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Tên khóa học là bắt buộc duy nhất
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