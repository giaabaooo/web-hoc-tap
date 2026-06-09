// src/pages/CourseDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/useAuthStore';
import { ChevronDown, ChevronRight, PlayCircle, FileText, Eye, ArrowLeft, Headphones, CheckCircle2, Mic, ScanLine, Edit3, Loader2, ChevronLeft, ChevronRight as IconNext } from 'lucide-react';

// COMPONENT ĐỂ HIỂN THỊ TEXT HOẶC ẢNH Ở ĐÁP ÁN (DÙNG CHUNG)
const RenderMediaOrText = ({ content }) => {
  if (!content) return null;
  // Nếu là URL bắt đầu bằng http -> Render Ảnh, ngược lại render Text
  if (content.startsWith('http')) {
    return <img src={content} alt="Media" className="max-h-28 object-contain rounded-md shadow-sm" />;
  }
  return <span className="font-bold text-slate-700">{content}</span>;
};

// COMPONENT ĐÁNH GIÁ SPEAKING QUA AI
const InteractiveSpeaking = ({ exercise, value, onChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(value?.url || null);
  const [transcript, setTranscript] = useState(value?.transcript || "");
  const [score, setScore] = useState(value?.score || 0);
  const [attempts, setAttempts] = useState(0); 
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const speechRecognition = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      speechRecognition.current = new SpeechRecognition();
      speechRecognition.current.lang = 'en-US'; 
      speechRecognition.current.interimResults = false;
      speechRecognition.current.maxAlternatives = 1;
      
      speechRecognition.current.onresult = (event) => {
        const resultText = event.results[0][0].transcript;
        setTranscript(resultText);
        evaluateSpeech(resultText);
      };
    }
  }, []);

  const evaluateSpeech = (spokenText) => {
    const s = spokenText.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const t = exercise.correctAnswer.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    
    let calculatedScore = 0;
    if (s === t) calculatedScore = exercise.points; 
    else if (s.includes(t) || t.includes(s)) calculatedScore = Math.floor(exercise.points * 0.5); 
    
    setScore(calculatedScore);
  };

  const startRecording = async () => {
    if (attempts >= 3) return toast.warning("Bạn đã hết số lần thu âm cho câu hỏi này!");
    if (!speechRecognition.current) return toast.error("Trình duyệt không hỗ trợ chấm điểm AI. Dùng Chrome/Edge nhé!");
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      
      mediaRecorder.current.ondataavailable = (event) => { if (event.data.size > 0) audioChunks.current.push(event.data); };
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onChange({ url, transcript, score }); 
        setAttempts(prev => prev + 1); 
      };
      
      mediaRecorder.current.start();
      speechRecognition.current.start();
      setIsRecording(true);
    } catch (err) { toast.error("Không thể truy cập Microphone!"); }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      if (speechRecognition.current) speechRecognition.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const retryRecording = () => {
    if (attempts >= 3) return toast.warning("Đã đạt giới hạn 3 lần thu âm!");
    setAudioUrl(null); setTranscript(""); setScore(0); onChange(null);
  };

  useEffect(() => {
    if (audioUrl && transcript) {
      onChange({ url: audioUrl, transcript, score });
    }
  }, [transcript, score, audioUrl]);

  return (
    <div className="text-center py-8">
      <h4 className="text-2xl font-bold text-blue-600 mb-8">"{exercise.question}"</h4>
      {!audioUrl ? (
        <>
          <button onClick={isRecording ? stopRecording : startRecording} disabled={attempts >= 3 && !isRecording} className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all outline-none text-white shadow-[0_0_20px_rgba(244,63,94,0.4)] ${isRecording ? 'bg-red-600 animate-pulse scale-110' : attempts >= 3 ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-rose-500 hover:bg-rose-600 hover:scale-110'}`}>
            {isRecording ? <div className="w-8 h-8 bg-white rounded-sm"></div> : <Mic size={36} />}
          </button>
          <p className="text-sm font-bold mt-6 uppercase tracking-widest text-slate-400">{isRecording ? "Đang thu âm & AI đang nghe..." : attempts >= 3 ? "Đã hết số lần thu âm" : "Bấm vào Mic để bắt đầu đọc"}</p>
          <p className="text-xs font-medium mt-2 text-rose-500">Lượt thu âm còn lại: {3 - attempts}/3</p>
        </>
      ) : (
        <div className="flex flex-col items-center max-w-md mx-auto bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <audio src={audioUrl} controls className="w-full mb-4" />
          <div className="w-full text-left bg-white p-3 rounded-lg border mb-4 shadow-sm">
             <p className="text-xs font-bold text-gray-400 uppercase mb-1">AI Nghe được:</p>
             <p className="text-gray-800 font-medium italic">"{transcript || "Không nghe rõ..."}"</p>
             <div className={`mt-2 text-sm font-bold ${score === exercise.points ? 'text-green-600' : score > 0 ? 'text-yellow-600' : 'text-red-500'}`}>
                Điểm AI Chấm: {score} / {exercise.points}
             </div>
          </div>
          <div className="flex gap-4">
            {attempts < 3 && <button onClick={retryRecording} className="text-sm font-bold text-rose-500 bg-rose-50 px-4 py-2 rounded-xl hover:bg-rose-100 transition-colors">Thu âm lại (Còn {3 - attempts} lần)</button>}
            <div className="text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-xl">Đã lưu bản ghi âm</div>
          </div>
        </div>
      )}
    </div>
  );
};

export const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  
  const [courseData, setCourseData] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [expandedChapters, setExpandedChapters] = useState([]); 
  const [expandedSections, setExpandedSections] = useState([]); 
  const [activeLesson, setActiveLesson] = useState(null);
  
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setIsLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${API_URL}/api/courses/${id}`);
        setCourseData(response.data.course);
        if (response.data.course?.chapters?.length > 0) {
          setExpandedChapters([response.data.course.chapters[0]._id]);
          if (response.data.course.chapters[0].sections?.length > 0) {
            setExpandedSections([response.data.course.chapters[0].sections[0]._id]);
          }
        }
      } catch (error) { toast.error('Lỗi tải dữ liệu!'); } 
      finally { setIsLoading(false); }
    };
    if (id) fetchCourseDetail();
  }, [id]);

  useEffect(() => {
    const checkEnroll = async () => {
      if (token && id && user?.role !== 'teacher' && user?.role !== 'admin') {
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const res = await axios.get(`${API_URL}/api/courses/${id}/check-enrollment`, { headers: { Authorization: `Bearer ${token}` }});
          setEnrollment(res.data);
        } catch(e) { console.log(e); }
      }
    };
    checkEnroll();
  }, [id, token, user]);

  const allLessons = [];
  courseData?.chapters?.forEach(c => {
    c.sections?.forEach(s => { s.lessons?.forEach(l => { allLessons.push(l); }); });
  });

  const currentLessonIndex = allLessons.findIndex(l => l._id === activeLesson?._id);
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  const toggleArray = (arr, setArr, itemId) => {
    setArr(prev => prev.includes(itemId) ? prev.filter(item => item !== itemId) : [...prev, itemId]);
  };

  const handleEnroll = async () => {
    if (!user) return toast.info("Vui lòng đăng nhập!");
    if (user.role === 'teacher' || user.role === 'admin') return toast.error("Tài khoản giáo viên không thể tham gia khóa học!");

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/courses/${id}/enroll`, {}, { headers: { Authorization: `Bearer ${token}` }});
      setEnrollment(res.data);
      toast.success("Bắt đầu học thành công!");
      const firstLesson = courseData.chapters[0]?.sections[0]?.lessons[0];
      if (firstLesson) setActiveLesson(firstLesson);
    } catch (error) { toast.error("Lỗi ghi danh!"); }
  };

  const handleContinue = () => {
    const firstUncompleted = allLessons.find(l => !isLessonCompleted(l._id));
    if (firstUncompleted) {
      setActiveLesson(firstUncompleted);
      courseData.chapters.forEach(c => {
        c.sections.forEach(s => {
          if (s.lessons.some(les => les._id === firstUncompleted._id)) {
            if (!expandedChapters.includes(c._id)) setExpandedChapters(prev => [...prev, c._id]);
            if (!expandedSections.includes(s._id)) setExpandedSections(prev => [...prev, s._id]);
          }
        });
      });
    } else {
      setActiveLesson(allLessons[allLessons.length - 1]);
      toast.info("Đã hoàn thành toàn bộ khóa học!");
    }
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleSubmitLesson = async () => {
    if (!activeLesson) return;
    setIsSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/courses/${id}/lessons/${activeLesson._id}/submit`, { answers }, { headers: { Authorization: `Bearer ${token}` }});
      setEnrollment(res.data.enrollment);
      toast.success(activeLesson.exercises?.length > 0 ? `Lưu bài thành công! Bạn đạt ${res.data.score} điểm.` : "Hoàn thành bài học!");
    } catch (error) { toast.error("Lỗi nộp bài!"); } 
    finally { setIsSubmitting(false); }
  };

  const isLessonCompleted = (lessonId) => enrollment?.progress?.some(p => p.lessonId === lessonId);
  
  const formatTime = (lesson) => {
    let totalMins = 5 + (lesson.exercises?.length || 0) * 2; 
    if (totalMins >= 60) return `${Math.floor(totalMins / 60)}h${totalMins % 60 > 0 ? totalMins % 60 + 'p' : ''}`;
    return `${totalMins}p`;
  };

  const loadPreviousAnswers = (lesson) => {
    setActiveLesson(lesson);
    const progress = enrollment?.progress?.find(p => p.lessonId === lesson._id);
    if (progress && progress.answers) setAnswers(progress.answers);
    else setAnswers({});
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const renderMedia = () => {
    if (!activeLesson) return null;
    const { type, contentUrl, title } = activeLesson;

    if (type === 'youtube') {
      let embedUrl = contentUrl || '';
      if (embedUrl.includes('watch?v=')) embedUrl = embedUrl.replace('watch?v=', 'embed/').split('&')[0];
      return <iframe className="w-full h-full" src={`${embedUrl}?autoplay=1&rel=0`} title={title} frameBorder="0" allowFullScreen></iframe>;
    }
    if (type === 'video_upload') return <video controls autoPlay className="w-full h-full bg-black outline-none"><source src={contentUrl} type="video/mp4" /></video>;
    if (type === 'image') return <img src={contentUrl} alt={title} className="w-full h-full object-contain bg-gray-900" />;
    return (
      <div className="text-center p-8 bg-gray-900 w-full h-full flex flex-col items-center justify-center">
        <FileText size={48} className="text-blue-500 mb-4 animate-bounce" />
        <h3 className="text-xl text-white font-bold">{title}</h3>
        {contentUrl && <a href={contentUrl} target="_blank" rel="noreferrer" className="mt-4 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Mở tài liệu (PDF)</a>}
      </div>
    );
  };

  const renderStudentExercise = (ex, index) => {
    return (
      <div key={index} className="bg-white border-2 border-slate-100 rounded-2xl p-6 shadow-sm mb-6 hover:border-blue-200 transition-colors">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <span className="font-bold text-slate-500 text-sm tracking-wider uppercase">Bài tập {index + 1}</span>
          <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">{ex.points} điểm</span>
        </div>
        {ex.instruction && <p className="text-sm font-medium text-gray-600 mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r">{ex.instruction}</p>}

        {ex.type === 'multiple_choice' && (
          <div>
            <h4 className="text-lg font-bold text-slate-800 mb-4">{ex.question}</h4>
            {ex.contentUrl && <RenderMediaOrText content={ex.contentUrl} />}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {ex.options.map((opt, i) => (
                <label key={i} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${answers[ex._id] === opt ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:bg-blue-50'}`}>
                  <input type="radio" name={`q-${ex._id}`} value={opt} checked={answers[ex._id] === opt} onChange={(e) => setAnswers(prev => ({...prev, [ex._id]: e.target.value}))} className="w-5 h-5 text-blue-600 accent-blue-600 flex-shrink-0" />
                  <RenderMediaOrText content={opt} />
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
                    <input type="text" value={answers[ex._id] || ''} onChange={(e) => setAnswers(prev => ({...prev, [ex._id]: e.target.value}))} className="mx-1 w-32 border-b-2 border-slate-300 bg-slate-50 text-center text-blue-600 font-bold outline-none focus:border-blue-500 py-1" placeholder="Nhập từ..." />
                  )}
                </React.Fragment>
              ))}
            </h4>
          </div>
        )}

        {ex.type === 'speaking' && <InteractiveSpeaking exercise={ex} value={answers[ex._id]} onChange={(val) => setAnswers(prev => ({...prev, [ex._id]: val}))} />}

        {ex.type === 'listening' && (
          <div>
            <h4 className="text-lg font-bold text-slate-800 mb-6">{ex.question}</h4>
            {ex.contentUrl && (
              <div className="bg-slate-50 rounded-full p-2 mb-6 max-w-md border-2 border-slate-100 shadow-inner">
                 <audio src={`${ex.contentUrl}${ex.endTime ? `#t=${ex.startTime || 0},${ex.endTime}` : ''}`} controls className="w-full outline-none" />
              </div>
            )}
            <input type="text" value={answers[ex._id] || ''} onChange={(e) => setAnswers(prev => ({...prev, [ex._id]: e.target.value}))} className="w-full p-4 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-400 font-bold text-slate-700 bg-slate-50" placeholder="Nhập câu trả lời..." />
          </div>
        )}

        {ex.type === 'matching' && (
          <div>
            <h4 className="text-lg font-bold text-slate-800 mb-6">{ex.question}</h4>
            <div className="space-y-4">
               {ex.options.map((opt, i) => {
                 const parts = opt.split('|');
                 return (
                   <div key={i} className="flex flex-col md:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                     <div className="flex-1 flex justify-center w-full"><RenderMediaOrText content={parts[0]} /></div>
                     <ScanLine size={24} className="text-blue-400 rotate-90 md:rotate-0 flex-shrink-0" />
                     <div className="flex-1 w-full text-center">
                        <input type="text" value={answers[`${ex._id}-${i}`] || ''} onChange={(e) => setAnswers(prev => ({...prev, [`${ex._id}-${i}`]: e.target.value}))} placeholder="Nhập đáp án nối với cột A..." className="w-full p-3 border rounded-lg outline-none focus:border-blue-400 text-center font-medium" />
                     </div>
                   </div>
                 )
               })}
            </div>
          </div>
        )}

        {(ex.type === 'flashcard' || ex.type === 'vocab') && (
           <div className="flex flex-col items-center justify-center p-8 bg-blue-50 border-2 border-blue-200 rounded-2xl">
              <h3 className="text-3xl font-extrabold text-blue-700 mb-6 text-center">{ex.question}</h3>
              <div className="w-full max-w-sm bg-white p-4 rounded-xl shadow-sm border text-center flex justify-center items-center min-h-[120px]">
                 <RenderMediaOrText content={ex.correctAnswer} />
              </div>
           </div>
        )}

        {ex.type === 'essay' && (
          <div>
            <h4 className="text-lg font-bold text-slate-800 mb-4"><Edit3 size={20} className="inline mr-2 text-blue-500 -mt-1" />{ex.question}</h4>
            <textarea value={answers[ex._id] || ''} onChange={(e) => setAnswers(prev => ({...prev, [ex._id]: e.target.value}))} className="w-full p-4 border-2 border-slate-200 bg-slate-50 rounded-xl outline-none min-h-[150px]" placeholder="Bắt đầu viết tự luận..." />
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
          <button onClick={() => navigate('/lessons')} className="text-slate-500 text-sm hover:text-blue-600 mb-4 flex items-center gap-1 font-bold transition-colors"><ArrowLeft size={16} /> Quay lại</button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">{courseData?.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-500">
                <span className="text-orange-500 text-lg">{!courseData?.price ? 'Miễn phí' : `${courseData?.price.toLocaleString('vi-VN')} đ`}</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md">{courseData?.chapters?.length || 0} Ngày học</span>
              </div>
            </div>
            {!enrollment ? (
              user?.role === 'teacher' || user?.role === 'admin' ? (
                <div className="px-8 py-4 bg-gray-100 text-gray-500 border border-gray-200 rounded-xl font-bold shadow-sm">Chế độ xem trước của Giáo viên</div>
              ) : (
                <button onClick={handleEnroll} className="px-8 py-4 bg-green-500 text-white rounded-xl font-bold shadow-lg hover:bg-green-600 transition-transform hover:-translate-y-1">Bắt đầu học ngay</button>
              )
            ) : (
              <button onClick={handleContinue} className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-transform hover:-translate-y-1">Tiếp tục học</button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-[350px] flex-shrink-0 bg-white rounded-2xl shadow-sm border h-fit sticky top-24 max-h-[80vh] flex flex-col">
            <div className="p-5 border-b bg-slate-50 rounded-t-2xl"><h3 className="font-extrabold text-lg text-slate-800">Lộ trình học tập</h3></div>
            <div className="overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {!enrollment && user?.role !== 'teacher' && user?.role !== 'admin' ? (
                <div className="p-6 text-center text-slate-500 text-sm font-medium">Bấm Bắt đầu học để xem chi tiết.</div>
              ) : (
                courseData?.chapters?.map((chapter, index) => (
                  <div key={chapter._id} className="border rounded-xl overflow-hidden bg-white">
                    <button onClick={() => toggleArray(expandedChapters, setExpandedChapters, chapter._id)} className="w-full flex items-center justify-between p-3 transition-colors hover:bg-slate-50">
                      <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-blue-100 text-blue-600">{index + 1}</div><span className="font-bold text-slate-800 text-left">{chapter.title}</span></div>
                      {expandedChapters.includes(chapter._id) ? <ChevronDown size={18} className="text-slate-400"/> : <ChevronRight size={18} className="text-slate-400"/>}
                    </button>
                    {expandedChapters.includes(chapter._id) && (
                      <div className="p-2 space-y-2 border-t bg-slate-50/50">
                        {chapter.sections?.map(section => (
                          <div key={section._id} className="border rounded-lg bg-white">
                            <button onClick={() => toggleArray(expandedSections, setExpandedSections, section._id)} className="w-full flex items-center justify-between p-3 text-sm font-bold text-orange-600 hover:bg-orange-50 rounded-t-lg">
                              <span className="text-left">{section.title}</span>{expandedSections.includes(section._id) ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                            </button>
                            {expandedSections.includes(section._id) && (
                              <div className="p-2 space-y-1">
                                {section.lessons?.map(lesson => {
                                  const isPlaying = activeLesson?._id === lesson._id;
                                  const completed = isLessonCompleted(lesson._id);
                                  const progress = enrollment?.progress?.find(p => p.lessonId === lesson._id);
                                  const maxPoints = lesson.exercises?.reduce((sum, ex) => sum + (ex.points || 0), 0) || 0;
                                  
                                  return (
                                    <button key={lesson._id} onClick={() => loadPreviousAnswers(lesson)} className={`w-full flex items-start gap-3 p-3 text-sm text-left rounded-lg transition-all ${isPlaying ? 'bg-blue-50 border-blue-200 shadow-sm' : 'hover:bg-slate-50'}`}>
                                      {completed ? <CheckCircle2 size={18} className="mt-0.5 text-blue-500" /> : <PlayCircle size={18} className={`mt-0.5 ${isPlaying ? "text-blue-600" : "text-slate-400"}`}/>}
                                      <div className="flex-1">
                                        <div className={`font-bold leading-tight mb-1 ${isPlaying ? 'text-blue-700' : 'text-slate-700'}`}>{lesson.title}</div>
                                        <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
                                          <span>{formatTime(lesson)}</span>
                                          {lesson.exercises?.length > 0 && <span className="text-orange-500 bg-orange-100 px-2 py-0.5 rounded">{lesson.exercises.length} Bài tập</span>}
                                          {completed && maxPoints > 0 && (
                                            <span className="text-red-500 font-extrabold text-sm ml-auto">{progress?.score}/{maxPoints}</span>
                                          )}
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
                ))
              )}
            </div>
          </aside>

          <main className="w-full flex-1 flex flex-col gap-6">
            <div className="bg-black w-full rounded-2xl shadow-xl overflow-hidden aspect-video flex items-center justify-center relative">
              {!activeLesson ? (<div className="text-center p-8"><h2 className="text-2xl font-bold text-white mb-2">Bắt đầu học ngay!</h2></div>) : renderMedia()}
            </div>
            <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm text-left">
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2">{activeLesson ? activeLesson.title : courseData?.title}</h2>
              <p className="text-slate-500 font-medium mb-8 pb-6 border-b">{courseData?.description}</p>
              {activeLesson && (
                <div>
                  {activeLesson.exercises?.length > 0 && (
                    <><h3 className="text-xl font-bold text-blue-600 mb-6 flex items-center gap-2"><CheckCircle2 size={24}/> Phần Thực Hành & Bài Tập</h3>
                      {activeLesson.exercises.map((ex, idx) => renderStudentExercise(ex, idx))}</>
                  )}
                  <div className="mt-10 border-t pt-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      {prevLesson ? <button onClick={() => loadPreviousAnswers(prevLesson)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold px-4 py-2"><ChevronLeft size={20}/> Bài trước</button> : <div></div>}
                      
                      {user?.role !== 'teacher' && user?.role !== 'admin' ? (
                        <button onClick={handleSubmitLesson} disabled={isSubmitting} className={`font-bold py-4 px-10 rounded-xl shadow-lg transition-transform hover:-translate-y-1 disabled:opacity-50 flex items-center gap-2 w-full md:w-auto ${isLessonCompleted(activeLesson._id) ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                          {isSubmitting ? <Loader2 className="animate-spin" size={24}/> : <CheckCircle2 size={24}/>}
                          {isSubmitting ? "Đang xử lý..." : isLessonCompleted(activeLesson._id) ? "Cập nhật kết quả làm lại" : "Hoàn thành Bài học"}
                        </button>
                      ) : (
                        <div className="px-8 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold">Giáo viên không thể nộp bài</div>
                      )}

                      {nextLesson ? <button onClick={() => loadPreviousAnswers(nextLesson)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold px-4 py-2">Bài tiếp <IconNext size={20}/></button> : <div></div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};