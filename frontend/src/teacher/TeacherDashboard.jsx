// src/teacher/TeacherDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { BookOpen, PlusCircle, Edit, Trash2, Eye, Users, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

export const TeacherDashboard = () => {
  const { user, token } = useAuthStore(); 
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showStats, setShowStats] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null); 
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  const fetchMyCourses = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/courses/my-courses`, { headers: { Authorization: `Bearer ${token}` }});
      setCourses(res.data); 
    } catch (error) { toast.error('Không thể tải khóa học'); } 
    finally { setLoading(false); }
  };

  useEffect(() => { if (token) fetchMyCourses(); }, [token]);

  const handleDelete = async (courseId) => {
    if (!window.confirm('⚠️ Xóa khóa học sẽ xóa luôn lịch sử học của học viên! Bạn chắc chứ?')) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.delete(`${API_URL}/api/courses/${courseId}`, { headers: { Authorization: `Bearer ${token}` }});
      toast.success('Xóa khóa học thành công!');
      setCourses(courses.filter(course => course._id !== courseId));
    } catch (error) { toast.error('Có lỗi xảy ra khi xóa!'); }
  };

  const handleViewStats = async (courseId) => {
    setShowStats(true);
    setStatsLoading(true);
    setExpandedStudentId(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/courses/${courseId}/participants`, { headers: { Authorization: `Bearer ${token}` }});
      setSelectedCourse(res.data.course);
      setParticipants(res.data.enrollments);
    } catch (error) { toast.error("Lỗi lấy danh sách học viên!"); } 
    finally { setStatsLoading(false); }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Chưa có';
    return new Date(dateStr).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
  };

  return (
    <div className="w-full flex flex-col gap-6 relative">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Chào mừng trở lại, {user?.displayName?.split(' ').pop()}! 👋</h1>
        </div>
        <button onClick={() => navigate('/teacher-dashboard/create-course')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md font-bold hover:bg-blue-700 shadow-sm">
          <PlusCircle size={18} /> Tạo khóa học mới
        </button>
      </header>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm min-h-[400px]">
        {loading ? <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <div key={course._id} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col hover:shadow-md relative">
                {/* THẺ HIỂN THỊ DRAFT / PUBLISH */}
                <span className={`absolute top-3 right-3 px-3 py-1.5 text-xs font-bold rounded shadow-md z-10 ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {course.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                </span>

                <img src={course.thumbnail || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400"} alt="Thumb" className="w-full h-40 object-cover" />
                <div className="p-4 flex flex-col flex-1">
                  <h4 className="font-bold text-gray-800 text-lg mb-2">{course.title}</h4>
                  <p className="text-sm text-gray-500 mb-4 flex-1">Lượt xem: {course.views}</p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <button onClick={() => handleViewStats(course._id)} className="text-green-600 bg-green-50 px-3 py-1.5 rounded flex items-center gap-2 text-sm font-bold hover:bg-green-100">
                      <Users size={16} /> Thống kê điểm
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/lessons/${course._id}`)} className="p-1.5 text-gray-400 hover:text-blue-600" title="Xem trước"><Eye size={16} /></button>
                      <button onClick={() => navigate(`/teacher-dashboard/edit-course/${course._id}`)} className="p-1.5 text-gray-400 hover:text-blue-600" title="Sửa"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(course._id)} className="p-1.5 text-gray-400 hover:text-red-600" title="Xóa"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showStats && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Thống kê điểm: {selectedCourse.title}</h2>
                <p className="text-sm text-gray-500 mt-1">Sổ hàng xuống để xem điểm chi tiết từng bài học của học viên</p>
              </div>
              <button onClick={() => setShowStats(false)} className="text-gray-500 hover:text-red-500 bg-white p-2 rounded-full shadow-sm"><X size={24}/></button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 bg-gray-50">
              {statsLoading ? <div className="text-center py-10 font-bold text-blue-500">Đang tải danh sách...</div> : participants.length === 0 ? (
                <div className="text-center py-10 text-gray-500">Chưa có học viên nào ghi danh khóa học này.</div>
              ) : (
                <div className="space-y-4">
                  {participants.map(p => (
                    <div key={p._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <div 
                        onClick={() => setExpandedStudentId(expandedStudentId === p._id ? null : p._id)}
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg">
                            {(p.student?.displayName || p.student?.email || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-lg">{p.student?.displayName || p.student?.email || "Học viên Ẩn danh"}</p>
                            <p className="text-xs text-gray-500">Tham gia: {formatDate(p.joinTime)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Tiến độ khóa học</p>
                            {p.status === 'completed' ? <span className="text-green-600 font-bold text-sm">Đã hoàn thành</span> : <span className="text-yellow-600 font-bold text-sm">Đang học</span>}
                          </div>
                          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold text-center">Tổng: {p.totalScore} điểm</div>
                          {expandedStudentId === p._id ? <ChevronUp className="text-gray-400"/> : <ChevronDown className="text-gray-400"/>}
                        </div>
                      </div>

                      {expandedStudentId === p._id && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                          <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">Chi tiết điểm số từng bài học:</h4>
                          <div className="space-y-3">
                            {selectedCourse.chapters.map((chapter) => (
                              <div key={chapter._id} className="border border-gray-200 bg-white rounded-lg p-3">
                                <h5 className="font-bold text-blue-700 mb-2">{chapter.title}</h5>
                                <div className="space-y-2 pl-4 border-l-2 border-blue-100 ml-2">
                                  {chapter.sections.map(section => (
                                    <div key={section._id}>
                                      <h6 className="text-sm font-bold text-gray-600 mb-1">{section.title}</h6>
                                      <ul className="space-y-1">
                                        {section.lessons.map(lesson => {
                                          const progress = p.progress?.find(pr => pr.lessonId.toString() === lesson._id.toString());
                                          const maxPoints = lesson.exercises?.reduce((sum, ex) => sum + (ex.points || 0), 0) || 0;
                                          return (
                                            <li key={lesson._id} className="flex justify-between items-center text-sm bg-gray-50 py-1.5 px-3 rounded">
                                              <span className="text-gray-700 truncate pr-4">- {lesson.title}</span>
                                              {progress ? (
                                                <span className="font-bold text-green-600 whitespace-nowrap bg-green-100 px-2 py-0.5 rounded">{progress.score} / {maxPoints} điểm</span>
                                              ) : <span className="text-gray-400 italic text-xs whitespace-nowrap">Chưa làm bài</span>}
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};