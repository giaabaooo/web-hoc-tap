// src/pages/Lessons.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Clock, Eye, BookOpen, ChevronLeft, ChevronRight, Loader2, Lock } from 'lucide-react';
import { toast } from 'react-toastify'; 
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

export const Lessons = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore(); 
  
  const [activeSubject, setActiveSubject] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [apiCourses, setApiCourses] = useState([]); 
  const [myCourseIds, setMyCourseIds] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  
  const itemsPerPage = 6;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/courses`);
        
        const formattedData = res.data.map(course => ({
          id: course._id,
          title: course.title,
          tag: course.tag ? `${course.subject} - ${course.tag}` : `${course.subject} - Cơ bản`,
          subject: course.subject,
          image: course.thumbnail || getSubjectImage(course.subject),
          price: !course.price || course.price === 0 ? "Miễn phí" : `${Number(course.price).toLocaleString('vi-VN')} đ`,
          rawPrice: course.price || 0,
          status: course.isPublished ? "Đã xuất bản" : "Bản nháp",
          time: course.chapters?.length ? `${course.chapters.length} ngày` : "0 ngày",
          views: course.views || 0,
          lessons: course.chapters?.reduce((acc, chap) => acc + (chap.sections?.length || 0), 0) || 0
        }));
        
        setApiCourses(formattedData.filter(c => c.status === "Đã xuất bản"));
      } catch (error) { toast.error('Không thể kết nối với hệ thống Backend'); } 
      finally { setIsLoading(false); }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (token) {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      axios.get(`${API_URL}/api/courses/student/enrollments`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          const enrolls = res.data.enrollments || res.data || [];
          const validIds = enrolls.filter(e => !e.isExpired).map(e => e.course?._id || e.course);
          setMyCourseIds(validIds);
        }).catch(err => console.log("Lỗi tải tiến độ học"));
    }
  }, [token]);

  const getSubjectImage = (subject) => {
    switch(subject) {
      case 'Tiếng Anh': return 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80';
      case 'Tiếng Trung': return 'https://images.unsplash.com/photo-1547989453-11e67ffb3885?auto=format&fit=crop&w=400&q=80';
      case 'Tiếng Việt': return 'https://images.unsplash.com/photo-1510531704581-5b2870972060?auto=format&fit=crop&w=400&q=80';
      case 'Toán': return 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80';
      default: return 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80';
    }
  };

  const allCourses = Array.from({ length: 6 }).map((_, i) => {
    const subjects = ['Tiếng Anh', 'Tiếng Trung', 'Tiếng Việt', 'Toán'];
    const subject = subjects[i % subjects.length];
    return {
      id: `mock-${i + 1}`, title: `${subject} Cơ bản đến Nâng cao - Gói Mock ${i + 1}`, tag: `${subject} - Cơ bản`, subject: subject,
      image: getSubjectImage(subject), price: i % 2 === 0 ? "Miễn phí" : `${(i + 1) * 150}.000 đ`, rawPrice: i % 2 === 0 ? 0 : (i + 1) * 150000,
      status: "Đã xuất bản", time: "15 ngày", views: Math.floor(Math.random() * 50000), lessons: Math.floor(Math.random() * 20) + 5
    };
  });

  const combinedCourses = useMemo(() => [...apiCourses, ...allCourses], [apiCourses]);

  const filteredCourses = useMemo(() => {
    let result = combinedCourses;
    if (activeSubject !== 'Tất cả') result = result.filter(course => course.subject === activeSubject);
    if (searchQuery) result = result.filter(course => course.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return result;
  }, [activeSubject, searchQuery, combinedCourses]);

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const currentCourses = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  return (
    <div className="bg-surface-strong min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="text-surface-raised" size={32} />
          <h2 className="text-3xl font-bold text-text-primary">Bài học</h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-1/4">
            <div className="bg-surface-muted p-6 rounded-2xl shadow-1 border border-border-default sticky top-24">
              <div className="flex items-center gap-2 bg-surface-strong px-4 py-2 rounded-lg text-surface-raised font-bold text-sm mb-6 w-fit">
                <SlidersHorizontal size={16} /> BỘ LỌC BÀI HỌC
              </div>

              <div className="relative mb-6">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
                <input 
                  type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Tìm kiếm bài học..." 
                  className="w-full pl-10 pr-4 py-3 bg-surface-strong border border-border-default rounded-lg text-sm outline-none focus-visible:ring-1 focus-visible:ring-surface-raised"
                />
              </div>

              <div>
                <h3 className="font-bold text-text-primary mb-3">Môn học</h3>
                <div className="flex flex-wrap gap-2">
                  {['Tất cả', 'Toán', 'Tiếng Anh', 'Tiếng Việt', 'Tiếng Trung'].map(subj => (
                    <button 
                      key={subj} onClick={() => { setActiveSubject(subj); setCurrentPage(1); }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeSubject === subj ? 'border border-surface-raised text-surface-raised bg-blue-50' : 'border border-border-default text-text-tertiary hover:bg-surface-strong'}`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="w-full lg:w-3/4 flex flex-col">
            <div className="mb-4 text-text-tertiary text-sm">Hiển thị {currentCourses.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredCourses.length)} / {filteredCourses.length} bài học</div>
            
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-blue-500 gap-3"><Loader2 size={40} className="animate-spin" /><span className="font-medium">Đang tải danh sách bài học...</span></div>
            ) : filteredCourses.length === 0 ? (
              <div className="flex-1 flex items-center justify-center bg-surface-muted rounded-2xl border border-border-default py-20 text-text-tertiary">Không tìm thấy khóa học nào phù hợp.</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {currentCourses.map((course) => {
                    // Logic Kiểm tra khóa bài
                    const isPaid = course.rawPrice > 0;
                    const isOwned = myCourseIds.includes(course.id);
                    const isLocked = isPaid && !isOwned; 

                    return (
                      <div 
                        key={course.id} 
                        onClick={() => navigate(`/lessons/${course.id}`)} // BẤM LÀ VÀO THẲNG CHI TIẾT
                        className="bg-surface-muted rounded-2xl overflow-hidden shadow-1 border border-border-default hover:shadow-2 transition-all cursor-pointer flex flex-col group relative"
                      >
                        {/* ẢNH BÌNH THƯỜNG - Ổ KHÓA CHỈ HIỆN LÊN KHI HOVER */}
                        <div className="relative h-44 overflow-hidden bg-surface-strong">
                          <img 
                            src={course.image} 
                            alt={course.title} 
                            onError={(e) => { e.target.onerror = null; e.target.src = getSubjectImage(course.subject); }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                          
                          {/* LỚP MÀN MỜ VÀ Ổ KHÓA (HIỆU ỨNG HOVER) */}
                          {isLocked && (
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                              <div className="bg-white/95 p-3 rounded-full shadow-xl flex flex-col items-center gap-1">
                                <Lock className="text-slate-800 w-6 h-6" />
                                <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Khóa</span>
                              </div>
                            </div>
                          )}

                          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${course.rawPrice === 0 || isOwned ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {isOwned ? "Đã sở hữu" : course.price}
                          </span>
                          <span className="absolute top-3 right-3 bg-surface-raised text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">{course.status}</span>
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                          <span className="text-surface-raised bg-blue-50 px-3 py-1 rounded-md text-xs font-medium w-fit mb-3">{course.tag}</span>
                          <h3 className="font-bold text-lg text-text-primary leading-snug mb-4 flex-1 line-clamp-2 group-hover:text-surface-raised transition-colors">{course.title}</h3>
                          <div className="flex items-center justify-between text-text-tertiary text-xs pt-4 border-t border-border-default">
                            <div className="flex items-center gap-1"><Clock size={14} /> {course.time}</div>
                            <div className="flex items-center gap-1"><Eye size={14} /> {course.views}</div>
                            <div className="flex items-center gap-1"><BookOpen size={14} /> {course.lessons}</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-auto pt-4">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-border-default text-text-tertiary hover:bg-surface-strong disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft size={20} /></button>
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button key={idx + 1} onClick={() => handlePageChange(idx + 1)} className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${ currentPage === idx + 1 ? 'bg-surface-raised text-white' : 'border border-border-default text-text-tertiary hover:bg-surface-strong' }`}>{idx + 1}</button>
                    ))}
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-border-default text-text-tertiary hover:bg-surface-strong disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight size={20} /></button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};