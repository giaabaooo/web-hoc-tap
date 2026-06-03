import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, PlayCircle, FileText, CheckCircle2, Lock, Eye, ArrowLeft, Headphones } from 'lucide-react';
import { toast } from 'react-toastify';

export const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Trạng thái mở/đóng các cấp độ
  const [expandedDays, setExpandedDays] = useState([1]); 
  const [expandedUnits, setExpandedUnits] = useState(['1-1']); 
  const [expandedSessions, setExpandedSessions] = useState(['1-1-1']); 
  
  // Trạng thái bài học đang xem
  const [activeLesson, setActiveLesson] = useState(null);

  // Mock data với link YouTube THẬT để test tính năng Học thử
  const courseData = {
    title: `Tiếng Anh Starters 360 ngày (Khóa ${id || 1})`,
    time: "360 ngày học",
    views: "40,868 lượt xem",
    tag: "Tiếng Anh - Cơ bản",
    days: Array.from({ length: 15 }).map((_, dIndex) => ({
      id: dIndex + 1,
      title: `Ngày ${dIndex + 1}`,
      duration: "30 phút",
      isTrial: dIndex < 2, // Chỉ 2 ngày đầu được học thử miễn phí
      units: [
        {
          id: `${dIndex + 1}-1`,
          title: "Unit 1: Khởi động & Từ vựng",
          sessions: [
            {
              id: `${dIndex + 1}-1-1`,
              title: "Buổi 1: Từ vựng cốt lõi",
              items: [
                { id: `${dIndex}-vid1`, type: "video", title: "Video: Hướng dẫn học lộ trình", duration: "05:00", videoUrl: "https://www.youtube.com/embed/5mGUXKcE61c" },
                { id: `${dIndex}-vid2`, type: "video", title: "Video: Learn School Supplies", duration: "12:30", videoUrl: "https://www.youtube.com/embed/5yMWB0E5w4Y" },
                { id: `${dIndex}-quiz1`, type: "quiz", title: "Bài tập: Grammar Quiz", duration: "15:00" }
              ]
            },
            {
              id: `${dIndex + 1}-1-2`,
              title: "Buổi 2: Phonics & Luyện nói",
              items: [
                { id: `${dIndex}-aud1`, type: "audio", title: "Luyện nghe: Thực hành Phonics", duration: "08:00" },
                { id: `${dIndex}-AI`, type: "ai_check", title: "Bài quay và chấm bằng AI (Speaking)", duration: "10:00" }
              ]
            }
          ]
        }
      ]
    }))
  };

  const toggleArray = (arr, setArr, id) => {
    setArr(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleBuy = () => {
    toast.success('Đang chuyển hướng đến trang thanh toán...');
  };

  // Logic click vào bài học cụ thể
  const handleItemClick = (dayItem, item) => {
    if (!dayItem.isTrial) {
      toast.warning('🔒 Bài học này thuộc gói trả phí. Vui lòng mua khóa học để mở khóa!');
      return;
    }
    setActiveLesson(item);
  };

  return (
    <div className="bg-surface-strong min-h-screen pb-12">
      {/* Header Khóa Học */}
      <div className="bg-white border-b border-border-default mb-8 py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/lessons')} className="text-text-tertiary text-sm hover:text-surface-raised mb-4 flex items-center gap-1 font-medium transition-colors">
            <ArrowLeft size={16} /> Quay lại danh sách
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">{courseData.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-tertiary font-medium">
                <span className="flex items-center gap-1.5"><PlayCircle size={16} className="text-surface-raised"/> {courseData.time}</span>
                <span className="flex items-center gap-1.5"><Eye size={16} className="text-surface-raised"/> {courseData.views}</span>
                <span className="bg-blue-50 text-surface-raised border border-blue-200 px-3 py-1 rounded-md">{courseData.tag}</span>
              </div>
            </div>
            
            <button onClick={handleBuy} className="px-8 py-3.5 bg-green-600 text-white rounded-lg font-bold shadow hover:bg-green-700 transition-colors whitespace-nowrap text-lg">
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* CỘT TRÁI: ACCORDION 4 CẤP (Ngày -> Unit -> Buổi -> Items) */}
          <aside className="w-full lg:w-[400px] flex-shrink-0 bg-white rounded-xl shadow border border-border-default h-fit sticky top-24 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-lg text-text-primary">Nội dung học</h3>
              <span className="text-sm font-medium text-text-tertiary">{courseData.days.length} ngày</span>
            </div>

            <div className="overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {courseData.days.map((day) => (
                <div key={day.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  
                  {/* CẤP 1: NGÀY */}
                  <button 
                    onClick={() => toggleArray(expandedDays, setExpandedDays, day.id)}
                    className={`w-full flex items-center justify-between p-3 transition-colors ${expandedDays.includes(day.id) ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${day.isTrial ? 'bg-surface-raised text-white shadow-sm' : 'bg-gray-200 text-gray-500'}`}>
                        {day.isTrial ? day.id : <Lock size={14}/>}
                      </div>
                      <span className={`font-bold ${day.isTrial ? 'text-gray-900' : 'text-gray-500'}`}>{day.title}</span>
                      {day.isTrial && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded border border-red-200 font-bold ml-1">HỌC THỬ</span>}
                    </div>
                    {expandedDays.includes(day.id) ? <ChevronDown size={18} className="text-gray-400"/> : <ChevronRight size={18} className="text-gray-400"/>}
                  </button>

                  {/* CẤP 2: UNIT */}
                  {expandedDays.includes(day.id) && (
                    <div className="p-2 bg-white space-y-2 border-t border-gray-100">
                      {day.units.map(unit => (
                        <div key={unit.id} className="border border-gray-200 rounded-md">
                          <button 
                            onClick={() => toggleArray(expandedUnits, setExpandedUnits, unit.id)}
                            className="w-full flex items-center justify-between p-2.5 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-t-md"
                          >
                            <span className="text-red-500">{unit.title}</span>
                            {expandedUnits.includes(unit.id) ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                          </button>

                          {/* CẤP 3: BUỔI */}
                          {expandedUnits.includes(unit.id) && (
                            <div className="p-2 space-y-2 bg-white rounded-b-md">
                              {unit.sessions.map(session => (
                                <div key={session.id}>
                                  <button 
                                    onClick={() => toggleArray(expandedSessions, setExpandedSessions, session.id)}
                                    className="w-full flex items-center gap-2 p-2 text-sm font-semibold text-gray-800 hover:text-surface-raised transition-colors"
                                  >
                                    {expandedSessions.includes(session.id) ? <ChevronDown size={14} className="text-surface-raised"/> : <ChevronRight size={14} className="text-gray-400"/>}
                                    {session.title}
                                  </button>

                                  {/* CẤP 4: BÀI HỌC (VIDEO/QUIZ/AUDIO) */}
                                  {expandedSessions.includes(session.id) && (
                                    <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-gray-100 ml-4 mt-1">
                                      {session.items.map(item => {
                                        const isPlaying = activeLesson?.id === item.id;
                                        return (
                                          <button 
                                            key={item.id}
                                            onClick={() => handleItemClick(day, item)}
                                            className={`w-full flex items-center gap-3 p-2.5 text-sm text-left rounded-md group transition-all ${
                                              isPlaying 
                                                ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                                                : 'hover:bg-gray-50 border border-transparent'
                                            }`}
                                          >
                                            {/* Icon tùy theo thể loại */}
                                            {item.type === 'video' && <PlayCircle size={18} className={isPlaying ? "text-surface-raised" : "text-gray-400 group-hover:text-surface-raised"}/>}
                                            {item.type === 'quiz' && <FileText size={18} className={isPlaying ? "text-green-500" : "text-gray-400 group-hover:text-green-500"}/>}
                                            {item.type === 'audio' && <Headphones size={18} className={isPlaying ? "text-orange-500" : "text-gray-400 group-hover:text-orange-500"}/>}
                                            {item.type === 'ai_check' && <CheckCircle2 size={18} className={isPlaying ? "text-purple-500" : "text-gray-400 group-hover:text-purple-500"}/>}
                                            
                                            <div className="flex-1">
                                              <div className={`line-clamp-2 leading-tight mb-0.5 ${isPlaying ? 'text-surface-raised font-bold' : 'text-gray-700 font-medium group-hover:text-surface-raised'}`}>
                                                {item.title}
                                              </div>
                                              <div className="text-xs text-gray-400">{item.duration}</div>
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>

          {/* CỘT PHẢI: TRÌNH PHÁT VIDEO & NỘI DUNG */}
          <main className="w-full flex-1 flex flex-col gap-6">
            
            {/* Khu vực phát Media */}
            <div className="bg-black w-full rounded-xl shadow-lg overflow-hidden aspect-video flex items-center justify-center border border-gray-800 relative">
              {!activeLesson ? (
                // Chưa chọn bài học
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PlayCircle size={40} className="text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Bắt đầu học ngay!</h2>
                  <p className="text-gray-400">Hãy chọn một ngày học và click vào video bên danh sách để xem nội dung học thử.</p>
                </div>
              ) : activeLesson.type === 'video' && activeLesson.videoUrl ? (
                // Đã chọn Video -> Render iframe YouTube
                <iframe 
                  className="w-full h-full"
                  src={`${activeLesson.videoUrl}?autoplay=1&rel=0`}
                  title={activeLesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                // Đã chọn Quiz/Audio/AI nhưng mock data chưa có URL
                <div className="text-center p-8 bg-gray-900 w-full h-full flex flex-col items-center justify-center">
                  <FileText size={48} className="text-gray-500 mb-4" />
                  <h3 className="text-xl text-white font-bold">{activeLesson.title}</h3>
                  <p className="text-gray-400 mt-2">Dạng bài tập này sẽ được hiển thị ở màn hình làm bài riêng.</p>
                </div>
              )}
            </div>

            {/* Thông tin mô tả bên dưới Video */}
            <div className="bg-white p-6 md:p-8 rounded-xl border border-border-default shadow-sm text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                {activeLesson ? activeLesson.title : "Giới thiệu tổng quan lộ trình"}
              </h2>

              <div className="space-y-6">
                <div className="bg-blue-50/50 p-5 rounded-lg border border-blue-100">
                  <h4 className="font-bold text-surface-raised flex items-center gap-2 mb-3 text-lg">
                    <CheckCircle2 size={20}/> Nội dung học Starters:
                  </h4>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    <li>Độ tuổi phù hợp: Trên 5 tuổi (khi con đã nhận diện được mặt chữ).</li>
                    <li>Thời lượng học: 360 ngày, mỗi ngày 20-30 phút.</li>
                    <li>Nội dung đa dạng: Video từ vựng theo chủ điểm, ngữ pháp, đi sâu hơn về phonics, luyện tập thuyết trình và Quiz.</li>
                    <li>Tính năng đặc biệt: Các bài quay video Speaking được chấm và chữa lỗi phát âm bằng AI.</li>
                  </ul>
                </div>
                
                <div className="bg-orange-50/50 p-5 rounded-lg border border-orange-100">
                  <h4 className="font-bold text-orange-600 flex items-center gap-2 mb-2 text-lg">
                    ⚠️ Lưu ý quan trọng:
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    Trình độ phù hợp: Bé đã có phản xạ nghe nói một số câu cơ bản và nhớ được cách phát âm của bảng chữ cái Tiếng Anh + bắt đầu biết ghép chữ cơ bản. Nếu chưa đáp ứng, hãy học các gói level thấp hơn trước. Lộ trình học từ cơ bản đến nâng cao, bài học mở dần hàng ngày để đảm bảo chất lượng tiếp thu.
                  </p>
                </div>

                <div className="pt-4 text-center">
                  <button onClick={handleBuy} className="w-full md:w-auto px-10 py-4 bg-green-600 text-white rounded-lg font-bold shadow-md hover:bg-green-700 transition-colors text-lg">
                    Mua để mở khóa toàn bộ 360 ngày học
                  </button>
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
};