import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Sparkles, GraduationCap, ArrowRight, Info, Clock, BookOpen, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const firstName = user?.displayName?.split(' ')[0] || 'bạn';

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [recentCourse, setRecentCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const defaultThumbnail = "https://via.placeholder.com/600x300/e0e7ff/4f46e5?text=Hoc+Vui";

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = defaultThumbnail;
  };

  // Hàm tính toán % tiến độ (Đưa lên trên để dùng trong lúc sort API)
  const calculateProgress = (enrollment) => {
    if (!enrollment || !enrollment.progress) return 0;
    const totalLessons = enrollment.course?.totalLessons || 10;
    const completed = enrollment.progress.length;
    return totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
  };

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/courses/student/enrollments`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json'
          }
        });

        const contentType = response.headers.get("content-type");
        if (response.ok && contentType && contentType.includes("application/json")) {
          const data = await response.json();
          const enrollments = data.enrollments || data.data || data;

          if (Array.isArray(enrollments) && enrollments.length > 0) {
            // SẮP XẾP ƯU TIÊN: Tiến độ cao nhất (sắp xong) lên trước. 
            // Nếu tiến độ bằng nhau thì cái nào mới cập nhật lên trước.
            const sortedEnrollments = [...enrollments].sort((a, b) => {
              const progA = calculateProgress(a);
              const progB = calculateProgress(b);
              if (progB !== progA) return progB - progA; 
              return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
            });

            setEnrolledCourses(sortedEnrollments);
            setRecentCourse(sortedEnrollments[0]); // Lấy khóa top 1 đưa lên Hero Banner
            return;
          }
        } else {
            console.warn("Chưa gọi được API thật hoặc không trả về JSON, đang hiển thị dữ liệu mẫu...");
        }

      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dashboard:", error);
      } finally {
        // FALLBACK MOCK DATA (Tạo 2 khóa ảo để test giao diện danh sách)
        setEnrolledCourses((prev) => {
            if (prev.length === 0) {
                const mockData1 = {
                  course: { _id: 'mock-1', title: 'Học tiếng Việt cho bé (Phần 2)', thumbnail: 'https://via.placeholder.com/600x300/fca5a5/ffffff?text=Tieng+Viet', totalLessons: 10 },
                  progress: [1, 2, 3, 4, 5, 6, 7, 8], // 80%
                  totalScore: 80, updatedAt: new Date().toISOString()
                };
                const mockData2 = {
                  course: { _id: 'mock-2', title: 'Tiếng Anh mầm non (Cơ bản)', thumbnail: 'https://via.placeholder.com/600x300/93c5fd/ffffff?text=Tieng+Anh', totalLessons: 10 },
                  progress: [1, 2, 3], // 30%
                  totalScore: 30, updatedAt: new Date(Date.now() - 86400000).toISOString()
                };
                const mockList = [mockData1, mockData2];
                setRecentCourse(mockData1);
                return mockList;
            }
            return prev;
        });
        
        setIsLoading(false);
      }
    };

    fetchMyCourses();
  }, [API_URL]);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HERO SECTION */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between border border-blue-50 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-full bg-blue-50/50 rounded-l-[2rem]"></div>

          <div className="relative z-10 flex items-center gap-6 mb-6 md:mb-0">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 flex-shrink-0">
              <GraduationCap className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100/80 text-yellow-700 text-xs font-bold rounded-full mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Học vui mỗi ngày
              </div>
              <h1 className="text-2xl md:text-[28px] font-extrabold text-[#0a192f] mb-2 tracking-tight">
                Chào {firstName}, hôm nay học gì?
              </h1>
              <p className="text-gray-500 text-[15px]">
                Theo dõi tiến độ, học tiếp nội dung còn dở và giữ nhịp học mỗi ngày.
              </p>
            </div>
          </div>

          <div className="relative z-10 w-full md:w-auto flex flex-col items-start md:items-end">
            {recentCourse ? (
              <>
                <div className="text-[13px] font-medium text-gray-500 mb-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  Đang học: <strong className="text-blue-600">{recentCourse.course?.title}</strong>
                </div>
                <Link to={`/lessons/${recentCourse.course?._id}`} className="block w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm text-center">
                  Tiếp tục học
                </Link>
              </>
            ) : (
              <Link to="/lessons" className="block w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-sm text-center">
                Khám phá khóa học
              </Link>
            )}
          </div>
        </div>

        {/* VIỆC NÊN LÀM TIẾP THEO (Hiển thị tối đa 3 khóa dở) */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-1.5 text-blue-600 font-medium text-[15px] mb-2">
                <ArrowRight className="w-4 h-4" /> Đang học dở
              </div>
              <h2 className="text-[22px] font-bold text-[#0a192f]">Việc nên làm tiếp theo</h2>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <div className="animate-pulse bg-blue-50 h-32 rounded-[1.5rem] w-full"></div>
              <div className="animate-pulse bg-blue-50 h-32 rounded-[1.5rem] w-full opacity-70"></div>
            </div>
          ) : enrolledCourses.length > 0 ? (
            <div className="space-y-4">
              {/* Cắt mảng lấy tối đa 3 khóa học */}
              {enrolledCourses.slice(0, 3).map((enrollment, index) => (
                <div key={index} className="bg-[#f8faff] rounded-2xl p-4 flex flex-col sm:flex-row gap-5 border border-blue-50 hover:border-blue-200 hover:shadow-sm transition-all items-center">
                  
                  {/* Thumbnail Clickable */}
                  <Link to={`/lessons/${enrollment.course?._id}`} className="w-full sm:w-[220px] h-[120px] rounded-xl overflow-hidden flex-shrink-0 bg-blue-100 border border-gray-100 shadow-sm relative group block">
                    <img
                      src={enrollment.course?.thumbnail || defaultThumbnail}
                      alt={enrollment.course?.title}
                      onError={handleImageError}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                  </Link>

                  {/* Content */}
                  <div className="flex-1 w-full flex flex-col justify-center">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      
                      <div className="flex-1">
                        <Link to={`/lessons/${enrollment.course?._id}`} className="text-[17px] font-bold text-[#0a192f] hover:text-blue-600 transition-colors line-clamp-1 mb-1">
                          {enrollment.course?.title || "Khóa học đang tham gia"}
                        </Link>
                        
                        <p className="text-gray-500 text-[13px] mb-3">
                          Cập nhật: {new Date(enrollment.updatedAt || Date.now()).toLocaleDateString('vi-VN')}
                        </p>

                        {/* Progress Bar */}
                        <div className="w-full max-w-md">
                          <div className="flex justify-between text-[13px] font-bold text-blue-600 mb-1.5">
                            <span>Tiến độ học tập</span>
                            <span>{calculateProgress(enrollment)}%</span>
                          </div>
                          <div className="h-2 w-full bg-white border border-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all duration-500"
                              style={{ width: `${calculateProgress(enrollment)}%` }}>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Nút Button "Tiếp tục học" cho từng khóa */}
                      <div className="w-full sm:w-auto mt-2 sm:mt-0">
                        <Link 
                          to={`/lessons/${enrollment.course?._id}`} 
                          className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold rounded-xl transition-colors border border-blue-100 shadow-sm text-sm"
                        >
                          Tiếp tục học <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Link>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#f8faff] rounded-[1.5rem] p-8 border border-blue-50 flex flex-col items-center justify-center text-center">
              <Search className="w-10 h-10 text-blue-300 mb-3" />
              <p className="text-gray-600 font-medium mb-3">Bạn chưa bắt đầu khóa học nào</p>
              <Link to="/lessons" className="text-blue-600 font-semibold hover:underline">Vào danh sách bài học &rarr;</Link>
            </div>
          )}
        </div>

        {/* CỘT ĐIỂM & ĐIỂM DANH */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-[#0a192f]">Điểm của bạn</h2>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">Tổng quan về điểm tích lũy</p>
            </div>
            <div className="text-3xl font-black text-orange-500 bg-orange-50 px-4 py-2 rounded-2xl">
              {enrolledCourses.reduce((sum, enr) => sum + (enr.totalScore || 0), 0)}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm flex justify-between items-center cursor-pointer hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-[#0a192f]">Điểm danh hàng ngày</h2>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">Nhận điểm khi đăng nhập mỗi ngày</p>
            </div>
            <button className="bg-green-100 text-green-700 font-bold px-4 py-2 rounded-xl text-sm">
              Điểm danh
            </button>
          </div>
        </div>

        {/* CỘT BÀI HỌC VÀ ĐỀ THI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ĐỀ THI CỦA BẠN */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col h-full">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-md mb-3">
                  <BookOpen className="w-3.5 h-3.5" /> Luyện đề
                </div>
                <h2 className="text-[20px] font-bold text-[#0a192f]">Đề thi của bạn</h2>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                  Lịch sử làm bài <Clock className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-[#f8faff] rounded-[1.5rem] p-10 border border-blue-50 flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                <GraduationCap className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-[#0a192f] mb-2">Chưa có đề thi</h3>
              <p className="text-gray-500 text-[15px] mb-6 max-w-sm">
                Khám phá thêm để luyện tập phù hợp với mục tiêu của bạn.
              </p>
              <button className="bg-white border border-gray-200 text-blue-600 font-semibold px-6 py-2.5 rounded-full hover:bg-gray-50 shadow-sm transition-colors">
                Khám phá đề thi
              </button>
            </div>
          </div>

          {/* BÀI HỌC CỦA BẠN */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col h-full">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md mb-3">
                  <BookOpen className="w-3.5 h-3.5" /> Bài học
                </div>
                <h2 className="text-[20px] font-bold text-[#0a192f]">Bài học của bạn</h2>
              </div>
              <Link to="/dashboard/my-courses" className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">
                Lịch sử học bài <Clock className="w-4 h-4" />
              </Link>
            </div>

            {isLoading ? (
              <div className="animate-pulse bg-gray-100 rounded-[1.5rem] flex-1 min-h-[200px]"></div>
            ) : enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
                {enrolledCourses.slice(0, 2).map((enrollment, index) => (
                  <Link
                    key={index}
                    to={`/lessons/${enrollment.course?._id}`}
                    className="border border-gray-100 rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow bg-white pb-3 group"
                  >
                    <div className="w-full h-36 bg-blue-50 border-b border-gray-100 overflow-hidden">
                      <img
                        src={enrollment.course?.thumbnail || defaultThumbnail}
                        alt={enrollment.course?.title}
                        onError={handleImageError}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="px-4 pt-4 pb-2 bg-white flex-1">
                      <h3 className="text-[16px] font-bold text-[#0a192f] line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {enrollment.course?.title || "Khóa học"}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="border border-gray-100 rounded-[1.5rem] bg-gray-50 flex-1 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-gray-500 mb-2">Bạn chưa có bài học nào.</p>
                <Link to="/lessons" className="text-blue-600 font-medium hover:underline">Khám phá ngay</Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};