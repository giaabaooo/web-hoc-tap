// models/Course.js
import mongoose from 'mongoose';

// Tầng 2: Câu hỏi nhỏ
const subQuestionSchema = new mongoose.Schema({
  question: { type: String, default: '' },
  options: [{ type: String }],
  correctAnswer: { type: String, default: '' },
  points: { type: Number, default: 10 }, 
  contentUrl: { type: String, default: '' },
  audioUrl: { type: String, default: '' } 
});

// Tầng 1: Nhóm câu hỏi (Câu hỏi lớn) - CHỖ NÀY LÀ ĐIỂM FIX QUAN TRỌNG NHẤT
const questionGroupSchema = new mongoose.Schema({
  question: { type: String, default: '' }, 
  contentUrl: { type: String, default: '' },
  audioUrl: { type: String, default: '' },
  subQuestions: [subQuestionSchema]
});

// Block Bài tập
const exerciseSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['multiple_choice', 'speaking', 'listening', 'flashcard', 'vocab', 'matching', 'fill_blank', 'essay', 'reading'], 
    required: true 
  },
  instruction: { type: String, default: '' },
  passage: { type: String, default: '' }, 
  contentUrl: { type: String, default: '' },
  startTime: { type: Number, default: 0 }, 
  endTime: { type: Number, default: 0 },
  questions: [questionGroupSchema] // Lồng mảng câu hỏi lớn vào đây
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