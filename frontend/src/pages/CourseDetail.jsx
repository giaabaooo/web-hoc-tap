// src/pages/CourseDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/useAuthStore';
import { ChevronDown, ChevronRight, PlayCircle, FileText, Eye, ArrowLeft, Headphones, CheckCircle2, Mic, ScanLine, Edit3, Loader2, ChevronLeft, ChevronRight as IconNext, Volume2 } from 'lucide-react';

const MOCK_COURSE = {
  _id: "mock-1",
  title: "Khóa Học Demo Full UI Mới",
  description: "Bản demo hiển thị tất cả các loại câu hỏi, bôi xanh/đỏ đáp án, flashcard audio, bài tập Reading tổng hợp.",
  price: 0, views: 9999,
  chapters: [{
    _id: "chap-1", title: "Ngày 1",
    sections: [{
      _id: "sec-1", title: "Unit 1 - Buổi 1",
      lessons: [{
        _id: "les-1", title: "Bài 1", type: "youtube", contentUrl: "https://www.youtube.com/watch?v=5mGUXKcE61c",
        exercises: [
          { _id: "ex-read", type: "reading", instruction: "Đọc đoạn văn sau và trả lời các câu hỏi.", passage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500", points: 20,
            subQuestions: [
              { question: "Where does Sarah go?", options: ["park", "store", "school"], correctAnswer: "park" },
              { question: "Who does she go with?", options: ["dad", "mom", "friend"], correctAnswer: "mom" }
            ]
          },
          { _id: "ex-speak", type: "speaking", question: "Mike_ _ a shower (+)", instruction: "Chọn đáp án đúng và đọc to đáp án đó lên", points: 20, options: ["Mike is having a shower", "Mike having a shower"], correctAnswer: "Mike is having a shower" },
          { _id: "ex-match", type: "matching", question: "Nối từ với hình ảnh tương ứng", points: 20, options: ["Apple|https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?w=200", "Banana|https://images.unsplash.com/photo-1528825871115-3581a5387919?w=200", "Car|https://images.unsplash.com/photo-1518022525094-71848f7642bb?w=200"] },
          { _id: "ex-flash", type: "flashcard", question: "https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?w=400", correctAnswer: "Apple", audioUrl: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg", points: 10 },
          { _id: "ex-mcq", type: "multiple_choice", question: "1 + 1 bằng mấy?", options: ["2", "https://images.unsplash.com/photo-1518022525094-71848f7642bb?w=200"], correctAnswer: "2", points: 10 }
        ]
      }]
    }]
  }]
};

const RenderMediaOrText = ({ content }) => {
  if (!content) return null;
  if (content.startsWith('http')) return <img src={content} alt="Media" className="max-h-32 w-auto object-contain rounded shadow-sm mx-auto" />;
  return <span className="font-semibold text-gray-700 leading-relaxed text-sm md:text-base">{content}</span>;
};

// --- COMPONENT MATCHING THÔNG MINH ---
const InteractiveMatching = ({ exercise, value = {}, onChange, isSubmitted }) => {
  const [shuffledRight, setShuffledRight] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);

  const leftItems = exercise.options.map(opt => opt.split('|')[0]);
  const rightOriginals = exercise.options.map(opt => opt.split('|')[1]);

  useEffect(() => {
    // Trộn ngẫu nhiên cột B 1 lần duy nhất khi render
    const rights = exercise.options.map(opt => opt.split('|')[1]).filter(Boolean);
    const shuffled = [...rights].sort(() => Math.random() - 0.5);
    setShuffledRight(shuffled);
  }, [exercise.options]);

  const handleLeftClick = (index) => {
    if (isSubmitted) return;
    setSelectedLeft(selectedLeft === index ? null : index);
  };

  const handleRightClick = (rightItem) => {
    if (isSubmitted || selectedLeft === null) return;
    const newMatches = { ...value };
    // Nếu item B này đã được dùng, xóa khỏi ô cũ
    Object.keys(newMatches).forEach(key => {
      if (newMatches[key] === rightItem) delete newMatches[key];
    });
    newMatches[selectedLeft] = rightItem;
    onChange(newMatches);
    setSelectedLeft(null); // Reset chọn
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-4">
      {/* CỘT A */}
      <div className="flex-1 space-y-3">
        <h5 className="font-bold text-center text-blue-600 mb-3 uppercase tracking-wider text-sm">CỘT A (Nội dung)</h5>
        {leftItems.map((leftItem, i) => {
          const matchedRight = value[i];
          const isCorrect = matchedRight === rightOriginals[i];
          let borderClass = selectedLeft === i ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50" : "border-gray-200 hover:border-blue-300 bg-white";
          if (isSubmitted) borderClass = isCorrect ? "border-green-500 bg-green-50" : "border-red-400 bg-red-50";

          return (
            <div key={i} className="relative">
              <div className={`flex flex-col sm:flex-row items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all shadow-sm ${borderClass}`} onClick={() => handleLeftClick(i)}>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 flex-shrink-0">{i + 1}</div>
                <div className="flex-1 text-center sm:text-left"><RenderMediaOrText content={leftItem} /></div>
                
                {matchedRight && (
                  <div className="w-full sm:w-1/2 p-2 bg-blue-100 border border-blue-200 rounded-lg shadow-inner mt-2 sm:mt-0 flex items-center justify-center">
                      <RenderMediaOrText content={matchedRight} />
                  </div>
                )}
              </div>
              {/* Hiển thị đáp án đúng nếu làm sai */}
              {isSubmitted && !isCorrect && (
                 <div className="mt-1.5 p-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-bold flex flex-col items-center">
                    <span>Ghép đúng phải là:</span>
                    <div className="mt-1"><RenderMediaOrText content={rightOriginals[i]} /></div>
                 </div>
              )}
            </div>
          )
        })}
      </div>

      {/* CỘT B */}
      <div className="flex-1 space-y-3">
        <h5 className="font-bold text-center text-gray-500 mb-3 uppercase tracking-wider text-sm">CỘT B (Lựa chọn)</h5>
        <div className="grid grid-cols-2 gap-3">
          {shuffledRight.map((rightItem, i) => {
            const isUsed = Object.values(value).includes(rightItem);
            if (isUsed) return null; // Ẩn đi nếu đã được nối

            return (
              <div key={i} className={`p-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all bg-white flex items-center justify-center min-h-[100px] shadow-sm ${selectedLeft !== null ? 'animate-pulse ring-2 ring-blue-100' : ''}`} onClick={() => handleRightClick(rightItem)}>
                <RenderMediaOrText content={rightItem} />
              </div>
            )
          })}
        </div>
        {Object.keys(value).length === leftItems.length && !isSubmitted && (
          <div className="text-center text-green-600 font-bold p-4 bg-green-50 rounded-xl border border-green-200 shadow-sm mt-4">
             Đã ghép xong tất cả! Nộp bài để xem kết quả.
          </div>
        )}
      </div>
    </div>
  )
};

const InteractiveSpeaking = ({ exercise, value, onChange, isSubmitted }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(value?.url || null);
  const [transcript, setTranscript] = useState(value?.transcript || "");
  const [score, setScore] = useState(value?.score || 0);
  const [selectedChoice, setSelectedChoice] = useState(value?.choice || "");
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
  }, [selectedChoice]);

  // FIX TÍNH ĐIỂM AI: Loại bỏ toàn bộ dấu câu để khớp chữ chính xác nhất
  const evaluateSpeech = (spokenText) => {
    const targetText = (exercise.options && exercise.options.length > 0) ? selectedChoice : exercise.correctAnswer;
    if (!targetText) return;
    
    // Normalize: Xóa dấu câu, chuyển chữ thường, xóa khoảng trắng thừa
    const s = spokenText.toLowerCase().replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ').trim();
    const t = targetText.toLowerCase().replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ').trim();
    
    let calculatedScore = 0;
    if (s === t) calculatedScore = exercise.points || 10; 
    else if (s.includes(t) || t.includes(s)) calculatedScore = Math.floor((exercise.points || 10) * 0.5); 
    
    setScore(calculatedScore);
  };

  const startRecording = async () => {
    if (exercise.options && exercise.options.length > 0 && !selectedChoice) return toast.warning("Vui lòng chọn 1 đáp án trước khi đọc!");
    if (attempts >= 3) return toast.warning("Đã hết số lần thu âm cho câu hỏi này!");
    if (!speechRecognition.current) return toast.error("Trình duyệt không hỗ trợ AI. Dùng Chrome nhé!");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (event) => { if (event.data.size > 0) audioChunks.current.push(event.data); };
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onChange({ url, transcript, score, choice: selectedChoice }); 
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
    setAudioUrl(null); setTranscript(""); setScore(0); 
    onChange({ choice: selectedChoice });
  };

  useEffect(() => {
    if (audioUrl && transcript) onChange({ url: audioUrl, transcript, score, choice: selectedChoice });
  }, [transcript, score, audioUrl, selectedChoice]);

  const hasOptions = exercise.options && exercise.options.length > 0;

  return (
    <div className="py-2">
      <h4 className="text-lg font-bold text-gray-800 mb-6 leading-relaxed">{exercise.question}</h4>
      
      {hasOptions && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {exercise.options.map((opt, i) => {
            let stateClass = "border-gray-200 hover:bg-blue-50 cursor-pointer bg-white";
            if (isSubmitted) {
               if (opt === exercise.correctAnswer) stateClass = "border-green-500 bg-green-50"; 
               else if (opt === selectedChoice) stateClass = "border-red-400 bg-red-50"; 
            } else if (selectedChoice === opt) stateClass = "border-blue-500 bg-blue-50";

            return (
              <label key={i} className={`flex items-center gap-3 p-4 border-2 rounded-xl transition-all shadow-sm ${stateClass}`}>
                <input type="radio" disabled={isSubmitted} checked={selectedChoice === opt} onChange={() => setSelectedChoice(opt)} className="w-5 h-5 text-blue-600 accent-blue-600 flex-shrink-0" />
                <RenderMediaOrText content={opt} />
              </label>
            );
          })}
        </div>
      )}

      {(!hasOptions || selectedChoice) && (
        <div className="text-center bg-gray-50 p-6 rounded-2xl border border-gray-200 mt-2">
          {!audioUrl ? (
            <>
              <button onClick={isRecording ? stopRecording : startRecording} disabled={(attempts >= 3 && !isRecording) || isSubmitted} className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all outline-none text-white shadow-lg ${isRecording ? 'bg-red-500 animate-pulse scale-110' : (attempts >= 3 || isSubmitted) ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'}`}>
                {isRecording ? <div className="w-6 h-6 bg-white rounded-sm"></div> : <Mic size={32} />}
              </button>
              <p className="text-sm font-bold mt-4 text-gray-600">{isRecording ? "Đang thu âm..." : isSubmitted ? "Đã nộp bài" : "Bấm vào Mic để đọc đáp án"}</p>
              <p className="text-xs font-medium mt-1 text-red-400">Lượt thu âm còn lại: {3 - attempts}/3</p>
            </>
          ) : (
            <div className="flex flex-col items-center max-w-md mx-auto">
              <audio src={audioUrl} controls className="w-full mb-4" />
              <div className="w-full text-left bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm">
                 <p className="text-xs font-bold text-gray-400 uppercase mb-1">AI Nghe được:</p>
                 <p className="text-gray-800 font-medium italic mb-2">"{transcript || "Không nghe rõ..."}"</p>
                 <div className={`text-sm font-bold ${score > 0 ? 'text-green-600' : 'text-red-500'}`}>Điểm phần đọc: {score}</div>
              </div>
              {!isSubmitted && (
                <div className="flex gap-4">
                  {attempts < 3 && <button onClick={retryRecording} className="text-sm font-bold text-red-500 bg-red-50 px-5 py-2.5 rounded-lg hover:bg-red-100">Thu âm lại</button>}
                </div>
              )}
            </div>
          )}
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
  const [flippedCards, setFlippedCards] = useState({}); 

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setIsLoading(true);
        if (id === 'mock-1') {
           setCourseData(MOCK_COURSE);
           setExpandedChapters([MOCK_COURSE.chapters[0]._id]);
           setExpandedSections([MOCK_COURSE.chapters[0].sections[0]._id]);
           setActiveLesson(MOCK_COURSE.chapters[0].sections[0].lessons[0]);
        } else {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const response = await axios.get(`${API_URL}/api/courses/${id}`);
          setCourseData(response.data.course);
          if (response.data.course?.chapters?.length > 0) {
            setExpandedChapters([response.data.course.chapters[0]._id]);
            if (response.data.course.chapters[0].sections?.length > 0) setExpandedSections([response.data.course.chapters[0].sections[0]._id]);
          }
        }
      } catch (error) { toast.error('Lỗi tải dữ liệu!'); } 
      finally { setIsLoading(false); }
    };
    if (id) fetchCourseDetail();
  }, [id]);

  useEffect(() => {
    const checkEnroll = async () => {
      if (token && id !== 'mock-1' && user?.role !== 'teacher' && user?.role !== 'admin') {
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
  courseData?.chapters?.forEach(c => { c.sections?.forEach(s => { s.lessons?.forEach(l => { allLessons.push(l); }); }); });

  const currentLessonIndex = allLessons.findIndex(l => l._id === activeLesson?._id);
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  const toggleArray = (arr, setArr, itemId) => setArr(prev => prev.includes(itemId) ? prev.filter(item => item !== itemId) : [...prev, itemId]);

  const handleEnroll = async () => {
    if (id === 'mock-1') { setEnrollment({ progress: [] }); return toast.success("Đã vào chế độ học Demo!"); }
    if (!user) return toast.info("Vui lòng đăng nhập!");
    if (user.role === 'teacher' || user.role === 'admin') return toast.error("Giáo viên không thể tham gia khóa học!");

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/courses/${id}/enroll`, {}, { headers: { Authorization: `Bearer ${token}` }});
      setEnrollment(res.data); toast.success("Bắt đầu học thành công!");
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
      setActiveLesson(allLessons[allLessons.length - 1]); toast.info("Đã hoàn thành toàn bộ khóa học!");
    }
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleSubmitLesson = async () => {
    if (!activeLesson) return;
    if (id === 'mock-1') {
       // Thêm logic tự động chấm điểm cho Demo
       const totalPoints = activeLesson.exercises?.reduce((acc, ex) => acc + (ex.points || 0), 0);
       const earnedPoints = activeLesson.exercises?.reduce((acc, ex) => acc + (ex.points || 0), 0); // Giả lập ăn trọn điểm
       setEnrollment(prev => ({ ...prev, progress: [...(prev?.progress || []), { lessonId: activeLesson._id, answers, score: earnedPoints }] }));
       return toast.success("Đã hoàn thành bài học Demo! (Kéo lên xem đáp án)");
    }
    setIsSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/courses/${id}/lessons/${activeLesson._id}/submit`, { answers }, { headers: { Authorization: `Bearer ${token}` }});
      setEnrollment(res.data.enrollment);
      
      // FIX YÊU CẦU: Bỏ thông báo điểm, chỉ báo hoàn thành
      toast.success("Đã hoàn thành bài học!");
    } catch (error) { toast.error("Lỗi nộp bài!"); } 
    finally { setIsSubmitting(false); }
  };

  const isLessonCompleted = (lessonId) => enrollment?.progress?.some(p => p.lessonId === lessonId);
  const formatTime = (lesson) => { let totalMins = 5 + (lesson.exercises?.length || 0) * 2; if (totalMins >= 60) return `${Math.floor(totalMins / 60)}h${totalMins % 60 > 0 ? totalMins % 60 + 'p' : ''}`; return `${totalMins}p`; };

  const loadPreviousAnswers = (lesson) => {
    setActiveLesson(lesson); setFlippedCards({});
    const progress = enrollment?.progress?.find(p => p.lessonId === lesson._id);
    if (progress && progress.answers) setAnswers(progress.answers); else setAnswers({});
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const renderMedia = () => {
    if (!activeLesson) return null;
    const { type, contentUrl, title } = activeLesson;
    if (type === 'youtube') return <iframe className="w-full h-full" src={`${contentUrl.replace('watch?v=', 'embed/').split('&')[0]}?autoplay=1&rel=0`} frameBorder="0" allowFullScreen></iframe>;
    if (type === 'video_upload') return <video controls autoPlay className="w-full h-full bg-black outline-none"><source src={contentUrl} type="video/mp4" /></video>;
    if (type === 'image') return <img src={contentUrl} className="w-full h-full object-contain bg-gray-900" />;
    return <div className="text-center p-8 bg-gray-900 w-full h-full flex flex-col items-center justify-center"><FileText size={48} className="text-blue-500 mb-4" /><h3 className="text-xl text-white font-bold">{title}</h3>{contentUrl && <a href={contentUrl} target="_blank" className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg">Mở tài liệu (PDF)</a>}</div>;
  };

  const renderStudentExercise = (ex, index) => {
    const isSubmitted = isLessonCompleted(activeLesson._id);

    return (
      <div key={index} id={`ex-${index}`} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
          <span className="font-bold text-gray-500 text-sm uppercase tracking-wide">Bài tập {index + 1}</span>
          {/* Vẫn giữ nguyên hiển thị điểm gốc của bài tập nhỏ nếu bạn muốn học sinh biết trọng số */}
          {ex.points > 0 && <span className="bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-md border border-orange-100">{ex.points} điểm</span>}
        </div>
        {ex.instruction && <p className="text-sm font-medium text-gray-700 mb-5 bg-yellow-50/50 border-l-4 border-yellow-400 p-3 rounded">{ex.instruction}</p>}

        {ex.type === 'reading' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 leading-relaxed text-gray-800 text-base shadow-inner">
               <RenderMediaOrText content={ex.passage} />
            </div>
            <div className="space-y-6">
               {ex.subQuestions?.map((sq, sqIdx) => (
                 <div key={sqIdx} className="pl-4 border-l-2 border-blue-200">
                    <h5 className="font-bold text-gray-800 mb-4 text-lg">{sqIdx + 1}. {sq.question}</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {sq.options.map((opt, oIdx) => {
                        let stateClass = "border-gray-200 hover:bg-blue-50 bg-white";
                        const studentAns = answers[ex._id]?.[sqIdx];
                        if (isSubmitted) {
                          if (opt === sq.correctAnswer) stateClass = "border-green-500 bg-green-50";
                          else if (opt === studentAns) stateClass = "border-red-400 bg-red-50";
                        } else if (studentAns === opt) stateClass = "border-blue-500 bg-blue-50";

                        return (
                          <label key={oIdx} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all shadow-sm ${stateClass}`}>
                            <input type="radio" disabled={isSubmitted} checked={studentAns === opt} onChange={() => setAnswers(prev => ({...prev, [ex._id]: {...(prev[ex._id] || {}), [sqIdx]: opt}}))} className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            <RenderMediaOrText content={opt} />
                          </label>
                        )
                      })}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {ex.type === 'multiple_choice' && (
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-5 leading-relaxed">{ex.question}</h4>
            {ex.contentUrl && <div className="mb-5"><RenderMediaOrText content={ex.contentUrl} /></div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {ex.options.map((opt, i) => {
                let stateClass = "border-gray-200 hover:bg-blue-50 bg-white";
                if (isSubmitted) {
                   if (opt === ex.correctAnswer) stateClass = "border-green-500 bg-green-50";
                   else if (opt === answers[ex._id]) stateClass = "border-red-400 bg-red-50";
                } else if (answers[ex._id] === opt) stateClass = "border-blue-500 bg-blue-50";

                return (
                  <label key={i} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all shadow-sm ${stateClass}`}>
                    <input type="radio" disabled={isSubmitted} name={`q-${ex._id}`} value={opt} checked={answers[ex._id] === opt} onChange={(e) => setAnswers(prev => ({...prev, [ex._id]: e.target.value}))} className="w-5 h-5 text-blue-600 accent-blue-600 flex-shrink-0" />
                    <RenderMediaOrText content={opt} />
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {ex.type === 'speaking' && <InteractiveSpeaking exercise={ex} value={answers[ex._id] || {}} onChange={(val) => setAnswers(prev => ({...prev, [ex._id]: val}))} isSubmitted={isSubmitted} />}

        {ex.type === 'listening' && (
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-5 leading-relaxed">{ex.question}</h4>
            {ex.contentUrl && (
              <div className="bg-gray-100 rounded-full p-2 mb-6 max-w-md border border-gray-200 shadow-inner">
                 <audio src={`${ex.contentUrl}${ex.endTime ? `#t=${ex.startTime || 0},${ex.endTime}` : ''}`} controls className="w-full outline-none" />
              </div>
            )}
            <input type="text" disabled={isSubmitted} value={answers[ex._id] || ''} onChange={(e) => setAnswers(prev => ({...prev, [ex._id]: e.target.value}))} className={`w-full p-4 border-2 rounded-xl outline-none font-bold text-gray-700 shadow-sm ${isSubmitted ? (answers[ex._id]?.toLowerCase() === ex.correctAnswer?.toLowerCase() ? 'border-green-500 bg-green-50' : 'border-red-400 bg-red-50') : 'border-gray-200 focus:border-blue-400 bg-white'}`} placeholder="Nhập câu trả lời..." />
            {isSubmitted && answers[ex._id]?.toLowerCase() !== ex.correctAnswer?.toLowerCase() && <p className="text-green-600 text-sm font-bold mt-2">Đáp án đúng: {ex.correctAnswer}</p>}
          </div>
        )}

        {ex.type === 'fill_blank' && (
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-6 leading-relaxed flex flex-wrap items-center">
              {ex.question.split('___').map((part, i, arr) => (
                <React.Fragment key={i}>
                  <span className="mr-2">{part}</span>
                  {i !== arr.length - 1 && (
                    <input type="text" disabled={isSubmitted} value={answers[ex._id] || ''} onChange={(e) => setAnswers(prev => ({...prev, [ex._id]: e.target.value}))} className={`mx-1 w-32 border-b-2 text-center font-bold outline-none py-1 transition-colors ${isSubmitted ? (answers[ex._id]?.toLowerCase() === ex.correctAnswer?.toLowerCase() ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700') : 'border-gray-300 bg-gray-50 focus:border-blue-500 text-blue-600'}`} placeholder="Nhập từ..." />
                  )}
                </React.Fragment>
              ))}
            </h4>
            {isSubmitted && answers[ex._id]?.toLowerCase() !== ex.correctAnswer?.toLowerCase() && <p className="text-green-600 text-sm font-bold mt-2">Đáp án đúng: {ex.correctAnswer}</p>}
          </div>
        )}

        {/* TÍCH HỢP MATCHING VÀO ĐÂY */}
        {ex.type === 'matching' && (
           <div>
              <h4 className="text-lg font-bold text-gray-800">{ex.question}</h4>
              <InteractiveMatching exercise={ex} value={answers[ex._id] || {}} onChange={(val) => setAnswers(prev => ({...prev, [ex._id]: val}))} isSubmitted={isSubmitted} />
           </div>
        )}

        {(ex.type === 'flashcard' || ex.type === 'vocab') && (
           <div className="flex flex-col items-center justify-center py-6">
              <div onClick={() => setFlippedCards(prev => ({...prev, [ex._id]: !prev[ex._id]}))} className="cursor-pointer group relative w-full max-w-sm aspect-[4/3] perspective-1000">
                <div className={`w-full h-full transition-transform duration-700 transform-style-3d shadow-lg rounded-3xl ${flippedCards[ex._id] ? 'rotate-y-180' : ''}`}>
                  {/* Mặt trước: ẢNH HOẶC TEXT */}
                  <div className="absolute inset-0 backface-hidden bg-white border border-gray-200 rounded-3xl flex flex-col items-center justify-center p-6 hover:shadow-xl transition-shadow">
                     <RenderMediaOrText content={ex.question} />
                     <p className="absolute bottom-4 text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full animate-pulse">Bấm lật thẻ</p>
                  </div>
                  {/* Mặt sau: CHỮ + AUDIO */}
                  <div className="absolute inset-0 backface-hidden bg-blue-50 border border-blue-200 rounded-3xl flex flex-col items-center justify-center p-6 rotate-y-180 shadow-inner">
                     <div className="text-2xl font-extrabold text-blue-700 text-center leading-tight mb-6"><RenderMediaOrText content={ex.correctAnswer} /></div>
                     {ex.audioUrl && (
                       <button onClick={(e) => { e.stopPropagation(); new Audio(ex.audioUrl).play(); }} className="w-14 h-14 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-md hover:scale-110 hover:bg-blue-600 hover:text-white transition-all border border-blue-100">
                         <Volume2 size={24} />
                       </button>
                     )}
                  </div>
                </div>
              </div>
           </div>
        )}

        {ex.type === 'essay' && (
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-4"><Edit3 size={20} className="inline mr-2 text-blue-500 -mt-1" />{ex.question}</h4>
            <textarea disabled={isSubmitted} value={answers[ex._id] || ''} onChange={(e) => setAnswers(prev => ({...prev, [ex._id]: e.target.value}))} className={`w-full p-4 border-2 rounded-xl outline-none resize-y font-medium transition-colors min-h-[150px] shadow-sm ${isSubmitted ? 'bg-gray-100 border-gray-200 text-gray-500' : 'bg-white border-gray-200 focus:border-blue-400 text-gray-700'}`} placeholder="Bắt đầu viết tự luận..." />
          </div>
        )}
      </div>
    );
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-12 font-sans">
      <div className="bg-white border-b mb-6 py-5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate('/lessons')} className="text-gray-500 text-sm hover:text-blue-600 mb-3 flex items-center gap-1 font-bold transition-colors"><ArrowLeft size={16} /> Quay lại</button>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800 mb-2">{courseData?.title}</h1>
              <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{!courseData?.price ? 'Miễn phí' : `${courseData?.price.toLocaleString('vi-VN')} đ`}</span>
                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{courseData?.chapters?.length || 0} Ngày học</span>
              </div>
            </div>
            {!enrollment ? (
              user?.role === 'teacher' || user?.role === 'admin' ? (
                <div className="px-6 py-2.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-lg font-bold text-sm">Chế độ xem trước (Giáo viên)</div>
              ) : (
                <button onClick={handleEnroll} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-colors text-sm">Bắt đầu học ngay</button>
              )
            ) : (
              <button onClick={handleContinue} className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-bold shadow-sm hover:bg-green-700 transition-colors text-sm">Tiếp tục học</button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-[300px] flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 h-fit sticky top-20 max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-100"><h3 className="font-bold text-sm text-gray-800 uppercase">Lộ trình học</h3></div>
            <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {!enrollment && user?.role !== 'teacher' && user?.role !== 'admin' && id !== 'mock-1' ? (
                <div className="p-6 text-center text-gray-400 text-sm font-medium">Bấm Bắt đầu học để xem chi tiết.</div>
              ) : (
                courseData?.chapters?.map((chapter, index) => (
                  <div key={chapter._id} className="border border-gray-100 rounded-lg overflow-hidden bg-white mb-2">
                    <button onClick={() => toggleArray(expandedChapters, setExpandedChapters, chapter._id)} className="w-full flex items-center justify-between p-3 transition-colors hover:bg-gray-50">
                      <div className="flex items-center gap-3"><div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-gray-100 text-gray-600">{index + 1}</div><span className="font-bold text-gray-800 text-sm text-left">{chapter.title}</span></div>
                      {expandedChapters.includes(chapter._id) ? <ChevronDown size={16} className="text-gray-400"/> : <ChevronRight size={16} className="text-gray-400"/>}
                    </button>
                    {expandedChapters.includes(chapter._id) && (
                      <div className="p-2 space-y-2 border-t border-gray-100 bg-gray-50/50">
                        {chapter.sections?.map(section => (
                          <div key={section._id} className="bg-white border border-gray-100 rounded shadow-sm">
                            <button onClick={() => toggleArray(expandedSections, setExpandedSections, section._id)} className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-orange-600 hover:bg-orange-50 rounded-t">
                              <span className="text-left">{section.title}</span>{expandedSections.includes(section._id) ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                            </button>
                            {expandedSections.includes(section._id) && (
                              <div className="p-1.5 space-y-1">
                                {section.lessons?.map(lesson => {
                                  const isPlaying = activeLesson?._id === lesson._id;
                                  const completed = isLessonCompleted(lesson._id);
                                  const progress = enrollment?.progress?.find(p => p.lessonId === lesson._id);
                                  const maxPoints = lesson.exercises?.reduce((sum, ex) => sum + (ex.points || 0), 0) || 0;
                                  
                                  // FIX HIỂN THỊ ĐIỂM: Quy đổi ra thang điểm 10
                                  let displayedScore = null;
                                  if (completed && maxPoints > 0) {
                                      const scaledScore = (progress?.score / maxPoints) * 10;
                                      displayedScore = Number.isInteger(scaledScore) ? scaledScore : scaledScore.toFixed(1);
                                  }

                                  return (
                                    <button key={lesson._id} onClick={() => loadPreviousAnswers(lesson)} className={`w-full flex items-start gap-2 p-2.5 text-xs text-left rounded transition-all ${isPlaying ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}>
                                      {completed ? <CheckCircle2 size={16} className="mt-0.5 text-blue-500" /> : <PlayCircle size={16} className={`mt-0.5 ${isPlaying ? "text-blue-600" : "text-gray-400"}`}/>}
                                      <div className="flex-1">
                                        <div className={`font-bold leading-tight mb-1 ${isPlaying ? 'text-blue-700' : 'text-gray-700'}`}>{lesson.title}</div>
                                        <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-400">
                                          <span>{formatTime(lesson)}</span>
                                          {lesson.exercises?.length > 0 && <span className="text-orange-500 bg-orange-50 px-1 py-0.5 rounded border border-orange-100">{lesson.exercises.length} Bài tập</span>}
                                          {completed && maxPoints > 0 && <span className="text-green-600 font-extrabold ml-auto">{displayedScore}/10</span>}
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
            <div className="bg-black w-full rounded-xl shadow-sm overflow-hidden aspect-video flex items-center justify-center relative border border-gray-200">
              {!activeLesson ? (<div className="text-center p-8"><h2 className="text-2xl font-bold text-white mb-2">Bắt đầu học ngay!</h2></div>) : renderMedia()}
            </div>
            
            <div className="bg-white p-5 md:p-8 rounded-xl border border-gray-200 shadow-sm text-left">
              <h2 className="text-2xl font-extrabold text-gray-800 mb-2">{activeLesson ? activeLesson.title : courseData?.title}</h2>
              <p className="text-gray-500 text-sm font-medium mb-8 pb-6 border-b border-gray-100">{courseData?.description}</p>
              
              {activeLesson && (
                <div>
                  {activeLesson.exercises?.length > 0 && (
                    <><h3 className="text-lg font-bold text-blue-600 mb-6 flex items-center gap-2"><CheckCircle2 size={20}/> Phần Thực Hành & Bài Tập</h3>
                      {activeLesson.exercises.map((ex, idx) => renderStudentExercise(ex, idx))}</>
                  )}

                  <div className="mt-8 border-t border-gray-100 pt-6">
                    {activeLesson.exercises?.length > 0 && (
                       <div className="mb-6 flex flex-wrap items-center gap-2 justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-sm font-bold text-gray-500 mr-2">Danh sách câu hỏi:</span>
                          {activeLesson.exercises.map((ex, idx) => {
                             const isAns = answers[ex._id] !== undefined;
                             const isCorrect = isLessonCompleted(activeLesson._id) && (ex.type === 'reading' || ex.type === 'matching' ? true : (typeof answers[ex._id] === 'object' ? answers[ex._id].choice === ex.correctAnswer : answers[ex._id]?.toLowerCase() === ex.correctAnswer?.toLowerCase()));
                             let btnClass = 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100';
                             if (isLessonCompleted(activeLesson._id)) btnClass = isCorrect ? 'bg-green-500 text-white border-green-500' : 'bg-red-500 text-white border-red-500';
                             else if (isAns) btnClass = 'bg-blue-500 text-white border-blue-500';
                             return (
                              <a href={`#ex-${idx}`} key={ex._id} className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold border transition-colors shadow-sm ${btnClass}`}>
                                {idx + 1}
                              </a>
                             )
                          })}
                       </div>
                    )}

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      {prevLesson ? <button onClick={() => loadPreviousAnswers(prevLesson)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-sm"><ChevronLeft size={16}/> Bài trước</button> : <div></div>}
                      
                      {user?.role !== 'teacher' && user?.role !== 'admin' ? (
                        <button onClick={handleSubmitLesson} disabled={isSubmitting} className={`font-bold py-3 px-8 rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full md:w-auto text-sm ${isLessonCompleted(activeLesson._id) ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                          {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle2 size={18}/>}
                          {isSubmitting ? "Đang xử lý..." : isLessonCompleted(activeLesson._id) ? "Cập nhật kết quả làm lại" : "Nộp bài / Hoàn thành"}
                        </button>
                      ) : (
                        <div className="px-6 py-2.5 bg-gray-100 text-gray-500 rounded-lg font-bold text-sm border border-gray-200">Giáo viên xem trước</div>
                      )}

                      {nextLesson ? <button onClick={() => loadPreviousAnswers(nextLesson)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-sm">Bài tiếp <IconNext size={16}/></button> : <div></div>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <style dangerouslySetColor="text/css">{`.perspective-1000 { perspective: 1000px; } .transform-style-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-y-180 { transform: rotateY(180deg); }`}</style>
    </div>
  );
};