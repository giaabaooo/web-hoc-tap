// models/Course.js
import mongoose from 'mongoose';

const subQuestionSchema = new mongoose.Schema({
  question: { type: String, default: '' },
  options: [{ type: String }],
  correctAnswer: { type: String, default: '' }
});

const exerciseSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['multiple_choice', 'speaking', 'listening', 'flashcard', 'vocab', 'matching', 'fill_blank', 'essay', 'reading'], 
    required: true 
  },
  instruction: { type: String, default: '' },
  question: { type: String, default: '' }, 
  passage: { type: String, default: '' }, // Dành cho bài Reading
  subQuestions: [subQuestionSchema], // Câu hỏi phụ cho bài Reading
  options: [{ type: String }], // Mảng động không giới hạn
  correctAnswer: { type: String, default: '' }, 
  points: { type: Number, default: 10 }, 
  contentUrl: { type: String },
  audioUrl: { type: String }, // Dành cho âm thanh mặt sau Flashcard
  startTime: { type: Number, default: 0 }, 
  endTime: { type: Number, default: 0 }
});

const lessonSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  type: { type: String, enum: ['video_upload', 'youtube', 'image', 'document'], default: 'video_upload' },
  contentUrl: { type: String, default: '' }, 
  duration: { type: Number, default: 0 }, 
  exercises: [exerciseSchema]
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  lessons: [lessonSchema]
});

const chapterSchema = new mongoose.Schema({
  title: { type: String, default: '' },
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