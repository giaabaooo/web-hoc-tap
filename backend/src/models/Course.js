// models/Course.js
import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['multiple_choice', 'speaking', 'listening', 'flashcard', 'vocab', 'matching', 'fill_blank','essay'], 
    required: true 
  },
  instruction: { type: String, default: '' }, // ĐÃ BỔ SUNG TRƯỜNG NÀY
  question: { type: String, required: true },
  options: [{ type: String }], 
  correctAnswer: { type: String, required: true }, 
  points: { type: Number, default: 10 }, 
  contentUrl: { type: String }
});

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['video_upload', 'youtube', 'image', 'document'], default: 'video_upload' },
  contentUrl: { type: String }, 
  duration: { type: Number, default: 0 }, 
  exercises: [exerciseSchema]
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [lessonSchema]
});

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