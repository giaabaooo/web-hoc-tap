// src/teacher/StudentManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { Trophy, BookOpen, Clock, ChevronDown, ChevronUp, User, Search } from 'lucide-react';
import { toast } from 'react-toastify';

export const StudentManagement = () => {
  const { token } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/courses/my-courses`, { headers: { Authorization: `Bearer ${token}` } });
        setCourses(res.data);
        if (res.data.length > 0) handleSelectCourse(res.data[0]._id);
      } catch (err) { toast.error("Lỗi lấy danh sách khóa học"); }
      finally { setLoading(false); }
    };
    fetchCourses();
  }, [token]);

  const handleSelectCourse = async (courseId) => {
    setLoading(true); setExpandedStudent(null);
    try {
      const res = await axios.get(`${API_URL}/api/courses/${courseId}/participants`, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedCourse(res.data.course);
      setParticipants(res.data.enrollments);
    } catch (err) { toast.error("Lỗi lấy dữ liệu học viên"); }
    finally { setLoading(false); }
  };

  const getHighestScore = (lessonId, progressArray) => {
    if (!progressArray || progressArray.length === 0) return null;
    const attempts = progressArray.filter(p => p.lessonId.toString() === lessonId.toString());
    if (attempts.length === 0) return null;
    return Math.max(...attempts.map(a => a.score || 0));
  };

  const filteredParticipants = participants.filter(p => 
    (p.student?.displayName || p.student?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && courses.length === 0) return <div className="p-8 text-center text-blue-500 font-bold">Đang tải...</div>;

  return (
    <div className="bg-[#f8fafc] w-full flex flex-col gap-6 font-sans relative">
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 flex items-center gap-3"><User className="text-blue-600" size={32}/> Quản Lý Học Viên</h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* SIDEBAR CHỌN KHÓA */}
        <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
          <h3 className="font-bold text-gray-700 mb-4 border-b pb-2 uppercase tracking-wide text-sm">Danh sách khóa học</h3>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {courses.map(course => (
              <button key={course._id} onClick={() => handleSelectCourse(course._id)} className={`w-full text-left p-3 rounded-lg text-sm font-bold transition-all ${selectedCourse?._id === course._id ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                {course.title}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN DANH SÁCH */}
        <div className="flex-1 w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6">
           {loading ? <div className="text-center py-10">Đang tải chi tiết...</div> : 
            !selectedCourse ? <div className="text-center py-10 text-gray-500">Vui lòng chọn khóa học</div> :
            (
              <div>
                 <div className="mb-6 pb-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                   <div>
                     <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-1"><BookOpen size={20} className="text-blue-500"/> {selectedCourse.title}</h2>
                     <p className="text-sm text-gray-500">Tổng số: <strong className="text-blue-600">{participants.length}</strong> học viên</p>
                   </div>
                   <div className="relative w-full sm:w-64">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                     <input type="text" placeholder="Tìm tên học viên..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" />
                   </div>
                 </div>

                 {filteredParticipants.length === 0 ? <div className="text-center py-10 text-orange-500 font-bold">Không tìm thấy học viên nào.</div> : (
                 <div className="space-y-4">
                   {filteredParticipants.map((p, idx) => (
                     <div key={idx} className={`border rounded-xl overflow-hidden transition-all ${expandedStudent === p._id ? 'border-blue-300 ring-4 ring-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                        <div onClick={() => setExpandedStudent(expandedStudent === p._id ? null : p._id)} className="flex flex-wrap md:flex-nowrap items-center justify-between p-4 cursor-pointer bg-white hover:bg-blue-50/50">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                {(p.student?.displayName || p.student?.email || "U").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-extrabold text-gray-800">{p.student?.displayName || "Học viên ẩn danh"}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 font-medium"><Clock size={12}/> Tham gia: {new Date(p.joinTime).toLocaleDateString('vi-VN')}</p>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-6 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                              <div className="text-right">
                                {p.status === 'completed' ? <span className="text-green-700 bg-green-100 px-3 py-1 rounded text-xs font-bold">Đã hoàn thành</span> : <span className="text-orange-700 bg-orange-100 px-3 py-1 rounded text-xs font-bold">Đang học</span>}
                              </div>
                              <div className="bg-yellow-50 border border-yellow-200 px-4 py-1.5 rounded-lg text-yellow-700 flex items-center gap-2 min-w-[100px] justify-center">
                                 <Trophy size={16} /> <span className="font-extrabold text-sm">{p.totalScore || 0} Đ</span>
                              </div>
                              {expandedStudent === p._id ? <ChevronUp className="text-gray-400 hidden md:block"/> : <ChevronDown className="text-gray-400 hidden md:block"/>}
                           </div>
                        </div>

                        {/* CHI TIẾT BÀI TẬP */}
                        {expandedStudent === p._id && (
                           <div className="bg-gray-50 p-5 border-t border-gray-100">
                             <div className="mb-4 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded text-xs font-bold border border-blue-100">
                                <span>Lưu ý:</span> Hệ thống chỉ hiển thị điểm cao nhất nếu học sinh làm lại nhiều lần.
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {selectedCourse.chapters.map(chapter => (
                                  <div key={chapter._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                    <h4 className="font-extrabold text-gray-800 text-sm mb-3 pb-2 border-b">{chapter.title}</h4>
                                    <div className="space-y-4">
                                      {chapter.sections.map(sec => (
                                         <div key={sec._id}>
                                            <p className="text-xs font-bold text-orange-600 mb-2">{sec.title}</p>
                                            <div className="space-y-2">
                                              {sec.lessons.map(lesson => {
                                                const maxPoints = lesson.exercises?.reduce((acc, cur) => acc + (cur.points||0), 0) || 0;
                                                const highestScore = getHighestScore(lesson._id, p.progress);
                                                const hasTried = highestScore !== null;

                                                return (
                                                  <div key={lesson._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-100 gap-2">
                                                     <span className="text-gray-700 font-bold text-sm truncate flex-1 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>{lesson.title}</span>
                                                     
                                                     {/* XỬ LÝ RÕ RÀNG "CHƯA LÀM" */}
                                                     <div className="flex-shrink-0 flex items-center">
                                                       {maxPoints > 0 ? (
                                                          hasTried ? (
                                                            <span className="font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded text-sm">{highestScore} / {maxPoints} điểm</span>
                                                          ) : <span className="text-gray-500 font-bold text-xs bg-gray-200 px-2 py-1 rounded">Chưa làm</span>
                                                       ) : (
                                                          // Bài chỉ có video
                                                          hasTried ? <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded">Đã xem</span> : <span className="text-gray-500 font-bold text-xs bg-gray-200 px-2 py-1 rounded">Chưa học</span>
                                                       )}
                                                     </div>
                                                  </div>
                                                )
                                              })}
                                            </div>
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
            )
           }
        </div>
      </div>
    </div>
  )
}