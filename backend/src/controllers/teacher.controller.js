import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';

// 1. [TEACHER] Tạo khóa học
export const createCourse = async (req, res) => {
  try {
    const isPublished = req.body.isPublished !== undefined ? req.body.isPublished : true;
    const newCourse = await Course.create({ ...req.body, teacher: req.user._id, isPublished, views: 0 });
    res.status(201).json(newCourse);
  } catch (error) { res.status(500).json({ message: 'Lỗi khi tạo khóa học' }); }
};

// 2. [TEACHER] Cập nhật khóa học
export const updateCourse = async (req, res) => {
  try { res.status(200).json(await Course.findByIdAndUpdate(req.params.id, req.body, { new: true })); } 
  catch (error) { res.status(500).json({ message: 'Lỗi cập nhật' }); }
};

// 3. [TEACHER] Xóa khóa học
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin')) return res.status(403).json({ message: 'Không quyền' });
    await Course.findByIdAndDelete(req.params.id);
    await Enrollment.deleteMany({ course: req.params.id }); 
    res.status(200).json({ message: 'Xóa thành công!' });
  } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
};

// 4. [TEACHER] Lấy danh sách khóa học của MÌNH
export const getMyCourses = async (req, res) => {
  try { res.status(200).json(await Course.find({ teacher: req.user._id }).sort({ createdAt: -1 })); } 
  catch (error) { res.status(500).json({ message: 'Lỗi lấy khóa học' }); }
};

// 5. [TEACHER] Lấy danh sách Học viên của 1 khóa học
export const getCourseParticipants = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Không tìm thấy' });
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') { return res.status(403).json({ message: 'Từ chối' }); }
    const enrollments = await Enrollment.find({ course: req.params.id }).populate('student', 'displayName email avatar').sort({ joinTime: -1 });
    res.status(200).json({ course, enrollments });
  } catch (error) { res.status(500).json({ message: 'Lỗi tải danh sách học viên' }); }
};

// 6. [TEACHER] Lấy Thống kê tổng quan (Dashboard)
export const getTeacherStats = async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user._id });
    let totalStudents = 0, totalRevenue = 0, coursesList = [];

    for (let course of courses) {
      const studentCount = await Enrollment.countDocuments({ course: course._id });
      totalStudents += studentCount;
      const revenue = (course.price || 0) * studentCount;
      totalRevenue += revenue;
      coursesList.push({ title: course.title, price: course.price, views: course.views || 0, studentCount, revenue });
    }
    res.json({ totalCourses: courses.length, totalStudents, totalRevenue, coursesList });
  } catch (error) { res.status(500).json({ message: 'Lỗi tải thống kê' }); }
};