import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, PlayCircle, FileText, Eye, ArrowLeft, Headphones, CheckCircle2, Mic, ScanLine, Edit3, X } from 'lucide-react';
import { toast } from 'react-toastify';

const getMockCourseData = (id) => ({
  _id: id,
  title: `Khóa học mẫu Trải Nghiệm (ID: ${id})`,
  description: "Đây là dữ liệu mẫu để bạn trải nghiệm thử toàn bộ 8 loại bài tập của Tự Học Vui mà không cần tạo data thật.",
  price: 0,
  views: 9999,
  tag: "Tiếng Anh - Trải Nghiệm",
  chapters: [
    {
      _id: `chap-1`,
      title: `Ngày 1: Khám phá vương quốc từ vựng`,
      sections: [
        {
          _id: `sec-1-1`,
          title: "Unit 1: The Zoo",
          lessons: [
            { 
              _id: `les-1-1`, type: "youtube", title: "Video: Học từ vựng chủ đề Động Vật", contentUrl: "https://www.youtube.com/watch?v=5mGUXKcE61c", duration: 5,
              exercises: [
                { type: 'multiple_choice', question: 'Con chó trong tiếng Anh là gì?', options: ['Cat', 'Dog', 'Bird', 'Fish'], correctAnswer: 'Dog', points: 10 },
                { type: 'fill_blank', question: 'I have a pet ___. It says meow.', options: ['cat', 'dog', 'cow', 'pig'], correctAnswer: 'cat', points: 10 },
                { type: 'fill_blank', question: 'A big animal with a trunk is an ___.', options: [], correctAnswer: 'elephant', points: 10 },
                { type: 'matching', question: 'Nối từ tiếng Anh với nghĩa tiếng Việt', options: ['Dog|Con chó', 'Cat|Con mèo', 'Elephant|Con voi', 'Bird|Con chim'], points: 20 },
                { type: 'flashcard', question: 'Lion', correctAnswer: 'Con sư tử', contentUrl: 'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=400', points: 10 }
              ]
            },
            { 
              _id: `les-1-2`, type: "document", title: "Tài liệu & Luyện Nghe, Nói", duration: 15,
              exercises: [
                { type: 'speaking', question: 'Hello, how are you today?', points: 10 },
                { type: 'listening', question: 'Nghe đoạn ghi âm và điền từ vào chỗ trống', contentUrl: '', correctAnswer: 'Apple', points: 10 },
                { type: 'vocab', question: 'Dinosaur', correctAnswer: 'Khủng long', contentUrl: 'https://images.unsplash.com/photo-1518022525094-71848f7642bb?w=400', points: 5 },
                { type: 'essay', question: 'Viết 2-3 câu giới thiệu về con vật yêu thích của em bằng Tiếng Anh.', points: 30 }
              ]
            }
          ]
        }
      ]
    }
  ]
});

// --- COMPONENT: TƯƠNG TÁC NỐI TỪ (MATCHING) ---
const InteractiveMatching = ({ options }) => {
  const [leftItems] = useState(() => options.map(o => o.split('|')[0]).filter(Boolean));
  const [rightItems] = useState(() => {
    const rights = options.map(o => o.split('|')[1]).filter(Boolean);
    return [...rights].sort(() => Math.random() - 0.5); // Shuffle right column
  });

  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [pairs, setPairs] = useState([]);

  useEffect(() => {
    if (selectedLeft !== null && selectedRight !== null) {
      setPairs(prev => [...prev, { left: selectedLeft, right: selectedRight }]);
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  }, [selectedLeft, selectedRight]);

  const removePair = (pairToRemove) => setPairs(pairs.filter(p => p !== pairToRemove));

  return (
    <div>
      <div className="flex justify-between gap-6 max-w-2xl mx-auto relative mb-8">
        <div className="flex flex-col gap-3 w-1/2">
          {leftItems.map((item, i) => {
            const isPaired = pairs.some(p => p.left === item);
            if (isPaired) return <div key={`l-${i}`} className="p-3 bg-gray-100 border-2 border-dashed rounded-xl text-center text-gray-400 opacity-50 select-none">{item}</div>;
            return (
              <button 
                key={`l-${i}`} onClick={() => setSelectedLeft(selectedLeft === item ? null : item)}
                className={`p-3 border-2 rounded-xl text-center font-bold shadow-sm transition-colors ${selectedLeft === item ? 'bg-blue-500 text-white border-blue-600 scale-105' : 'bg-white text-slate-700 hover:border-blue-400'}`}
              >{item}</button>
            );
          })}
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20"><ScanLine size={40}/></div>
        
        <div className="flex flex-col gap-3 w-1/2">
          {rightItems.map((item, i) => {
            const isPaired = pairs.some(p => p.right === item);
            if (isPaired) return <div key={`r-${i}`} className="p-3 bg-gray-100 border-2 border-dashed rounded-xl text-center text-gray-400 opacity-50 select-none">{item}</div>;
            return (
              <button 
                key={`r-${i}`} onClick={() => setSelectedRight(selectedRight === item ? null : item)}
                className={`p-3 border-2 rounded-xl text-center font-bold shadow-sm transition-colors ${selectedRight === item ? 'bg-green-500 text-white border-green-600 scale-105' : 'bg-blue-50 border-blue-100 text-blue-700 hover:border-blue-400'}`}
              >{item}</button>
            );
          })}
        </div>
      </div>

      {pairs.length > 0 && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Các cặp đã ghép (Bấm để hủy):</h5>
          <div className="flex flex-wrap gap-3">
            {pairs.map((p, i) => (
              <button key={i} onClick={() => removePair(p)} className="flex items-center gap-2 bg-white border-2 border-indigo-200 text-indigo-700 font-bold px-4 py-2 rounded-full shadow-sm hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors group">
                <span>{p.left}</span> <ScanLine size={14} className="text-indigo-300" /> <span>{p.right}</span>
                <X size={14} className="ml-1 opacity-0 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- COMPONENT: TƯƠNG TÁC LẬT THẺ (FLASHCARD) ---
const InteractiveFlashcard = ({ item }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="w-64 h-80 perspective-1000 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`w-full h-full relative transition-all duration-500 transform-style-3d shadow-lg rounded-2xl ${isFlipped ? 'rotate-y-180' : 'group-hover:shadow-xl group-hover:-translate-y-1'}`}>
          <div className="absolute inset-0 backface-hidden bg-white border-2 border-blue-200 rounded-2xl flex flex-col items-center justify-center p-4">
            {item.contentUrl && <img src={item.contentUrl} alt="vocab" className="w-32 h-32 object-cover rounded-xl mb-4 shadow-sm" />}
            <h3 className="text-3xl font-bold text-blue-600 text-center">{item.question}</h3>
            <p className="text-xs font-bold text-slate-400 mt-6 uppercase bg-slate-100 px-3 py-1 rounded-full animate-pulse">Bấm để lật thẻ</p>
          </div>
          <div className="absolute inset-0 backface-hidden bg-blue-500 text-white rounded-2xl flex flex-col items-center justify-center p-6 rotate-y-180">
            <h3 className="text-4xl font-bold text-center leading-tight">{item.correctAnswer}</h3>
            <p className="text-xs font-bold text-blue-200 mt-8 uppercase">Bấm để quay lại</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [courseData, setCourseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [expandedChapters, setExpandedChapters] = useState([]); 
  const [expandedSections, setExpandedSections] = useState([]); 
  const [activeLesson, setActiveLesson] = useState(null);

  // AUTO SCROLL KHI VÀO TRANG HOẶC CHUYỂN BÀI HỌC
  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setIsLoading(true);
        const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(id);
        let data = null;

        if (!isValidMongoId) {
          data = getMockCourseData(id);
          await new Promise(resolve => setTimeout(resolve, 300)); 
        } else {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const response = await fetch(`${API_URL}/api/courses/${id}`); 
          if (!response.ok) throw new Error('Không thể tải thông tin khóa học');
          data = await response.json();
        }
        
        setCourseData(data);
        
        if (data?.chapters?.length > 0) {
          setExpandedChapters([data.chapters[0]._id]);
          if (data.chapters[0].sections?.length > 0) {
            setExpandedSections([data.chapters[0].sections[0]._id]);
            if (data.chapters[0].sections[0].lessons?.length > 0) {
              setActiveLesson(data.chapters[0].sections[0].lessons[0]);
            }
          }
        }
      } catch (error) { toast.error('Lỗi khi tải dữ liệu khóa học!'); } 
      finally { setIsLoading(false); }
    };
    if (id) fetchCourseDetail();
  }, [id]);

  const toggleArray = (arr, setArr, itemId) => {
    setArr(prev => prev.includes(itemId) ? prev.filter(item => item !== itemId) : [...prev, itemId]);
  };

  const renderMedia = () => {
    if (!activeLesson) return null;
    const { type, contentUrl, title } = activeLesson;

    if (type === 'youtube') {
      let embedUrl = contentUrl || '';
      if (embedUrl.includes('watch?v=')) embedUrl = embedUrl.replace('watch?v=', 'embed/').split('&')[0];
      return <iframe className="w-full h-full" src={`${embedUrl}?autoplay=1&rel=0`} title={title} frameBorder="0" allowFullScreen></iframe>;
    }
    if (type === 'video_upload') {
      return <video controls autoPlay className="w-full h-full bg-black outline-none"><source src={contentUrl} type="video/mp4" /></video>;
    }
    if (type === 'image') {
      return <img src={contentUrl} alt={title} className="w-full h-full object-contain bg-gray-900" />;
    }
    return (
      <div className="text-center p-8 bg-gray-900 w-full h-full flex flex-col items-center justify-center">
        <FileText size={48} className="text-blue-500 mb-4 animate-bounce" />
        <h3 className="text-xl text-white font-bold">{title}</h3>
        <p className="text-gray-400 mt-2">Đọc tài liệu và hoàn thành bài tập phía dưới 👇</p>
        {contentUrl && <a href={contentUrl} target="_blank" rel="noreferrer" className="mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Mở tài liệu (PDF)</a>}
      </div>
    );
  };

  const renderStudentExercise = (ex, index) => {
    const isMultipleChoiceFillBlank = ex.type === 'fill_blank' && ex.options && ex.options.length > 0;

    return (
      <div key={index} className="bg-white border-2 border-slate-100 rounded-2xl p-6 shadow-sm mb-6 hover:border-blue-200 transition-colors">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <span className="font-bold text-slate-500 text-sm tracking-wider uppercase">Bài tập {index + 1}</span>
          <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">{ex.points} điểm</span>
        </div>

        {ex.type === 'multiple_choice' && (
          <div>
            <h4 className="text-lg font-bold text-slate-800 mb-4">{ex.question}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ex.options.map((opt, i) => (
                <label key={i} className="flex items-center gap-3 p-4 border-2 border-slate-100 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all">
                  <input type="radio" name={`q-${index}`} className="w-5 h-5 text-blue-600 accent-blue-600" />
                  <span className="font-bold text-slate-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {ex.type === 'fill_blank' && (
          <div>
            <h4 className="text-lg font-bold text-slate-800 mb-6 leading-relaxed flex flex-wrap items-center">
              {ex.question.split('___').map((part, i, arr) => (
                <React.Fragment key={i}>
                  <span className="mr-2">{part}</span>
                  {i !== arr.length - 1 && (
                    <input type="text" className="mx-1 w-32 border-b-2 border-slate-300 bg-slate-50 text-center text-blue-600 font-bold outline-none focus:border-blue-500 focus:bg-blue-50 transition-colors py-1" placeholder="Nhập từ..." />
                  )}
                </React.Fragment>
              ))}
            </h4>

            {/* Nếu giáo viên cấu hình Trắc nghiệm cho bài điền từ */}
            {isMultipleChoiceFillBlank && (
              <div className="mt-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-3">Chọn 1 từ để điền vào chỗ trống:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {ex.options.map((opt, i) => (
                    <label key={i} className="flex items-center justify-center gap-2 p-3 bg-white border-2 border-blue-100 rounded-lg cursor-pointer hover:border-blue-400 hover:shadow-sm transition-all text-center">
                      <input type="radio" name={`fb-${index}`} className="hidden peer" />
                      <span className="font-bold text-slate-700 peer-checked:text-blue-600">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {ex.type === 'speaking' && (
          <div className="text-center py-8">
            <h4 className="text-2xl font-bold text-blue-600 mb-8">"{ex.question}"</h4>
            <button className="bg-rose-500 text-white w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:bg-rose-600 hover:scale-110 transition-all animate-pulse outline-none">
              <Mic size={36} />
            </button>
            <p className="text-sm font-bold text-slate-400 mt-6 uppercase tracking-widest">Bấm vào Mic để bắt đầu đọc</p>
          </div>
        )}

        {ex.type === 'listening' && (
          <div>
            <h4 className="text-lg font-bold text-slate-800 mb-6">{ex.question}</h4>
            <div className="bg-slate-50 rounded-full p-2 mb-6 flex items-center gap-4 max-w-md border-2 border-slate-100 shadow-inner">
              <button className="w-12 h-12 bg-blue-500 hover:bg-blue-600 transition-colors rounded-full flex items-center justify-center text-white"><PlayCircle size={24} /></button>
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden"><div className="w-1/4 h-full bg-blue-500 rounded-full"></div></div>
              <span className="text-xs font-bold text-slate-400 pr-4">0:00</span>
            </div>
            <input type="text" className="w-full p-4 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-400 font-bold text-slate-700 bg-slate-50 focus:bg-white transition-colors" placeholder="Nhập câu trả lời mà bạn nghe được..." />
          </div>
        )}

        {ex.type === 'matching' && (
          <div>
            <h4 className="text-lg font-bold text-slate-800 mb-6">{ex.question}</h4>
            <InteractiveMatching options={ex.options} />
          </div>
        )}

        {(ex.type === 'flashcard' || ex.type === 'vocab') && (
          <InteractiveFlashcard item={ex} />
        )}

        {ex.type === 'essay' && (
          <div>
            <h4 className="text-lg font-bold text-slate-800 mb-4"><Edit3 size={20} className="inline mr-2 text-blue-500 -mt-1" />{ex.question}</h4>
            <textarea className="w-full p-4 border-2 border-slate-200 bg-slate-50 rounded-xl outline-none focus:border-blue-400 focus:bg-white resize-y font-medium text-slate-700 transition-colors min-h-[150px]" placeholder="Bắt đầu viết bài tự luận của bạn tại đây..."></textarea>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-white border-b mb-8 py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/lessons')} className="text-slate-500 text-sm hover:text-blue-600 mb-4 flex items-center gap-1 font-bold transition-colors"><ArrowLeft size={16} /> Quay lại danh sách</button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">{courseData?.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500">
                <span className="text-orange-500 text-lg">{!courseData?.price ? 'Miễn phí' : `${courseData?.price.toLocaleString('vi-VN')} đ`}</span>
                <span className="flex items-center gap-1"><Eye size={16}/> {courseData?.views || 0} lượt xem</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md">{courseData?.chapters?.length || 0} Ngày học</span>
              </div>
            </div>
            <button className="px-8 py-4 bg-green-500 text-white rounded-xl font-bold shadow-lg hover:bg-green-600 transition-colors whitespace-nowrap text-lg hover:-translate-y-1">Bắt đầu học ngay</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-[350px] flex-shrink-0 bg-white rounded-2xl shadow-sm border h-fit sticky top-24 max-h-[80vh] flex flex-col">
            <div className="p-5 border-b bg-slate-50 rounded-t-2xl"><h3 className="font-extrabold text-lg text-slate-800">Lộ trình học tập</h3></div>
            <div className="overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {courseData?.chapters?.map((chapter, index) => (
                <div key={chapter._id} className="border rounded-xl overflow-hidden bg-white">
                  <button onClick={() => toggleArray(expandedChapters, setExpandedChapters, chapter._id)} className="w-full flex items-center justify-between p-3 transition-colors hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-blue-100 text-blue-600">{index + 1}</div>
                      <span className="font-bold text-slate-800 text-left">{chapter.title}</span>
                    </div>
                    {expandedChapters.includes(chapter._id) ? <ChevronDown size={18} className="text-slate-400"/> : <ChevronRight size={18} className="text-slate-400"/>}
                  </button>

                  {expandedChapters.includes(chapter._id) && (
                    <div className="p-2 space-y-2 border-t bg-slate-50/50">
                      {chapter.sections?.map(section => (
                        <div key={section._id} className="border rounded-lg bg-white">
                          <button onClick={() => toggleArray(expandedSections, setExpandedSections, section._id)} className="w-full flex items-center justify-between p-3 text-sm font-bold text-orange-600 hover:bg-orange-50 rounded-t-lg">
                            <span className="text-left">{section.title}</span>
                            {expandedSections.includes(section._id) ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                          </button>

                          {expandedSections.includes(section._id) && (
                            <div className="p-2 space-y-1">
                              {section.lessons?.map(lesson => {
                                const isPlaying = activeLesson?._id === lesson._id;
                                return (
                                  <button key={lesson._id} onClick={() => {setActiveLesson(lesson); window.scrollTo({top: 0, behavior: 'smooth'});}} className={`w-full flex items-start gap-3 p-3 text-sm text-left rounded-lg transition-all ${isPlaying ? 'bg-blue-50 border-blue-200 shadow-sm' : 'hover:bg-slate-50'}`}>
                                    <PlayCircle size={18} className={`mt-0.5 ${isPlaying ? "text-blue-600" : "text-slate-400"}`}/>
                                    <div className="flex-1">
                                      <div className={`font-bold leading-tight mb-1 ${isPlaying ? 'text-blue-700' : 'text-slate-700'}`}>{lesson.title}</div>
                                      <div className="flex gap-3 text-xs font-semibold text-slate-400">
                                        {lesson.duration > 0 && <span>{lesson.duration} phút</span>}
                                        {lesson.exercises?.length > 0 && <span className="text-orange-500 bg-orange-100 px-2 py-0.5 rounded">{lesson.exercises.length} Bài tập</span>}
                                      </div>
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

          <main className="w-full flex-1 flex flex-col gap-6">
            <div className="bg-black w-full rounded-2xl shadow-xl overflow-hidden aspect-video flex items-center justify-center relative">
              {!activeLesson ? (
                <div className="text-center p-8"><div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6"><PlayCircle size={40} className="text-slate-400" /></div><h2 className="text-2xl font-bold text-white mb-2">Bắt đầu học ngay!</h2></div>
              ) : renderMedia()}
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm text-left">
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2">{activeLesson ? activeLesson.title : courseData?.title}</h2>
              <p className="text-slate-500 font-medium mb-8 pb-6 border-b">{courseData?.description || "Bấm vào nội dung bài học ở lộ trình bên trái để bắt đầu học nhé!"}</p>

              {/* KHU VỰC BÀI TẬP */}
              {activeLesson && activeLesson.exercises?.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-blue-600 mb-6 flex items-center gap-2"><CheckCircle2 size={24}/> Phần Thực Hành & Bài Tập</h3>
                  {activeLesson.exercises.map((ex, idx) => renderStudentExercise(ex, idx))}
                  <div className="text-center mt-8">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-xl shadow-lg transition-transform hover:-translate-y-1">Nộp Bài Trắc Nghiệm & Hoàn Thành</button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      
      {/* CSS 3D Transforms */}
      <style dangerouslySetColor="text/css">{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};