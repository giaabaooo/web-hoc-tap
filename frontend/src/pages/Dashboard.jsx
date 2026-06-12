// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Sparkles, GraduationCap, ArrowRight, Clock, BookOpen, Search, ShoppingBag, CheckCircle, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const firstName = user?.displayName?.split(' ')[0] || 'bạn';

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [recentCourse, setRecentCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const defaultThumbnail = "https://via.placeholder.com/600x300/e0e7ff/4f46e5?text=Hoc+Vui";

  const handleImageError = (e) => { e.target.onerror = null; e.target.src = defaultThumbnail; };

  const calculateProgress = (enrollment) => {
    if (!enrollment || !enrollment.progress) return 0;
    const totalLessons = enrollment.course?.totalLessons || 10;
    const completed = enrollment.progress.length;
    return totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
  };

  // Tính thời gian hết hạn hiển thị
  const renderTimeLeft = (enrollment) => {
    if (!enrollment.expireAt) return <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded">Vĩnh viễn</span>;
    if (enrollment.isExpired) return <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded font-bold">Đã hết hạn</span>;
    
    const diffTime = new Date(enrollment.expireAt) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-bold">Còn {diffDays} ngày</span>;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}`, 'Content-Type': 'application/json' };

        const [courseRes, historyRes] = await Promise.all([
          fetch(`${API_URL}/api/courses/student/enrollments`, { headers }),
          fetch(`${API_URL}/api/payments/history`, { headers })
        ]);

        if (courseRes.ok) {
          const courseData = await courseRes.json();
          const enrollments = courseData.enrollments || courseData.data || courseData;
          if (Array.isArray(enrollments) && enrollments.length > 0) {
            // Sort: Khóa còn hạn lên trên, hết hạn xuống dưới
            const sortedEnrollments = [...enrollments].sort((a, b) => {
              if (a.isExpired === b.isExpired) return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
              return a.isExpired ? 1 : -1; 
            });
            setEnrolledCourses(sortedEnrollments);
            
            // Tìm khóa học gần nhất chưa bị khóa
            const validRecent = sortedEnrollments.find(e => !e.isExpired);
            setRecentCourse(validRecent || null);
          }
        }

        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setPurchaseHistory(historyData);
        }
      } catch (error) { console.error("Lỗi tải dashboard:", error); } 
      finally { setIsLoading(false); }
    };
    fetchData();
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
              <h1 className="text-2xl md:text-[28px] font-extrabold text-[#0a192f] mb-2 tracking-tight">Chào {firstName}, hôm nay học gì?</h1>
              <p className="text-gray-500 text-[15px]">Theo dõi tiến độ, học tiếp nội dung còn dở và giữ nhịp học mỗi ngày.</p>
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

        {/* VIỆC NÊN LÀM TIẾP THEO */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-1.5 text-blue-600 font-medium text-[15px] mb-2">
                <ArrowRight className="w-4 h-4" /> Các khóa học của bạn
              </div>
              <h2 className="text-[22px] font-bold text-[#0a192f]">Tiến trình học tập</h2>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4"><div className="animate-pulse bg-blue-50 h-32 rounded-[1.5rem] w-full"></div></div>
          ) : enrolledCourses.length > 0 ? (
            <div className="space-y-4">
              {enrolledCourses.map((enrollment, index) => (
                <div key={index} className={`rounded-2xl p-4 flex flex-col sm:flex-row gap-5 border transition-all items-center relative overflow-hidden ${enrollment.isExpired ? 'bg-gray-50 border-gray-200 opacity-90' : 'bg-[#f8faff] border-blue-50 hover:border-blue-200 hover:shadow-sm'}`}>
                  
                  <div className={`w-full sm:w-[220px] h-[120px] rounded-xl flex-shrink-0 bg-blue-100 border border-gray-100 shadow-sm relative group ${enrollment.isExpired ? 'grayscale' : ''}`}>
                    <img src={enrollment.course?.thumbnail || defaultThumbnail} alt={enrollment.course?.title} onError={handleImageError} className="w-full h-full object-cover" />
                    {enrollment.isExpired && (
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                        <Lock className="text-white w-8 h-8 opacity-90" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full flex flex-col justify-center">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex-1">
                        <h3 className={`text-[17px] font-bold line-clamp-1 mb-1 ${enrollment.isExpired ? 'text-gray-500' : 'text-[#0a192f]'}`}>
                          {enrollment.course?.title || "Khóa học"}
                        </h3>
                        
                        <div className="text-[12px] mb-3 flex flex-wrap items-center gap-2">
                           <Clock className="w-3.5 h-3.5 text-gray-400" /> 
                           {renderTimeLeft(enrollment)}
                           {enrollment.packageTitle && <span className="text-gray-400 font-medium">({enrollment.packageTitle})</span>}
                        </div>

                        <div className="w-full max-w-md">
                          <div className="flex justify-between text-[13px] font-bold text-gray-500 mb-1.5">
                            <span>Tiến độ học tập</span><span>{calculateProgress(enrollment)}%</span>
                          </div>
                          <div className="h-2 w-full bg-white border border-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${enrollment.isExpired ? 'bg-gray-400' : 'bg-blue-500'}`} style={{ width: `${calculateProgress(enrollment)}%` }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Đổi nút Gia hạn nếu hết hạn */}
                      <div className="w-full sm:w-auto mt-2 sm:mt-0">
                        {enrollment.isExpired ? (
                           <Link to="/pricing" className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white font-bold rounded-xl transition-colors border border-red-100 shadow-sm text-sm">
                             <Lock className="w-4 h-4 mr-1.5" /> Gia hạn ngay
                           </Link>
                        ) : (
                           <Link to={`/lessons/${enrollment.course?._id}`} className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold rounded-xl transition-colors border border-blue-100 shadow-sm text-sm">
                             Tiếp tục học <ArrowRight className="w-4 h-4 ml-1.5" />
                           </Link>
                        )}
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
              <Link to="/pricing" className="text-blue-600 font-semibold hover:underline">Vào danh sách bài học &rarr;</Link>
            </div>
          )}
        </div>

        {/* LỊCH SỬ GIAO DỊCH */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md mb-3">
                <ShoppingBag className="w-3.5 h-3.5" /> Giao dịch
              </div>
              <h2 className="text-[20px] font-bold text-[#0a192f]">Lịch sử & Gói học đã mua</h2>
            </div>
            <Link to="/pricing" className="text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-xl transition-colors">
              Mua thêm khóa học
            </Link>
          </div>

          {isLoading ? (
             <div className="animate-pulse bg-gray-100 h-24 rounded-xl w-full"></div>
          ) : purchaseHistory.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm">
                    <th className="p-4 font-semibold whitespace-nowrap">Tên gói / Khóa học</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Ngày giao dịch</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Số tiền</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseHistory.map((item, idx) => (
                    <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                     <td className="p-4 font-bold text-gray-800">{item.itemNames || "Sản phẩm đã bị xóa"}</td>
                      <td className="p-4 text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="p-4 font-bold text-blue-600">{item.amount?.toLocaleString('vi-VN')} ₫</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-xs font-bold px-2.5 py-1 rounded border border-green-100">
                          <CheckCircle className="w-3 h-3" /> Thành công
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-[#f8faff] rounded-[1.5rem] p-8 border border-blue-50 flex flex-col items-center justify-center text-center">
              <ShoppingBag className="w-10 h-10 text-blue-300 mb-3" />
              <p className="text-gray-600 font-medium mb-1">Bạn chưa có giao dịch nào</p>
              <p className="text-sm text-gray-400">Các gói combo và khóa học bạn mua sẽ được hiển thị ở đây.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};