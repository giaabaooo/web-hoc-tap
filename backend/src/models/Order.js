// models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderCode: { type: Number, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // FIX QUAN TRỌNG: Lưu mảng các ID sản phẩm thay vì 1 ID duy nhất
  items: [{ type: String, required: true }], 
  
  amount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'PAID', 'CANCELLED'], default: 'PENDING' }
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);