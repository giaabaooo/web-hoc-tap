import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, PlayCircle, FileText, CheckCircle2, Eye, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';

// --- HÀM TẠO MOCK DATA KHI KHÔNG CÓ DATA TỪ SERVER ---
// (Đã được chuyển đổi sang cấu trúc 3 cấp: Chapters -> Sections -> Lessons để dùng chung giao diện)
const getMockCourseData = (id) => ({
  _id: id,
  title: `Khóa học mẫu (Mock Data - ID: ${id})`,
  description: "Đây là dữ liệu mẫu. Dành cho các khóa học tĩnh chưa được đưa lên Database.",
  price: 0,
  views: 40868,
  tag: "Tiếng Anh - Cơ bản",
  chapters: Array.from({ length: 15 }).map((_, cIndex) => ({
    _id: `chap-${cIndex + 1}`,
    title: `Ngày ${cIndex + 1}`,
    sections: [
      {
        _id: `sec-${cIndex + 1}-1`,
        title: "Buổi 1: Từ vựng cốt lõi",
        lessons: [
          { _id: `les-${cIndex}-1`, type: "youtube", title: "Video: Hướng dẫn học lộ trình", contentUrl: "https://www.youtube.com/watch?v=5mGUXKcE61c", duration: 5 },
          { _id: `les-${cIndex}-2`, type: "youtube", title: "Video: Learn School Supplies", contentUrl: "https://www.youtube.com/watch?v=5yMWB0E5w4Y", duration: 12 },
          { _id: `les-${cIndex}-3`, type: "quiz", title: "Bài tập: Grammar Quiz", duration: 15 }
        ]
      },
      {
        _id: `sec-${cIndex + 1}-2`,
        title: "Buổi 2: Phonics & Luyện nói",
        lessons: [
          { _id: `les-${cIndex}-4`, type: "document", title: "Luyện nghe: Thực hành Phonics", duration: 8 },
          { _id: `les-${cIndex}-5`, type: "quiz", title: "Bài quay và chấm bằng AI", duration: 10 }
        ]
      }
    ]
  }))
});

export const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [courseData, setCourseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [expandedChapters, setExpandedChapters] = useState([]); 
  const [expandedSections, setExpandedSections] = useState([]); 
  const [activeLesson, setActiveLesson] = useState(null);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setIsLoading(true);

        // 1. KIỂM TRA ID: ID của MongoDB luôn là 1 chuỗi Hex dài 24 ký tự
        const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(id);

        let data = null;

        if (!isValidMongoId) {
          // NẾU LÀ MOCK ID (vd: 'mock-1', '1', '2'...) => DÙNG MOCK DATA
          console.log("Đang dùng Mock Data cho ID:", id);
          data = getMockCourseData(id);
          // Giả lập độ trễ mạng xíu cho giống thật
          await new Promise(resolve => setTimeout(resolve, 500)); 
        } else {
          // NẾU LÀ MONGO ID THẬT => FETCH TỪ BACKEND
          console.log("Đang fetch Data thật cho ID:", id);
          const response = await fetch(`http://localhost:5000/api/courses/${id}`); 
          
          if (!response.ok) {
            throw new Error('Không thể tải thông tin khóa học');
          }
          data = await response.json();
        }
        
        // 2. SET DATA VÀ TỰ ĐỘNG MỞ BÀI ĐẦU TIÊN
        setCourseData(data);
        
        if (data && data.chapters && data.chapters.length > 0) {
          setExpandedChapters([data.chapters[0]._id]);
          if (data.chapters[0].sections && data.chapters[0].sections.length > 0) {
            setExpandedSections([data.chapters[0].sections[0]._id]);
            if (data.chapters[0].sections[0].lessons && data.chapters[0].sections[0].lessons.length > 0) {
              setActiveLesson(data.chapters[0].sections[0].lessons[0]);
            }
          }
        }
      } catch (error) {
        console.error(error);
        toast.error('Lỗi khi tải dữ liệu khóa học!');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCourseDetail();
    }
  }, [id]);

  const toggleArray = (arr, setArr, itemId) => {
    setArr(prev => prev.includes(itemId) ? prev.filter(item => item !== itemId) : [...prev, itemId]);
  };

  const handleBuy = () => {
    toast.success('Đang chuyển hướng đến trang thanh toán...');
  };

  const handleItemClick = (lesson) => {
    setActiveLesson(lesson);
  };

  const renderMedia = () => {
    if (!activeLesson) return null;

    const { type, contentUrl, title } = activeLesson;

    if (type === 'youtube') {
      let embedUrl = contentUrl || '';
      if (embedUrl.includes('watch?v=')) {
        embedUrl = embedUrl.replace('watch?v=', 'embed/').split('&')[0];
      }
      return (
        <iframe 
          className="w-full h-full"
          src={`${embedUrl}?autoplay=1&rel=0`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      );
    }

    if (type === 'video_upload') {
      return (
        <video controls autoPlay className="w-full h-full bg-black outline-none">
          <source src={contentUrl} type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ thẻ video.
        </video>
      );
    }

    if (type === 'image') {
      return <img src={contentUrl} alt={title} className="w-full h-full object-contain bg-gray-900" />;
    }

    return (
      <div className="text-center p-8 bg-gray-900 w-full h-full flex flex-col items-center justify-center">
        <FileText size={48} className="text-gray-500 mb-4" />
        <h3 className="text-xl text-white font-bold">{title}</h3>
        <p className="text-gray-400 mt-2">
          {type === 'quiz' ? 'Dạng bài tập trắc nghiệm sẽ hiển thị ở đây.' : 'Tài liệu để đọc.'}
        </p>
        {contentUrl && (
          <a href={contentUrl} target="_blank" rel="noreferrer" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Mở liên kết
          </a>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-strong">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-strong">
        <p className="text-red-500 font-bold text-xl mb-4">Không tìm thấy khóa học này!</p>
        <button onClick={() => navigate('/lessons')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="bg-surface-strong min-h-screen pb-12">
      <div className="bg-white border-b border-border-default mb-8 py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/lessons')} className="text-text-tertiary text-sm hover:text-surface-raised mb-4 flex items-center gap-1 font-medium transition-colors">
            <ArrowLeft size={16} /> Quay lại danh sách
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">{courseData.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-tertiary font-medium">
                <span className="flex items-center gap-1.5 text-orange-500 font-semibold">
                  {courseData.price === 0 ? 'Miễn phí' : `${courseData.price?.toLocaleString()} VNĐ`}
                </span>
                <span className="flex items-center gap-1.5"><Eye size={16} className="text-surface-raised"/> {courseData.views || 0}</span>
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
          
          {/* CỘT TRÁI: ACCORDION 3 CẤP */}
          <aside className="w-full lg:w-[400px] flex-shrink-0 bg-white rounded-xl shadow border border-border-default h-fit sticky top-24 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-lg text-text-primary">Nội dung học</h3>
              <span className="text-sm font-medium text-text-tertiary">{courseData.chapters?.length || 0} chương</span>
            </div>

            <div className="overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {courseData.chapters?.map((chapter, index) => (
                <div key={chapter._id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  
                  <button 
                    onClick={() => toggleArray(expandedChapters, setExpandedChapters, chapter._id)}
                    className={`w-full flex items-center justify-between p-3 transition-colors ${expandedChapters.includes(chapter._id) ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-surface-raised text-white shadow-sm">
                        {index + 1}
                      </div>
                      <span className="font-bold text-gray-900 text-left">{chapter.title}</span>
                    </div>
                    {expandedChapters.includes(chapter._id) ? <ChevronDown size={18} className="text-gray-400"/> : <ChevronRight size={18} className="text-gray-400"/>}
                  </button>

                  {expandedChapters.includes(chapter._id) && (
                    <div className="p-2 bg-white space-y-2 border-t border-gray-100">
                      {chapter.sections?.map(section => (
                        <div key={section._id} className="border border-gray-200 rounded-md">
                          <button 
                            onClick={() => toggleArray(expandedSections, setExpandedSections, section._id)}
                            className="w-full flex items-center justify-between p-2.5 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-t-md"
                          >
                            <span className="text-red-500 text-left">{section.title}</span>
                            {expandedSections.includes(section._id) ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                          </button>

                          {expandedSections.includes(section._id) && (
                            <div className="p-2 space-y-1 bg-white rounded-b-md">
                              {section.lessons?.map(lesson => {
                                const isPlaying = activeLesson?._id === lesson._id;
                                return (
                                  <button 
                                    key={lesson._id}
                                    onClick={() => handleItemClick(lesson)}
                                    className={`w-full flex items-center gap-3 p-2.5 text-sm text-left rounded-md group transition-all ${
                                      isPlaying 
                                        ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                                        : 'hover:bg-gray-50 border border-transparent'
                                    }`}
                                  >
                                    {(lesson.type === 'video_upload' || lesson.type === 'youtube') && <PlayCircle size={18} className={isPlaying ? "text-surface-raised" : "text-gray-400 group-hover:text-surface-raised"}/>}
                                    {lesson.type === 'quiz' && <CheckCircle2 size={18} className={isPlaying ? "text-purple-500" : "text-gray-400 group-hover:text-purple-500"}/>}
                                    {lesson.type === 'document' && <FileText size={18} className={isPlaying ? "text-green-500" : "text-gray-400 group-hover:text-green-500"}/>}
                                    {lesson.type === 'image' && <ImageIcon size={18} className={isPlaying ? "text-orange-500" : "text-gray-400 group-hover:text-orange-500"}/>}
                                    
                                    <div className="flex-1">
                                      <div className={`line-clamp-2 leading-tight mb-0.5 ${isPlaying ? 'text-surface-raised font-bold' : 'text-gray-700 font-medium group-hover:text-surface-raised'}`}>
                                        {lesson.title}
                                      </div>
                                      {lesson.duration > 0 && (
                                        <div className="text-xs text-gray-400">{lesson.duration} phút</div>
                                      )}
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
          </aside>

          {/* CỘT PHẢI: TRÌNH PHÁT VIDEO & NỘI DUNG */}
          <main className="w-full flex-1 flex flex-col gap-6">
            <div className="bg-black w-full rounded-xl shadow-lg overflow-hidden aspect-video flex items-center justify-center border border-gray-800 relative">
              {!activeLesson ? (
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PlayCircle size={40} className="text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Bắt đầu học ngay!</h2>
                  <p className="text-gray-400">Hãy chọn một chương và click vào bài học bên danh sách để xem.</p>
                </div>
              ) : (
                renderMedia()
              )}
            </div>

            <div className="bg-white p-6 md:p-8 rounded-xl border border-border-default shadow-sm text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">
                {activeLesson ? activeLesson.title : "Giới thiệu tổng quan"}
              </h2>

              <div className="space-y-6">
                <div className="bg-blue-50/50 p-5 rounded-lg border border-blue-100">
                  <h4 className="font-bold text-surface-raised flex items-center gap-2 mb-3 text-lg">
                    <FileText size={20}/> Mô tả khóa học:
                  </h4>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {courseData.description || "Khóa học chưa có mô tả chi tiết."}
                  </p>
                </div>

                <div className="pt-4 text-center">
                  <button onClick={handleBuy} className="w-full md:w-auto px-10 py-4 bg-green-600 text-white rounded-lg font-bold shadow-md hover:bg-green-700 transition-colors text-lg">
                    Đăng ký để học toàn bộ
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