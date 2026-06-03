// controllers/course.controller.js
import { Course } from '../models/Course.js';

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