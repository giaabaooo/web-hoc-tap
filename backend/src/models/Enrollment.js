// models/Enrollment.js
import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  joinTime: { type: Date, default: Date.now }, // Thời gian bấm "Bắt đầu học"
  completionTime: { type: Date }, // Thời gian hoàn thành khóa học
  status: { type: String, enum: ['learning', 'completed'], default: 'learning' },
  totalScore: { type: Number, default: 0 }, // Tổng điểm tích lũy
  progress: [{
    lessonId: { type: mongoose.Schema.Types.ObjectId, required: true },
    completedAt: { type: Date, default: Date.now },
    score: { type: Number, default: 0 },
    answers: mongoose.Schema.Types.Mixed // Lưu lịch sử nộp bài: { exerciseId: 'đáp án của HS' }
  }]
}, { timestamps: true });

export const Enrollment = mongoose.model('Enrollment', enrollmentSchema);