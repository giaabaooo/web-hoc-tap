import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  password: { type: String },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  avatar: { type: String },
  role: {
    type: String,
    enum: ['user', 'teacher', 'admin'],
    default: 'user', 
  },
  subscription: {
    type: String,
    enum: ['FREE', 'PRO', 'PREMIUM'],
    default: 'FREE', 
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // THÊM TRƯỜNG NÀY: Tự động duyệt cho Học sinh, Giáo viên phải đợi duyệt
  isApproved: {
    type: Boolean,
    default: function() {
      return this.role !== 'teacher'; 
    }
  }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);