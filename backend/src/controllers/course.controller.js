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
      chapters: chapters || [], 
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

export const getMyCourses = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Không xác thực được người dùng' });
    }
    const teacherId = new mongoose.Types.ObjectId(req.user._id);
    const courses = await Course.find({ teacher: teacherId }).sort({ createdAt: -1 });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy khóa học của tôi' });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID khóa học không hợp lệ' });
    }

    // TỰ ĐỘNG TĂNG LƯỢT XEM LÊN 1 KHI CÓ NGƯỜI GỌI API NÀY
    const course = await Course.findByIdAndUpdate(
      id, 
      { $inc: { views: 1 } }, 
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }
    res.status(200).json(course);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết khóa học:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID khóa học không hợp lệ' });
    }
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền xóa khóa học này!' });
    }
    await Course.findByIdAndDelete(id);
    res.status(200).json({ message: 'Xóa khóa học thành công!' });
  } catch (error) {
    console.error('Lỗi khi xóa khóa học:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa khóa học' });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID khóa học không hợp lệ' });
    }
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa khóa học này!' });
    }
    const updatedCourse = await Course.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedCourse);
  } catch (error) {
    console.error('Lỗi khi cập nhật khóa học:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật khóa học' });
  }
};