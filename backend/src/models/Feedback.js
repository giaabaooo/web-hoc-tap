// File: models/Feedback.js
import mongoose from 'mongoose'; // Thay require thành import

const FeedbackSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false 
  }, 
  email: { 
    type: String, 
    required: true,
    trim: true
  }, 
  phone: { 
    type: String, 
    required: false,
    trim: true
  },
  topic: { 
    type: String, 
    required: true, 
    enum: ['Báo lỗi hệ thống', 'Góp ý bài học/khoá học', 'Giao diện & Trải nghiệm', 'Hỏi đáp tính năng', 'Khác'],
    default: 'Góp ý bài học/khoá học'
  }, 
  message: { 
    type: String, 
    required: true,
    trim: true
  },
  rating: { 
    type: Number, 
    enum: [1, 2, 3, 4, 5], 
    default: 5 
  }, 
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'resolved', 'ignored'], 
    default: 'pending' 
  },
  image: { 
    type: String, 
    required: false 
  },
  adminNotes: {
    type: String,
    required: false,
    trim: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Chuyển đổi từ module.exports sang export default
const Feedback = mongoose.model('Feedback', FeedbackSchema);
export default Feedback;