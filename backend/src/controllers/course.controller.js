// controllers/course.controller.js
import { Course } from '../models/Course.js';
import mongoose from 'mongoose';
export const createCourse = async (req, res) => {
  try {
    const { title, description, subject, tag, price, thumbnail, chapters } = req.body;
    
    const newCourse = await Course.create({
      title,
      description: description || '',
      subject: subject || 'Khác',
      tag: tag || 'Cơ bản',
      price: Number(price) || 0,
      thumbnail: thumbnail || '',
      chapters: chapters || [], // Tự động lưu cấu trúc 3 cấp
      teacher: req.user._id, 
      isPublished: true,
      views: 0
    });

    res.status(201).json(newCourse);
  } catch (error) {
    console.error('Lỗi Database khi tạo khóa học:', error);
    res.status(500).json({ message: 'Lỗi khi tạo khóa học', error: error.message });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).sort({ createdAt: -1 });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách khóa học' });
  }
};
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. KIỂM TRA TRƯỚC KHI GỌI DATABASE (Đây là bước chặn lỗi CastError)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID khóa học không hợp lệ' });
    }

    // 2. Chỉ khi ID chuẩn 24 ký tự thì mới thực hiện query
    const course = await Course.findById(id);
    
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }
    
    res.status(200).json(course);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết khóa học:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};