// controllers/course.controller.js
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { UserPackage } from '../models/UserPackage.js'; // MỚI THÊM

export const createCourse = async (req, res) => {
  try {
    const isPublished = req.body.isPublished !== undefined ? req.body.isPublished : true;
    const newCourse = await Course.create({ ...req.body, teacher: req.user._id, isPublished, views: 0 });
    res.status(201).json(newCourse);
  } catch (error) { res.status(500).json({ message: 'Lỗi khi tạo khóa học' }); }
};

export const updateCourse = async (req, res) => {
  try { 
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCourse) return res.status(404).json({ message: 'Không tìm thấy khoá học' });
    res.status(200).json(updatedCourse); 
  } 
  catch (error) { res.status(500).json({ message: 'Lỗi cập nhật' }); }
};

export const getAllCourses = async (req, res) => {
  try { res.status(200).json(await Course.find({}).sort({ createdAt: -1 })); } 
  catch (error) { res.status(500).json({ message: 'Lỗi lấy khóa học' }); }
};

export const getMyCourses = async (req, res) => {
  try { res.status(200).json(await Course.find({ teacher: req.user._id }).sort({ createdAt: -1 })); } 
  catch (error) { res.status(500).json({ message: 'Lỗi lấy khóa học' }); }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!course) return res.status(404).json({ message: 'Không tìm thấy' });
    res.status(200).json({ course });
  } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Không có quyền xoá' });
    }
    await Course.findByIdAndDelete(req.params.id);
    await Enrollment.deleteMany({ course: req.params.id }); 
    res.status(200).json({ message: 'Xóa thành công!' });
  } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
};

export const checkEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ course: req.params.id, student: req.user._id });
    res.status(200).json(enrollment); 
  } catch (error) { res.status(500).json({ message: 'Lỗi tiến trình' }); }
};

export const enrollCourse = async (req, res) => {
  try {
    if (req.user.role === 'teacher' || req.user.role === 'admin') {
      return res.status(403).json({ message: 'Giáo viên không thể tham gia khóa học!' });
    }
    let enrollment = await Enrollment.findOne({ course: req.params.id, student: req.user._id });
    if (!enrollment) { enrollment = await Enrollment.create({ course: req.params.id, student: req.user._id }); }
    res.status(200).json(enrollment);
  } catch (error) { res.status(500).json({ message: 'Lỗi bắt đầu học' }); }
};

export const submitLesson = async (req, res) => {
  try {
    const { id: courseId, lessonId } = req.params;
    const { answers = {} } = req.body; 

    const course = await Course.findById(courseId);
    let targetLesson = null;
    course.chapters.forEach(ch => ch.sections.forEach(sec => sec.lessons.forEach(l => { if (l._id.toString() === lessonId) targetLesson = l; })));

    if (!targetLesson) return res.status(404).json({ message: 'Không tìm thấy bài học' });

    let score = 0;
    
    if (targetLesson.exercises && targetLesson.exercises.length > 0) {
      targetLesson.exercises.forEach(ex => {
        const studentAnsObj = answers[ex._id.toString()];
        if (!studentAnsObj || typeof studentAnsObj !== 'object') return;

        ex.questions?.forEach((qGroup, qIdx) => {
           qGroup.subQuestions?.forEach((sq, sqIdx) => {
              const ansKey = `${qIdx}-${sqIdx}`;
              const ans = studentAnsObj[ansKey];
              if (!ans) return;
              
              const maxPts = sq.points || 10;
              
              switch(ex.type) {
                case 'speaking':
                  score += ans.score || 0; break;
                case 'matching': {
                  if (typeof ans === 'object') {
                    const rightOriginals = sq.options?.map(opt => opt.split('|')[1]) || [];
                    let correctCount = 0;
                    sq.options?.forEach((_, i) => { if (ans[i] === rightOriginals[i]) correctCount++; });
                    if (correctCount === (sq.options?.length || 1)) score += maxPts; 
                  }
                  break;
                }
                case 'essay':
                  score += maxPts; break; 
                default: { 
                  const ansStr = typeof ans === 'object' ? (ans.choice || '') : ans;
                  if (ansStr.toString().trim().toLowerCase() === (sq.correctAnswer || '').toString().trim().toLowerCase()) {
                     score += maxPts;
                  }
                }
              }
           });
        });
      });
    }

    const enrollment = await Enrollment.findOne({ course: courseId, student: req.user._id });
    if (!enrollment) return res.status(400).json({ message: 'Chưa bắt đầu khóa học' });

    const existingProgress = enrollment.progress.find(p => p.lessonId.toString() === lessonId);
    if (existingProgress) {
      if (score > existingProgress.score) {
        enrollment.totalScore = enrollment.totalScore - existingProgress.score + score;
        existingProgress.score = score;
      }
      existingProgress.answers = answers;
      existingProgress.completedAt = new Date();
    } else {
      enrollment.progress.push({ lessonId, score, answers });
      enrollment.totalScore += score;
    }

    const totalLessonsInCourse = course.chapters.reduce((acc, ch) => acc + ch.sections.reduce((a, s) => a + s.lessons.length, 0), 0);
    if (enrollment.progress.length === totalLessonsInCourse && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.completionTime = new Date();
    }

    await enrollment.save();
    res.status(200).json({ message: 'Đã lưu kết quả', score, enrollment });
  } catch (error) { res.status(500).json({ message: 'Lỗi nộp bài' }); }
};

export const getCourseParticipants = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Không tìm thấy' });
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') { return res.status(403).json({ message: 'Từ chối' }); }
    const enrollments = await Enrollment.find({ course: req.params.id }).populate('student', 'displayName email avatar').sort({ joinTime: -1 });
    res.status(200).json({ course, enrollments });
  } catch (error) { res.status(500).json({ message: 'Lỗi tải thống kê' }); }
};

// --- LOGIC ĐƯỢC CẬP NHẬT: TÍNH TOÁN NGÀY HẾT HẠN ---
export const getMyEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const enrollments = await Enrollment.find({ student: userId }).populate('course').lean();
    
    const userPackages = await UserPackage.find({ user: userId }).populate({
      path: 'package',
      populate: { path: 'courses' }
    }).lean();

    const courseMap = new Map();

    enrollments.forEach(enr => {
      if (enr.course) {
        courseMap.set(enr.course._id.toString(), {
          ...enr,
          expireAt: null, 
          isExpired: false
        });
      }
    });

    userPackages.forEach(userPkg => {
      const expireDate = new Date(userPkg.expireAt);
      const isExpired = expireDate < now;
      
      if (userPkg.package && userPkg.package.courses) {
        userPkg.package.courses.forEach(course => {
          const cId = course._id.toString();
          
          if (courseMap.has(cId)) {
            const existing = courseMap.get(cId);
            existing.expireAt = expireDate;
            existing.isExpired = isExpired;
            existing.packageTitle = userPkg.package.title;
          } else {
            courseMap.set(cId, {
              course: course,
              progress: [],
              totalScore: 0,
              updatedAt: userPkg.createdAt,
              expireAt: expireDate,
              isExpired: isExpired,
              packageTitle: userPkg.package.title
            });
          }
        });
      }
    });

    const finalCourses = Array.from(courseMap.values());
    res.status(200).json({ enrollments: finalCourses });
  } catch (error) { 
    res.status(500).json({ message: 'Lỗi lấy danh sách khóa học đang học' }); 
  }
};