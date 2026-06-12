// src/pages/CourseDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/useAuthStore';
import { ChevronDown, ChevronRight, PlayCircle, FileText, CheckCircle2, Mic, Edit3, Loader2, ChevronLeft, ChevronRight as IconNext, Volume2, RotateCcw, ArrowLeft, BookOpen, PenTool } from 'lucide-react';

const MOCK_COURSE = {
  _id: "mock-1", title: "Khóa Học Demo (Cấu trúc 2 tầng)", description: "Bản demo hiển thị tất cả các loại câu hỏi theo cấu trúc nhóm câu hỏi mới.", price: 0, views: 9999,
  chapters: [{ _id: "chap-1", title: "Ngày 1", sections: [{ _id: "sec-1", title: "Unit 1 - Buổi 1", lessons: [{ _id: "les-1", title: "Bài hát ABC | Nhạc thiếu nhi vui nhộn", type: "youtube", contentUrl: "https://www.youtube.com/watch?v=5mGUXKcE61c",
    exercises: [
      { _id: "ex-read", type: "reading", instruction: "Đọc đoạn văn sau và trả lời các câu hỏi.", 
        questions: [{ question: "Sarah goes to the park with her mom.", contentUrl: "", audioUrl: "", subQuestions: [
          { question: "Where does Sarah go?", options: ["park", "store", "school"], correctAnswer: "park", points: 10 }, 
          { question: "Who does she go with?", options: ["dad", "mom", "friend"], correctAnswer: "mom", points: 10 }
        ]}] 
      },
      { _id: "ex-mcq", type: "multiple_choice", instruction: "Chọn đáp án đúng nhất", 
        questions: [{ question: "Nhìn hình và chọn đáp án", contentUrl: "https://images.unsplash.com/photo-1518022525094-71848f7642bb?w=200", subQuestions: [
          { question: "Đây là con gì?", options: ["Mèo", "Chó", "Heo"], correctAnswer: "Mèo", points: 10 }
        ]}] 
      }
    ]
  }]}]}]
};

const getTypeLabel = (type) => {
  switch (type) {
    case 'multiple_choice': return 'Trắc nghiệm';
    case 'fill_blank': return 'Điền từ';
    case 'speaking': return 'Luyện nói';
    case 'listening': return 'Luyện nghe';
    case 'matching': return 'Nối từ';
    case 'flashcard': return 'Flashcard';
    case 'reading': return 'Đọc hiểu';
    case 'essay': return 'Tự luận';
    default: return 'Bài tập';
  }
};

const calculateExerciseScore = (ex, studentAnsObj) => {
  if (!studentAnsObj || typeof studentAnsObj !== 'object') return 0;
  let totalScore = 0;
  
  ex.questions?.forEach((qGroup, qIdx) => {
     qGroup.subQuestions?.forEach((sq, sqIdx) => {
        const ansKey = `${qIdx}-${sqIdx}`;
        const ans = studentAnsObj[ansKey];
        if (!ans) return;
        const maxPts = sq.points || 10;
        
        switch(ex.type) {
          case 'speaking': totalScore += ans.score || 0; break;
          case 'matching': {
            if (typeof ans === 'object') {
              const rightOriginals = sq.options?.map(opt => opt.split('|')[1]) || [];
              let correctCount = 0;
              sq.options?.forEach((_, i) => { if (ans[i] === rightOriginals[i]) correctCount++; });
              if (correctCount === (sq.options?.length || 1)) totalScore += maxPts; 
            }
            break;
          }
          case 'essay': totalScore += maxPts; break; 
          default: { 
            const ansStr = typeof ans === 'object' ? (ans.choice || '') : ans;
            if (ansStr.toString().trim().toLowerCase() === (sq.correctAnswer || '').toString().trim().toLowerCase()) totalScore += maxPts;
          }
        }
     });
  });
  return totalScore;
};

const RenderMediaOrText = ({ content }) => {
  if (!content) return null;
  const isAudio = content.match(/\.(mp3|wav|ogg)$/i);
  if (content.startsWith('http')) {
     if (isAudio) return <audio src={content} controls className="h-10 w-full outline-none mt-2" />;
     return <img src={content} alt="Media" className="max-h-32 w-auto object-contain rounded shadow-sm mx-auto my-2" />;
  }
  return <span className="font-semibold text-gray-700 leading-relaxed text-sm md:text-base">{content}</span>;
};

const InteractiveMatching = ({ sq, value = {}, onChange, isSubmitted }) => {
  const [shuffledRight, setShuffledRight] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);

  const leftItems = sq.options?.map(opt => opt.split('|')[0]) || [];
  const rightOriginals = sq.options?.map(opt => opt.split('|')[1]) || [];

  useEffect(() => {
    const rights = sq.options?.map(opt => opt.split('|')[1]).filter(Boolean) || [];
    const shuffled = [...rights].sort(() => Math.random() - 0.5);
    setShuffledRight(shuffled);
  }, [sq.options]);

  const handleLeftClick = (index) => { if (isSubmitted) return; setSelectedLeft(selectedLeft === index ? null : index); };

  const handleRightClick = (rightItem) => {
    if (isSubmitted || selectedLeft === null) return;
    const newMatches = { ...value };
    Object.keys(newMatches).forEach(key => { if (newMatches[key] === rightItem) delete newMatches[key]; });
    newMatches[selectedLeft] = rightItem;
    onChange(newMatches);
    setSelectedLeft(null); 
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-4 border border-gray-200 bg-gray-50/50 p-4 rounded-xl">
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
                {matchedRight && <div className="w-full sm:w-1/2 p-2 bg-blue-100 border border-blue-200 rounded-lg shadow-inner mt-2 sm:mt-0 flex items-center justify-center"><RenderMediaOrText content={matchedRight} /></div>}
              </div>
              {isSubmitted && !isCorrect && (
                 <div className="mt-1.5 p-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-bold flex flex-col items-center">
                    <span>Ghép đúng phải là:</span><div className="mt-1"><RenderMediaOrText content={rightOriginals[i]} /></div>
                 </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex-1 space-y-3">
        <h5 className="font-bold text-center text-gray-500 mb-3 uppercase tracking-wider text-sm">CỘT B (Lựa chọn)</h5>
        <div className="grid grid-cols-2 gap-3">
          {shuffledRight.map((rightItem, i) => {
            const isUsed = Object.values(value).includes(rightItem);
            if (isUsed) return null;
            return (
              <div key={i} className={`p-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all bg-white flex items-center justify-center min-h-[100px] shadow-sm ${selectedLeft !== null ? 'animate-pulse ring-2 ring-blue-100' : ''}`} onClick={() => handleRightClick(rightItem)}>
                <RenderMediaOrText content={rightItem} />
              </div>
            )
          })}
        </div>
        {Object.keys(value).length === leftItems.length && !isSubmitted && <div className="text-center text-green-600 font-bold p-4 bg-green-50 rounded-xl border border-green-200 shadow-sm mt-4">Đã ghép xong tất cả! Nộp bài để xem kết quả.</div>}
      </div>
    </div>
  )
};

const InteractiveSpeaking = ({ sq, value, onChange, isSubmitted }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState(value?.transcript || "");
  const [audioUrl, setAudioUrl] = useState(value?.url || null);
  const [selectedChoice, setSelectedChoice] = useState(value?.choice || "");
  const [attempts, setAttempts] = useState(value?.attempts || 0); 
  
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const speechRecognition = useRef(null);

  const maxPoints = sq.points || 10;
  const currentTarget = (sq.options && sq.options.length > 0) ? selectedChoice : sq.correctAnswer;

  const calculateScore = (spoken, target) => {
    if (!spoken || !target) return 0;
    const s = String(spoken).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
    const t = String(target).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
    if (s === t) return maxPoints;
    const sWords = s.split(' ');
    const tWords = t.split(' ');
    const matchCount = sWords.filter(w => tWords.includes(w)).length;
    if (s.includes(t) || t.includes(s) || matchCount >= Math.ceil(tWords.length / 2)) return Math.floor(maxPoints * 0.5);
    return 0;
  };

  const score = calculateScore(transcript, currentTarget);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      speechRecognition.current = new SpeechRecognition();
      speechRecognition.current.lang = 'en-US'; 
      speechRecognition.current.interimResults = false;
      speechRecognition.current.maxAlternatives = 1;
      speechRecognition.current.onresult = (event) => { setTranscript(event.results[0][0].transcript); };
    }
  }, [selectedChoice]);

  useEffect(() => {
    if (audioUrl && transcript) { onChange({ url: audioUrl, transcript, score, choice: selectedChoice, attempts }); }
  }, [audioUrl, transcript, selectedChoice, score, attempts]);

  const startRecording = async () => {
    if (sq.options && sq.options.length > 0 && !selectedChoice) return toast.warning("Vui lòng chọn 1 đáp án trước khi đọc!");
    if (attempts >= 3) return toast.warning("Đã hết số lần thu âm cho câu hỏi này!");
    if (!speechRecognition.current) return toast.error("Trình duyệt không hỗ trợ AI. Khuyên dùng Chrome!");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (event) => { if (event.data.size > 0) audioChunks.current.push(event.data); };
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
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
    setAudioUrl(null); setTranscript("");
    onChange({ choice: selectedChoice, attempts });
  };

  const hasOptions = sq.options && sq.options.length > 0;

  return (
    <div className="py-2 text-center bg-white p-4 rounded-xl border border-gray-200">
      {sq.question && <h4 className="text-xl font-bold text-blue-600 mb-6 uppercase tracking-widest leading-relaxed text-center">"{sq.question}"</h4>}
      
      {hasOptions && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-left">
          {sq.options.map((opt, i) => {
            let stateClass = "border-gray-200 hover:bg-blue-50 cursor-pointer bg-white";
            if (isSubmitted) {
               if (opt === sq.correctAnswer) stateClass = "border-green-500 bg-green-50"; 
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
        <div>
          {!audioUrl ? (
            <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100 max-w-md mx-auto inline-block w-full">
              <button onClick={isRecording ? stopRecording : startRecording} disabled={(attempts >= 3 && !isRecording) || isSubmitted} className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all outline-none text-white shadow-xl ${isRecording ? 'bg-red-500 animate-pulse scale-110' : (attempts >= 3 || isSubmitted) ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'}`}>
                {isRecording ? <div className="w-8 h-8 bg-white rounded-sm"></div> : <Mic size={40} />}
              </button>
              <p className="text-base font-bold mt-6 text-gray-700">{isRecording ? "Đang thu âm..." : isSubmitted ? "Đã nộp bài" : "Bấm vào Mic để đọc đáp án"}</p>
              <p className="text-sm font-medium mt-2 text-red-500 bg-red-50 px-3 py-1 rounded-full inline-block">Còn lại: {3 - attempts}/3 lần</p>
            </div>
          ) : (
            <div className="flex flex-col items-center max-w-lg mx-auto w-full bg-[#f8faff] p-6 sm:p-8 rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-blue-50">
              <audio src={audioUrl} controls className="w-full mb-6 outline-none" />
              <div className="w-full text-left bg-white p-5 rounded-2xl border border-gray-100 mb-6 shadow-sm">
                 <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">AI Nghe được:</p>
                 <p className="text-gray-800 font-bold italic text-lg mb-4">"{transcript || "Không nghe rõ..."}"</p>
                 <div className={`text-[15px] font-extrabold ${score >= maxPoints ? 'text-yellow-600' : score > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                    Điểm AI Chấm: {score} / {maxPoints}
                 </div>
              </div>
              {!isSubmitted && (
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button onClick={retryRecording} disabled={attempts >= 3} className={`flex-1 text-[13px] font-bold py-3.5 rounded-xl transition-all ${attempts < 3 ? 'text-red-500 bg-[#ffeceb] hover:bg-[#ffdfdc]' : 'text-gray-400 bg-gray-100 cursor-not-allowed'}`}>Thu âm lại (Còn {3 - attempts} lần)</button>
                  <div className="flex-1 text-[13px] font-bold text-green-700 bg-[#e6fbf0] py-3.5 rounded-xl flex items-center justify-center">Đã lưu bản ghi âm</div>
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
  const [isOwned, setIsOwned] = useState(false); // TRẠNG THÁI SỞ HỮU KHÓA HỌC
  const [isLoading, setIsLoading] = useState(true);

  const [expandedChapters, setExpandedChapters] = useState([]); 
  const [expandedSections, setExpandedSections] = useState([]); 
  const [expandedLessons, setExpandedLessons] = useState([]);

  const [activeLesson, setActiveLesson] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flippedCards, setFlippedCards] = useState({}); 
  const [isRedoing, setIsRedoing] = useState(false); 

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  const normalizeCourseData = (data) => {
    if (!data) return data;
    const newData = JSON.parse(JSON.stringify(data));
    newData.chapters?.forEach(ch => {
      ch.sections?.forEach(sec => {
        sec.lessons?.forEach(les => {
          les.exercises?.forEach(ex => {
            if (!ex.questions || ex.questions.length === 0) {
              const oldOpts = ex.options || [];
              const oldCorrect = ex.correctAnswer || '';
              const oldSubQ = ex.subQuestions || [];
              const oldQ = ex.question || '';
              
              if (ex.type === 'reading') {
                ex.questions = [{ question: ex.passage || '', contentUrl: ex.contentUrl || '', audioUrl: ex.audioUrl || '', subQuestions: oldSubQ.length > 0 ? oldSubQ : [{ question: oldQ, options: oldOpts, correctAnswer: oldCorrect, points: ex.points || 10 }] }];
              } else {
                ex.questions = [{ question: oldQ, contentUrl: ex.contentUrl || '', audioUrl: ex.audioUrl || '', subQuestions: oldSubQ.length > 0 ? oldSubQ : [{ question: '', options: oldOpts, correctAnswer: oldCorrect, points: ex.points || 10 }] }];
              }
            }
          });
        });
      });
    });
    return newData;
  };

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setIsLoading(true);
        if (id === 'mock-1') {
           setCourseData(normalizeCourseData(MOCK_COURSE));
           setIsOwned(true); // Mock luôn mở
           const firstChapter = MOCK_COURSE.chapters[0];
           const firstSection = firstChapter?.sections[0];
           const firstLesson = firstSection?.lessons[0];
           if (firstChapter) setExpandedChapters([firstChapter._id]);
           if (firstSection) setExpandedSections([firstSection._id]);
           if (firstLesson) { setActiveLesson(firstLesson); setExpandedLessons([firstLesson._id]); }
        } else {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const response = await axios.get(`${API_URL}/api/courses/${id}`);
          const normalizedData = normalizeCourseData(response.data.course);
          setCourseData(normalizedData);

          // LOGIC KHÓA BÀI HỌC: Mặc định nếu giá = 0 hoặc Giáo viên/Admin thì cho xem
          if (normalizedData.price === 0 || user?.role === 'teacher' || user?.role === 'admin') {
            setIsOwned(true);
          }

          if (normalizedData?.chapters?.length > 0) {
            setExpandedChapters([normalizedData.chapters[0]._id]);
            if (normalizedData.chapters[0].sections?.length > 0) {
               setExpandedSections([normalizedData.chapters[0].sections[0]._id]);
               const firstLes = normalizedData.chapters[0].sections[0].lessons[0];
               if(firstLes) setExpandedLessons([firstLes._id]);
            }
          }
        }
      } catch (error) { toast.error('Lỗi tải dữ liệu!'); navigate('/lessons'); } 
      finally { setIsLoading(false); }
    };
    if (id) fetchCourseDetail();
  }, [id, user, navigate]);

  useEffect(() => {
    const checkEnroll = async () => {
      if (token && id !== 'mock-1' && user?.role !== 'teacher' && user?.role !== 'admin') {
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          // 1. Kiểm tra khóa đã mua và hạn sử dụng (API trả về mảng)
          const resEnrolls = await axios.get(`${API_URL}/api/courses/student/enrollments`, { headers: { Authorization: `Bearer ${token}` }});
          const enrollmentsList = resEnrolls.data.enrollments || resEnrolls.data || [];
          
          const validOwnership = enrollmentsList.find(e => {
              const cId = e.course?._id || e.course;
              return cId === id && !e.isExpired;
          });

          if (validOwnership) {
             setIsOwned(true);
             
             // 2. Kéo tiến độ cũ của riêng khóa này về
             const progressRes = await axios.get(`${API_URL}/api/courses/${id}/check-enrollment`, { headers: { Authorization: `Bearer ${token}` }});
             setEnrollment(progressRes.data);
          }
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

  // HÀM CHUYỂN SANG TRANG THANH TOÁN
  const handleBuyNow = () => {
    if (!token) {
      toast.info("Vui lòng đăng nhập để mua khóa học");
      return navigate('/auth');
    }
    navigate('/pricing', { state: { autoAddCourseId: id } });
  };

  const handleEnroll = async () => {
    if (id === 'mock-1') { setEnrollment({ progress: [] }); return toast.success("Đã vào chế độ học Demo!"); }
    if (!user) return toast.info("Vui lòng đăng nhập!");
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
            if (!expandedLessons.includes(firstUncompleted._id)) setExpandedLessons(prev => [...prev, firstUncompleted._id]);
          }
        });
      });
    } else {
      setActiveLesson(allLessons[allLessons.length - 1]); toast.info("Đã hoàn thành toàn bộ khóa học!");
    }
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const isLessonCompleted = (lessonId) => enrollment?.progress?.some(p => p.lessonId === lessonId);
  const formatTime = (lesson) => { let totalMins = 5 + (lesson.exercises?.length || 0) * 2; if (totalMins >= 60) return `${Math.floor(totalMins / 60)}h${totalMins % 60 > 0 ? totalMins % 60 + 'p' : ''}`; return `${totalMins}p`; };

  const loadPreviousAnswers = (lesson) => {
    setActiveLesson(lesson); setFlippedCards({}); setIsRedoing(false); 
    const progress = enrollment?.progress?.find(p => p.lessonId === lesson._id);
    if (progress && progress.answers) {
       let normAnswers = {};
       Object.keys(progress.answers).forEach(exId => {
           let rawAns = progress.answers[exId];
           if (typeof rawAns === 'object' && rawAns !== null && !Array.isArray(rawAns) && Object.keys(rawAns).some(k => k.includes('-'))) {
               normAnswers[exId] = rawAns; 
           } else {
               normAnswers[exId] = {};
               if (typeof rawAns === 'object' && rawAns !== null && !Array.isArray(rawAns)) {
                   Object.keys(rawAns).forEach(k => { normAnswers[exId][`0-${k}`] = rawAns[k]; });
               } else { normAnswers[exId]['0-0'] = rawAns; }
           }
       });
       setAnswers(normAnswers);
    } else { setAnswers({}); }
    
    if (!expandedLessons.includes(lesson._id)) setExpandedLessons(prev => [...prev, lesson._id]);
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const scrollToExercise = (index) => {
    const el = document.getElementById(`ex-${index}`);
    if (el) { const yOffset = -90; const y = el.getBoundingClientRect().top + window.scrollY + yOffset; window.scrollTo({ top: y, behavior: 'smooth' }); }
  };

  const handleRedoLesson = () => {
    if (!window.confirm("Bắt đầu làm lại bài? Mọi đáp án sẽ được mở khóa.")) return;
    setIsRedoing(true); setAnswers({}); 
  };

  const handleAnswerChange = (exId, ansKey, value) => { setAnswers(prev => ({ ...prev, [exId]: { ...(prev[exId] || {}), [ansKey]: value } })); };

  const handleSubmitLesson = async () => {
    if (!activeLesson) return;
    if (id === 'mock-1') {
       const earnedPoints = activeLesson.exercises?.reduce((acc, ex) => acc + calculateExerciseScore(ex, answers[ex._id]), 0); 
       setEnrollment(prev => ({ ...prev, progress: [...(prev?.progress || []), { lessonId: activeLesson._id, answers, score: earnedPoints }] }));
       setIsRedoing(false); return toast.success("Đã nộp bài!");
    }
    setIsSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/courses/${id}/lessons/${activeLesson._id}/submit`, { answers }, { headers: { Authorization: `Bearer ${token}` }});
      setEnrollment(res.data.enrollment); setIsRedoing(false); toast.success("Nộp bài thành công!");
    } catch (error) { toast.error("Lỗi nộp bài!"); } finally { setIsSubmitting(false); }
  };

  const renderMedia = () => {
    if (!activeLesson) return null;
    const { type, contentUrl, title } = activeLesson;
    if (type === 'youtube') return <iframe className="w-full h-full" src={`${contentUrl.replace('watch?v=', 'embed/').split('&')[0]}?autoplay=1&rel=0`} frameBorder="0" allowFullScreen></iframe>;
    if (type === 'video_upload') return <video controls autoPlay className="w-full h-full bg-black outline-none"><source src={contentUrl} type="video/mp4" /></video>;
    if (type === 'image') return <img src={contentUrl} className="w-full h-full object-contain bg-gray-900" />;
    return <div className="text-center p-8 bg-gray-900 w-full h-full flex flex-col items-center justify-center"><FileText size={48} className="text-blue-500 mb-4" /><h3 className="text-xl text-white font-bold">{title}</h3>{contentUrl && <a href={contentUrl} target="_blank" rel="noreferrer" className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg">Mở tài liệu (PDF)</a>}</div>;
  };

  const renderStudentExercise = (ex, index) => {
    const isLocked = isLessonCompleted(activeLesson._id) && !isRedoing;
    const blockPoints = ex.questions?.reduce((sum, qGroup) => sum + (qGroup.subQuestions?.reduce((s, sq) => s + (sq.points || 0), 0) || 0), 0) || 0;

    return (
      <div key={index} id={`ex-${index}`} className="bg-white border border-gray-200 rounded-2xl p-0 shadow-sm mb-6 overflow-hidden">
        <div className="flex flex-wrap justify-between items-center bg-gray-50 border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="bg-orange-500 text-white w-7 h-7 rounded-md flex items-center justify-center font-extrabold text-sm shadow-sm">{index + 1}</span>
            <span className="font-extrabold text-gray-800 uppercase tracking-wide text-sm">Bài tập {index + 1}: {getTypeLabel(ex.type)}</span>
          </div>
          {blockPoints > 0 && <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-md border border-orange-200 shadow-sm">{blockPoints} điểm</span>}
        </div>
        
        <div className="p-6">
          {ex.instruction && <p className="text-sm font-medium text-gray-700 mb-5 bg-yellow-50/50 border-l-4 border-yellow-400 p-3 rounded">{ex.instruction}</p>}
          {ex.passage && <div className="mb-5 bg-gray-50 p-4 rounded-xl border border-gray-200"><RenderMediaOrText content={ex.passage} /></div>}
          {ex.contentUrl && ex.type === 'listening' && (
             <div className="bg-gray-100 rounded-full p-2 mb-6 max-w-md border border-gray-200 shadow-inner">
               <audio src={`${ex.contentUrl}${ex.endTime ? `#t=${ex.startTime || 0},${ex.endTime}` : ''}`} controls className="w-full outline-none" />
             </div>
          )}

          <div className="space-y-8">
             {ex.questions?.map((qGroup, qIdx) => (
                <div key={qIdx} className="border border-gray-100 rounded-xl p-5 shadow-sm">
                   {(qGroup.question || qGroup.contentUrl || qGroup.audioUrl) && (
                      <div className="mb-5 bg-blue-50/40 p-4 rounded-lg border border-blue-100">
                         {qGroup.question && <p className="font-bold text-gray-800 mb-3 text-lg leading-relaxed">{qGroup.question}</p>}
                         <div className="flex flex-col sm:flex-row gap-4">
                            {qGroup.contentUrl && <div className="flex-1"><RenderMediaOrText content={qGroup.contentUrl} /></div>}
                            {qGroup.audioUrl && <div className="flex-1"><RenderMediaOrText content={qGroup.audioUrl} /></div>}
                         </div>
                      </div>
                   )}

                   <div className="space-y-6 pl-2 md:pl-4 border-l-2 border-orange-200">
                      {qGroup.subQuestions?.map((sq, sqIdx) => {
                         const ansKey = `${qIdx}-${sqIdx}`;
                         const studentAns = answers[ex._id]?.[ansKey];

                         return (
                            <div key={sqIdx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
                               <div className="absolute -left-[27px] md:-left-[35px] top-4 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs border border-orange-200 shadow-sm">{sqIdx + 1}</div>
                               
                               {(ex.type === 'multiple_choice' || ex.type === 'reading') && (
                                  <div>
                                     {sq.question && <h5 className="font-bold text-gray-800 mb-4 text-base">{sq.question}</h5>}
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {sq.options?.map((opt, oIdx) => {
                                          let stateClass = "border-gray-200 hover:bg-blue-50 bg-white";
                                          if (isLocked) {
                                            if (opt === sq.correctAnswer) stateClass = "border-green-500 bg-green-50 ring-2 ring-green-200";
                                            else if (opt === studentAns) stateClass = "border-red-400 bg-red-50 ring-2 ring-red-200";
                                          } else if (studentAns === opt) stateClass = "border-blue-500 bg-blue-50 ring-2 ring-blue-200";

                                          return (
                                            <label key={oIdx} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all shadow-sm ${stateClass}`}>
                                              <input type="radio" disabled={isLocked} checked={studentAns === opt} onChange={() => handleAnswerChange(ex._id, ansKey, opt)} className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                              <RenderMediaOrText content={opt} />
                                            </label>
                                          )
                                        })}
                                     </div>
                                  </div>
                               )}

                               {ex.type === 'fill_blank' && (
                                  <div>
                                     <h5 className="font-bold text-gray-800 mb-4 leading-relaxed flex flex-wrap items-center">
                                       {sq.question?.split('___').map((part, i, arr) => (
                                         <React.Fragment key={i}>
                                           <span className="mr-2">{part}</span>
                                           {i !== arr.length - 1 && (
                                             <input type="text" disabled={isLocked} value={studentAns || ''} onChange={(e) => handleAnswerChange(ex._id, ansKey, e.target.value)} className={`mx-1 w-32 border-b-2 text-center font-bold outline-none py-1 transition-colors ${isLocked ? (studentAns?.toLowerCase() === sq.correctAnswer?.toLowerCase() ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700') : 'border-gray-300 bg-gray-50 focus:border-blue-500 text-blue-600'}`} placeholder="Nhập từ..." />
                                           )}
                                         </React.Fragment>
                                       ))}
                                     </h5>
                                     {isLocked && studentAns?.toLowerCase() !== sq.correctAnswer?.toLowerCase() && <p className="text-green-600 text-sm font-bold mt-2">Đáp án đúng: {sq.correctAnswer}</p>}
                                  </div>
                               )}

                               {ex.type === 'listening' && (
                                  <div>
                                     {sq.question && <h5 className="font-bold text-gray-800 mb-4">{sq.question}</h5>}
                                     <input type="text" disabled={isLocked} value={studentAns || ''} onChange={(e) => handleAnswerChange(ex._id, ansKey, e.target.value)} className={`w-full p-4 border-2 rounded-xl outline-none font-bold text-gray-700 shadow-sm ${isLocked ? (studentAns?.toLowerCase() === sq.correctAnswer?.toLowerCase() ? 'border-green-500 bg-green-50' : 'border-red-400 bg-red-50') : 'border-gray-200 focus:border-blue-400 bg-white'}`} placeholder="Nhập câu trả lời..." />
                                     {isLocked && studentAns?.toLowerCase() !== sq.correctAnswer?.toLowerCase() && <p className="text-green-600 text-sm font-bold mt-2">Đáp án đúng: {sq.correctAnswer}</p>}
                                  </div>
                               )}

                               {ex.type === 'matching' && (
                                  <div>
                                     {sq.question && <h5 className="font-bold text-gray-800">{sq.question}</h5>}
                                     <InteractiveMatching sq={sq} value={studentAns || {}} onChange={(val) => handleAnswerChange(ex._id, ansKey, val)} isSubmitted={isLocked} />
                                  </div>
                               )}

                               {ex.type === 'speaking' && <InteractiveSpeaking sq={sq} value={studentAns || {}} onChange={(val) => handleAnswerChange(ex._id, ansKey, val)} isSubmitted={isLocked} />}

                               {(ex.type === 'flashcard' || ex.type === 'vocab') && (
                                  <div className="flex flex-col items-center justify-center py-6">
                                     <div onClick={() => setFlippedCards(prev => ({...prev, [`${ex._id}-${ansKey}`]: !prev[`${ex._id}-${ansKey}`]}))} className="cursor-pointer group relative w-full max-w-sm aspect-[4/3] perspective-1000">
                                       <div className={`w-full h-full transition-transform duration-700 transform-style-3d shadow-lg rounded-3xl ${flippedCards[`${ex._id}-${ansKey}`] ? 'rotate-y-180' : ''}`}>
                                         <div className="absolute inset-0 backface-hidden bg-white border border-gray-200 rounded-3xl flex flex-col items-center justify-center p-6 hover:shadow-xl transition-shadow">
                                            <RenderMediaOrText content={sq.question} />
                                            <p className="absolute bottom-4 text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full animate-pulse">Bấm lật thẻ</p>
                                         </div>
                                         <div className="absolute inset-0 backface-hidden bg-blue-50 border border-blue-200 rounded-3xl flex flex-col items-center justify-center p-6 rotate-y-180 shadow-inner">
                                            <div className="text-2xl font-extrabold text-blue-700 text-center leading-tight mb-6"><RenderMediaOrText content={sq.correctAnswer} /></div>
                                            {sq.audioUrl && (
                                              <button onClick={(e) => { e.stopPropagation(); new Audio(sq.audioUrl).play(); }} className="w-14 h-14 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-md hover:scale-110 hover:bg-blue-600 hover:text-white transition-all border border-blue-100">
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
                                   <h4 className="text-lg font-bold text-gray-800 mb-4"><Edit3 size={20} className="inline mr-2 text-blue-500 -mt-1" />{sq.question}</h4>
                                   <textarea disabled={isLocked} value={studentAns || ''} onChange={(e) => handleAnswerChange(ex._id, ansKey, e.target.value)} className={`w-full p-4 border-2 rounded-xl outline-none resize-y font-medium transition-colors min-h-[150px] shadow-sm ${isLocked ? 'bg-gray-100 border-gray-200 text-gray-500' : 'bg-white border-gray-200 focus:border-blue-400 text-gray-700'}`} placeholder="Bắt đầu viết tự luận..." />
                                 </div>
                               )}
                            </div>
                         );
                      })}
                   </div>
                </div>
             ))}
          </div>
        </div>
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
                <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">{!courseData?.price ? 'Miễn phí' : `${courseData?.price.toLocaleString('vi-VN')} đ`}</span>
                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">{courseData?.chapters?.length || 0} Ngày học</span>
              </div>
            </div>

            {/* BUTTON ĐIỀU HƯỚNG THEO TRẠNG THÁI */}
            {!isOwned ? (
              <button onClick={handleBuyNow} className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-bold shadow-sm hover:bg-green-700 transition-colors text-sm">Mua ngay</button>
            ) : !enrollment ? (
              user?.role === 'teacher' || user?.role === 'admin' ? (
                <div className="px-6 py-2.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-lg font-bold text-sm">Chế độ xem trước</div>
              ) : (
                <button onClick={handleEnroll} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-colors text-sm">Bắt đầu học ngay</button>
              )
            ) : (
              <button onClick={handleContinue} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-colors text-sm">Tiếp tục học</button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* LOGIC HIỂN THỊ: NẾU CHƯA SỞ HỮU -> HIỆN KHÓA. NẾU SỞ HỮU -> HIỆN UI TƯƠNG TÁC */}
        {!isOwned ? (
          <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full">
            <div className="w-full lg:w-1/3 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-12">
                <h3 className="font-bold text-slate-800">Ngày học</h3>
                <span className="text-sm text-slate-500">{courseData?.chapters?.length || 0} ngày</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 pb-10">
                <BookOpen size={48} className="mb-4 opacity-50" strokeWidth={1} />
                <p className="font-medium text-sm">Chưa có ngày học</p>
              </div>
            </div>

            <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 rounded-full border-2 border-slate-200 flex items-center justify-center mb-6">
                 <PlayCircle size={32} className="text-slate-300" />
               </div>
               <h3 className="text-xl font-bold text-slate-700 mb-2">Chọn ngày học và nội dung để bắt đầu</h3>
               <p className="text-slate-500 mb-6 max-w-md">Chọn một ngày học và nội dung từ danh sách bên trái để xem<br/><span className="text-slate-300">-------------------------------------------</span></p>
               <h4 className="text-lg font-bold text-blue-700 mb-2">{courseData?.title}</h4>
               <p className="text-slate-600 mb-8">{courseData?.description || "Nội dung chất lượng cao đang chờ bạn khám phá."}</p>
               <button onClick={handleBuyNow} className="bg-[#10b981] hover:bg-[#059669] text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-sm">
                 Mua để mở khóa toàn bộ chương trình học
               </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* CỘT TRÁI (Lộ trình học) - CỦA GIAO DIỆN TƯƠNG TÁC */}
            <aside className="w-full lg:w-[380px] flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 h-fit sticky top-20 max-h-[80vh] flex flex-col">
              <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-wide">Lộ trình học</h3>
              </div>
              <div className="overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {!enrollment && user?.role !== 'teacher' && user?.role !== 'admin' && id !== 'mock-1' ? (
                  <div className="p-6 text-center text-gray-400 text-sm font-medium">Bấm Bắt đầu học để xem chi tiết.</div>
                ) : (
                  courseData?.chapters?.map((chapter, index) => (
                    <div key={chapter._id} className="border border-gray-200 rounded-lg overflow-hidden bg-white mb-2 shadow-sm">
                      <button onClick={() => toggleArray(expandedChapters, setExpandedChapters, chapter._id)} className="w-full flex items-center justify-between p-3 transition-colors hover:bg-gray-50 bg-gray-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-700">{index + 1}</div>
                          <span className="font-extrabold text-gray-800 text-sm text-left">{chapter.title || `Chương ${index + 1}`}</span>
                        </div>
                        {expandedChapters.includes(chapter._id) ? <ChevronDown size={16} className="text-gray-400"/> : <ChevronRight size={16} className="text-gray-400"/>}
                      </button>
                      
                      {expandedChapters.includes(chapter._id) && (
                        <div className="p-2 space-y-2 border-t border-gray-100">
                          {chapter.sections?.map(section => (
                            <div key={section._id} className="bg-white border border-gray-100 rounded-lg shadow-sm">
                              <button onClick={() => toggleArray(expandedSections, setExpandedSections, section._id)} className="w-full flex items-center justify-between p-2.5 text-xs font-bold text-orange-600 hover:bg-orange-50 rounded-t-lg transition-colors">
                                <span className="text-left flex items-center gap-1.5"><BookOpen size={14}/> {section.title}</span>
                                {expandedSections.includes(section._id) ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                              </button>
                              
                              {expandedSections.includes(section._id) && (
                                <div className="p-1.5 space-y-2">
                                  {section.lessons?.map(lesson => {
                                    const isPlaying = activeLesson?._id === lesson._id;
                                    const completed = isLessonCompleted(lesson._id);
                                    const isLessonExpanded = expandedLessons.includes(lesson._id);
                                    
                                    return (
                                      <div key={lesson._id} className={`border rounded-lg overflow-hidden transition-all ${isPlaying ? 'border-blue-200 bg-blue-50/20' : 'border-gray-100 hover:border-gray-200'}`}>
                                        <div className="flex items-center w-full bg-white">
                                          <button onClick={() => loadPreviousAnswers(lesson)} className={`flex-1 flex items-start gap-2 p-2.5 text-xs text-left transition-all ${isPlaying ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                                            {completed ? <CheckCircle2 size={16} className="mt-0.5 text-blue-500" /> : <PlayCircle size={16} className={`mt-0.5 ${isPlaying ? "text-blue-600" : "text-gray-400"}`}/>}
                                            <div className="flex-1 pr-1">
                                              <div className={`font-bold leading-tight mb-1 ${isPlaying ? 'text-blue-800' : 'text-gray-700'}`}>{lesson.title}</div>
                                              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-gray-400">
                                                <span>{formatTime(lesson)}</span>
                                                {lesson.exercises?.length > 0 && <span className="text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">{lesson.exercises.length} Bài tập</span>}
                                              </div>
                                            </div>
                                          </button>
                                          
                                          {lesson.exercises && lesson.exercises.length > 0 && (
                                            <button onClick={(e) => { e.stopPropagation(); toggleArray(expandedLessons, setExpandedLessons, lesson._id); }} className={`p-3 border-l border-gray-100 hover:bg-gray-100 transition-colors ${isLessonExpanded ? 'text-blue-500' : 'text-gray-400'}`}>
                                               {isLessonExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                            </button>
                                          )}
                                        </div>
                                        
                                        {isLessonExpanded && lesson.exercises && lesson.exercises.length > 0 && (
                                          <div className="flex flex-col gap-1 pl-4 border-l-[3px] border-orange-300 ml-4 py-3 bg-gray-50/50">
                                            {lesson.exercises.map((ex, eIdx) => {
                                              let displayedScore = "Chưa HT";
                                              let scoreClass = "text-gray-500 bg-gray-200 border-gray-300";
                                              
                                              if (completed) {
                                                 const prog = enrollment?.progress?.find(p => p.lessonId === lesson._id);
                                                 const ansObj = prog?.answers?.[ex._id];
                                                 const earned = calculateExerciseScore(ex, ansObj);
                                                 const maxPts = ex.questions?.reduce((sum, qGroup) => sum + (qGroup.subQuestions?.reduce((s, sq) => s + (sq.points || 0), 0) || 0), 0) || 0;
                                                 
                                                 displayedScore = `${earned} đ`;
                                                 if (earned >= maxPts && maxPts > 0) scoreClass = "text-green-700 bg-green-100 border-green-200";
                                                 else if (earned > 0) scoreClass = "text-yellow-700 bg-yellow-100 border-yellow-200";
                                                 else scoreClass = "text-red-700 bg-red-100 border-red-200";
                                              }

                                              const handleClickEx = () => { if (!isPlaying) loadPreviousAnswers(lesson); setTimeout(() => scrollToExercise(eIdx), 150); };

                                              return (
                                                <button key={ex._id || eIdx} onClick={handleClickEx} className="text-left flex items-center gap-2 text-[12px] text-gray-600 hover:text-blue-600 py-1.5 pr-3 rounded-md hover:bg-white transition-colors group">
                                                   <PenTool size={14} className="text-orange-400 flex-shrink-0 group-hover:text-blue-500 transition-colors"/>
                                                   <span className="flex-1 truncate font-medium" title={getTypeLabel(ex.type)}>Bài {eIdx + 1}: {getTypeLabel(ex.type)}</span>
                                                   <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap border ${scoreClass}`}>{displayedScore}</span>
                                                </button>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
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

            {/* CỘT PHẢI (Nội dung bài học) - CỦA GIAO DIỆN TƯƠNG TÁC */}
            <main className="w-full flex-1 flex flex-col gap-6">
              {!activeLesson ? (
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
                  <h2 className="text-2xl font-extrabold text-gray-800 mb-2">{courseData?.title}</h2>
                  <p className="text-gray-500 text-sm font-medium">{courseData?.description}</p>
                  <div className="mt-8 p-12 bg-black rounded-xl">
                     <h2 className="text-2xl font-bold text-white">Hãy bấm Bắt đầu học ngay!</h2>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-5 md:p-8 rounded-xl border border-gray-200 shadow-sm text-left relative">
                  <h2 className="text-2xl font-extrabold text-gray-800 mb-6">{activeLesson.title}</h2>
                  
                  <div className="mb-10">
                    <h4 className="font-extrabold text-blue-800 mb-5 flex items-center gap-3 uppercase tracking-wider text-sm">
                      <span className="bg-blue-600 text-white w-7 h-7 rounded-lg flex items-center justify-center shadow-sm">1</span>
                      Nội dung lý thuyết
                    </h4>
                    <div className="bg-black w-full rounded-xl shadow-sm overflow-hidden aspect-video flex items-center justify-center relative border border-gray-200">
                      {renderMedia()}
                    </div>
                  </div>

                  {activeLesson.exercises?.length > 0 && (
                    <div>
                      <h4 className="font-extrabold text-orange-800 mb-6 flex items-center gap-3 uppercase tracking-wider text-sm pt-6 border-t border-gray-100">
                        <span className="bg-orange-600 text-white w-7 h-7 rounded-lg flex items-center justify-center shadow-sm">2</span>
                        Bài tập thực hành đi kèm
                      </h4>
                      
                      <div className="space-y-6">
                        {activeLesson.exercises.map((ex, idx) => renderStudentExercise(ex, idx))}
                      </div>

                      <div className="mt-8 border-t border-gray-100 pt-6">
                         <div className="mb-6 flex flex-wrap items-center gap-2 justify-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-inner">
                            <span className="text-sm font-bold text-gray-500 mr-2">Danh sách Bài tập:</span>
                            {activeLesson.exercises.map((ex, idx) => {
                               const studentAnsObj = answers[ex._id];
                               const isAns = studentAnsObj && Object.keys(studentAnsObj).length > 0;
                               let btnClass = 'bg-white text-gray-500 border-gray-300 hover:bg-gray-100';
                               
                               if (isLessonCompleted(activeLesson._id) && !isRedoing) {
                                  const earned = calculateExerciseScore(ex, studentAnsObj);
                                  const maxPts = ex.questions?.reduce((sum, qGroup) => sum + (qGroup.subQuestions?.reduce((s, sq) => s + (sq.points || 0), 0) || 0), 0) || 0;
                                  if (earned >= maxPts && maxPts > 0) btnClass = 'bg-green-500 text-white border-green-500';
                                  else if (earned > 0) btnClass = 'bg-yellow-500 text-white border-yellow-500';
                                  else btnClass = 'bg-red-500 text-white border-red-500'; 
                               } else if (isAns) { btnClass = 'bg-blue-500 text-white border-blue-500'; }
                               
                               return (
                                <button key={ex._id} onClick={() => scrollToExercise(idx)} type="button" className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-bold border transition-colors shadow-sm ${btnClass}`} title={`Đến bài ${idx + 1}`}>{idx + 1}</button>
                               )
                            })}
                         </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
                    {prevLesson ? <button onClick={() => loadPreviousAnswers(prevLesson)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg shadow-sm transition-colors"><ChevronLeft size={16}/> Bài trước</button> : <div></div>}
                    
                    {user?.role !== 'teacher' && user?.role !== 'admin' ? (
                      <div className="flex gap-3 w-full md:w-auto">
                        {isLessonCompleted(activeLesson._id) && !isRedoing ? (
                          <button onClick={handleRedoLesson} className="font-bold py-3 px-8 rounded-lg shadow-sm bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 flex items-center justify-center gap-2 w-full md:w-auto text-sm transition-colors">
                            <RotateCcw size={18}/> Làm lại bài này
                          </button>
                        ) : (
                          <button onClick={handleSubmitLesson} disabled={isSubmitting} className="font-bold py-3 px-8 rounded-lg shadow-sm bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 w-full md:w-auto text-sm transition-colors disabled:opacity-50">
                            {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle2 size={18}/>}
                            {isSubmitting ? "Đang chấm..." : "Nộp bài"}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="px-6 py-2.5 bg-gray-100 text-gray-500 rounded-lg font-bold text-sm border border-gray-200">Giáo viên xem trước</div>
                    )}
                    {nextLesson ? <button onClick={() => loadPreviousAnswers(nextLesson)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg shadow-sm transition-colors">Bài tiếp <IconNext size={16}/></button> : <div></div>}
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
      <style dangerouslySetColor="text/css">{`.perspective-1000 { perspective: 1000px; } .transform-style-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-y-180 { transform: rotateY(180deg); }`}</style>
    </div>
  );
};