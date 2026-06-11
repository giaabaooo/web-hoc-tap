// src/pages/Teacher/CreateCourse.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Image as ImageIcon, Video, Trash2, FileEdit, Mic, Headphones, ScanLine, Type, FileText, ChevronDown, ChevronUp, ImagePlus, List, X, AlignLeft, ArrowLeft, ArrowUp, ArrowDown, Save, Send } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore'; 

const QuickUploadZone = ({ value, onChange, onUpload, placeholder, type = "text", isAudio = false }) => {
  const isImage = value && value.startsWith('http') && !isAudio;
  const isAudioFile = value && value.startsWith('http') && isAudio;

  const handlePaste = async (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let index in items) {
      if (items[index].kind === 'file' && items[index].type.startsWith('image/')) {
        e.preventDefault();
        onUpload(items[index].getAsFile(), onChange);
        break;
      }
    }
  };
  return (
    <div className="relative w-full group">
      {isImage ? (
        <div className="relative h-20 bg-gray-100 rounded border border-gray-300 flex items-center justify-center p-1">
          <img src={value} className="h-full object-contain rounded" alt="Uploaded" />
          <button onClick={() => onChange('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 shadow-sm">X</button>
        </div>
      ) : isAudioFile ? (
        <div className="relative h-12 bg-blue-50 rounded border border-blue-200 flex items-center px-3">
          <audio src={value} controls className="w-full h-8 outline-none" />
          <button onClick={() => onChange('')} className="ml-2 text-red-500 hover:bg-red-100 p-1 rounded"><X size={16}/></button>
        </div>
      ) : (
        <div className="flex relative">
          <input type={type} value={value} onChange={(e) => onChange(e.target.value)} onPaste={handlePaste} placeholder={placeholder} className="w-full p-2.5 pr-10 border border-gray-300 rounded text-sm outline-none focus:border-blue-400 bg-white" />
          <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-blue-500 p-1">
            {isAudio ? <Headphones size={18} /> : <ImagePlus size={18} />}
            <input type="file" accept={isAudio ? "audio/*" : "image/*"} className="hidden" onChange={(e) => { if(e.target.files[0]) onUpload(e.target.files[0], onChange); }} />
          </label>
        </div>
      )}
    </div>
  );
};

const AudioVisualTrimmer = ({ src, startTime, endTime, onUpdate }) => {
  const audioRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const handleLoadedMetadata = () => { if (audioRef.current) setDuration(audioRef.current.duration); };
  const handleTimeUpdate = () => { if (audioRef.current && endTime > 0 && audioRef.current.currentTime >= endTime) { audioRef.current.pause(); audioRef.current.currentTime = startTime; } };

  return (
    <div className="bg-gray-800 p-3 rounded mt-2">
      <audio ref={audioRef} src={src} onLoadedMetadata={handleLoadedMetadata} onTimeUpdate={handleTimeUpdate} controls className="w-full h-8 mb-3 outline-none" />
      <div className="flex gap-4 items-center bg-gray-900 p-2 rounded text-white">
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Từ giây:</label>
          <input type="range" min="0" max={duration} step="0.5" value={startTime || 0} onChange={(e) => onUpdate('startTime', parseFloat(e.target.value))} className="w-full accent-blue-500" />
          <div className="text-center text-blue-400 text-xs font-bold mt-1">{startTime || 0}s</div>
        </div>
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Đến giây:</label>
          <input type="range" min={startTime || 0} max={duration} step="0.5" value={endTime || duration} onChange={(e) => onUpdate('endTime', parseFloat(e.target.value))} className="w-full accent-red-500" />
          <div className="text-center text-red-400 text-xs font-bold mt-1">{endTime || duration}s</div>
        </div>
      </div>
    </div>
  );
};

const getYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
  return match ? match[1] : null;
};

const LessonPreview = ({ lesson }) => {
  if (!lesson.contentUrl) return <div className="text-gray-400 font-medium text-sm">Khu vực xem trước nội dung</div>;
  if (lesson.type === 'image') return <img src={lesson.contentUrl} alt="Preview" className="w-full h-full object-contain bg-black/5" />;
  if (lesson.type === 'video_upload') return <video src={lesson.contentUrl} controls className="w-full h-full bg-black object-contain" />;
  if (lesson.type === 'youtube') {
    const yId = getYouTubeId(lesson.contentUrl);
    if (yId) return <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${yId}`} frameBorder="0" allowFullScreen></iframe>;
    return <div className="text-red-500 font-medium text-sm text-center px-4">Link YouTube không hợp lệ!</div>;
  }
  return <div className="flex flex-col items-center justify-center p-4 text-blue-500"><FileText size={40} /><span className="text-xs break-all mt-2">{lesson.contentUrl}</span></div>;
};

const getTypeLabel = (type) => {
  switch (type) {
    case 'multiple_choice': return 'Trắc nghiệm (Multiple Choice)';
    case 'fill_blank': return 'Điền vào chỗ trống (Fill Blank)';
    case 'speaking': return 'Luyện nói AI (Speaking)';
    case 'listening': return 'Luyện nghe (Listening)';
    case 'matching': return 'Nối từ (Matching)';
    case 'flashcard': return 'Thẻ từ vựng (Flashcard)';
    case 'reading': return 'Bài đọc hiểu (Reading)';
    case 'essay': return 'Tự luận (Essay)';
    default: return 'Bài tập';
  }
};

export const CreateCourse = () => {
  const { token } = useAuthStore();
  const navigate = useNavigate(); 
  const [isUploading, setIsUploading] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(true); 
  const [collapsed, setCollapsed] = useState({ chapters: {}, sections: {}, lessons: {}, exercises: {}, questions: {} });
  
  const [courseInfo, setCourseInfo] = useState({ title: '', description: '', subject: 'Tiếng Anh', tag: 'Cơ bản', price: '', thumbnail: '' });
  const [chapters, setChapters] = useState([ { badgeText: 'Chương 1', title: '', sections: [{ title: '', lessons: [{ title: '', type: 'video_upload', contentUrl: '', exercises: [] }] }] } ]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [lastSavedData, setLastSavedData] = useState('');
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!courseInfo.title.trim()) return; 
      const currentDataStr = JSON.stringify({ courseInfo, chapters });
      if (currentDataStr !== lastSavedData) {
        handleSaveCourse(false, true); 
        setLastSavedData(currentDataStr);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [courseInfo, chapters, lastSavedData]);

  const handleInfoChange = (e) => setCourseInfo({ ...courseInfo, [e.target.name]: e.target.value });
  const toggleCollapse = (type, id) => setCollapsed(prev => ({ ...prev, [type]: { ...prev[type], [id]: !prev[type][id] } }));

  // FIX: Sửa lại hàm cuộn để chỉ cuộn phần nội dung bên trong thay vì cuộn toàn màn hình
  const scrollToElement = (type, cIndex, sIndex, lIndex, eIndex = null) => {
    setCollapsed(prev => {
      const newCol = { ...prev };
      newCol.chapters[`chapter-${cIndex}`] = false;
      if (type === 'section' || type === 'lesson' || type === 'exercise') newCol.sections[`section-${cIndex}-${sIndex}`] = false;
      if (type === 'lesson' || type === 'exercise') newCol.lessons[`lesson-${cIndex}-${sIndex}-${lIndex}`] = false;
      if (type === 'exercise') newCol.exercises[`exercise-${cIndex}-${sIndex}-${lIndex}-${eIndex}`] = false;
      return newCol;
    });
    
    setTimeout(() => {
      let elId = '';
      if (type === 'chapter') elId = `chapter-${cIndex}`;
      else if (type === 'section') elId = `section-${cIndex}-${sIndex}`;
      else if (type === 'lesson') elId = `lesson-${cIndex}-${sIndex}-${lIndex}`;
      else if (type === 'exercise') elId = `exercise-${cIndex}-${sIndex}-${lIndex}-${eIndex}`;
      
      const el = document.getElementById(elId);
      const scrollContainer = document.getElementById('main-content-scroll'); // ID của khu vực cuộn
      
      if (el && scrollContainer) {
        const yOffset = -20; // Cách top một chút cho đẹp
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = el.getBoundingClientRect();
        
        // Tính toán vị trí tương đối để cuộn
        const scrollTop = elementRect.top - containerRect.top + scrollContainer.scrollTop + yOffset;
        
        scrollContainer.scrollTo({ top: scrollTop, behavior: 'smooth' });
      }
    }, 150);
  };

  const validateData = () => {
    if (!courseInfo.title.trim()) return "Vui lòng nhập Tên khóa học!";
    if (!courseInfo.thumbnail) return "Vui lòng tải lên Ảnh bìa!";
    return null;
  };

  const handleSaveCourse = async (isPublished = true, isSilent = false) => {
    if (isPublished) {
      const errorMsg = validateData();
      if (errorMsg) return toast.warning(errorMsg);
    }
    if (!isSilent) setIsSavingDraft(true);
    try {
      await axios.post(`${API_URL}/api/courses`, { ...courseInfo, chapters, isPublished }, { headers: { Authorization: `Bearer ${token}` } });
      setLastSavedData(JSON.stringify({ courseInfo, chapters }));
      
      if (!isSilent) {
        toast.success(isPublished ? 'Xuất bản thành công!' : 'Đã lưu nháp!');
        if (isPublished) navigate('/teacher-dashboard');
      }
    } catch (error) { 
      if (!isSilent) toast.error('Lỗi khi lưu!'); 
    } finally { 
      if (!isSilent) setIsSavingDraft(false); 
    }
  };

  const uploadFileToServer = async (file, callback) => {
    setIsUploading(true); toast.info("Đang tải file...");
    const formData = new FormData(); formData.append('file', file);
    try {
      const res = await axios.post(`${API_URL}/api/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }});
      callback(res.data.secure_url); toast.success("Thành công!");
    } catch (err) { toast.error("Lỗi upload!"); }
    setIsUploading(false);
  };

  const handleFileUpload = (e, callback) => { if(e.target.files[0]) uploadFileToServer(e.target.files[0], callback); };

  const moveItem = (arr, index, direction) => {
    const newArr = [...arr];
    if (direction === 'up' && index > 0) { [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]]; } 
    else if (direction === 'down' && index < newArr.length - 1) { [newArr[index], newArr[index + 1]] = [newArr[index + 1], newArr[index]]; }
    return newArr;
  };

  const moveChapter = (cIndex, dir) => setChapters(moveItem(chapters, cIndex, dir));
  const moveSection = (cIndex, sIndex, dir) => { const newC = [...chapters]; newC[cIndex].sections = moveItem(newC[cIndex].sections, sIndex, dir); setChapters(newC); };
  const moveLesson = (cIndex, sIndex, lIndex, dir) => { const newC = [...chapters]; newC[cIndex].sections[sIndex].lessons = moveItem(newC[cIndex].sections[sIndex].lessons, lIndex, dir); setChapters(newC); };
  const moveExercise = (cIndex, sIndex, lIndex, eIndex, dir) => { const newC = [...chapters]; newC[cIndex].sections[sIndex].lessons[lIndex].exercises = moveItem(newC[cIndex].sections[sIndex].lessons[lIndex].exercises, eIndex, dir); setChapters(newC); };
  const moveQuestion = (cIndex, sIndex, lIndex, eIndex, qIndex, dir) => { const newC = [...chapters]; newC[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].questions = moveItem(newC[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].questions, qIndex, dir); setChapters(newC); };

  const addChapter = () => setChapters([...chapters, { badgeText: `Chương ${chapters.length + 1}`, title: '', sections: [] }]);
  const removeChapter = (cIndex) => { const newChapters = [...chapters]; newChapters.splice(cIndex, 1); setChapters(newChapters); };
  const addSection = (cIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections.push({ title: '', lessons: [] }); setChapters(newChapters); };
  const removeSection = (cIndex, sIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections.splice(sIndex, 1); setChapters(newChapters); };
  const addLesson = (cIndex, sIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons.push({ title: '', type: 'video_upload', contentUrl: '', exercises: [] }); setChapters(newChapters); };
  const updateLesson = (cIndex, sIndex, lIndex, field, value) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons[lIndex][field] = value; if(field==='type') newChapters[cIndex].sections[sIndex].lessons[lIndex].contentUrl = ''; setChapters(newChapters); };
  const removeLesson = (cIndex, sIndex, lIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons.splice(lIndex, 1); setChapters(newChapters); };
  
  const addExercise = (cIndex, sIndex, lIndex) => { 
    const newChapters = [...chapters]; 
    newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises.push({ 
      type: 'multiple_choice', instruction: '', contentUrl: '', passage: '', startTime: 0, endTime: 0, 
      questions: [{ question: '', options: ['', '', '', ''], correctAnswer: '', points: 10, contentUrl: '', audioUrl: '' }] 
    }); 
    setChapters(newChapters); 
  };

  const updateExercise = (cIndex, sIndex, lIndex, eIndex, field, value) => { 
    const newChapters = [...chapters]; 
    newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex][field] = value; 
    
    if (field === 'type') {
      const type = value; 
      let opts = [];
      if (['multiple_choice', 'listening', 'reading'].includes(type)) opts = ['', '', '', '']; 
      else if (type === 'matching') opts = ['|', '|', '|', '|']; 
      else if (type === 'speaking') opts = []; 
      
      newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].questions = [{
         question: '', options: opts, correctAnswer: '', points: 10, contentUrl: '', audioUrl: ''
      }];
    } 
    setChapters(newChapters); 
  };
  const removeExercise = (cIndex, sIndex, lIndex, eIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises.splice(eIndex, 1); setChapters(newChapters); };
  
  const addQuestion = (cIndex, sIndex, lIndex, eIndex) => {
    const newChapters = [...chapters];
    const ex = newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex];
    let opts = [];
    if (['multiple_choice', 'listening', 'reading'].includes(ex.type)) opts = ['', '', '', ''];
    else if (ex.type === 'matching') opts = ['|', '|', '|', '|'];
    else if (ex.type === 'speaking') opts = [];

    ex.questions.push({ question: '', options: opts, correctAnswer: '', points: 10, contentUrl: '', audioUrl: '' });
    setChapters(newChapters);
  };
  const updateQuestion = (cIndex, sIndex, lIndex, eIndex, qIndex, field, val) => { const newC = [...chapters]; newC[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].questions[qIndex][field] = val; setChapters(newC); };
  const removeQuestion = (cIndex, sIndex, lIndex, eIndex, qIndex) => { const newC = [...chapters]; newC[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].questions.splice(qIndex, 1); setChapters(newC); };
  
  const addOption = (cIndex, sIndex, lIndex, eIndex, qIndex, isMatching = false) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].questions[qIndex].options.push(isMatching ? '|' : ''); setChapters(newChapters); };
  const removeOption = (cIndex, sIndex, lIndex, eIndex, qIndex, optIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].questions[qIndex].options.splice(optIndex, 1); setChapters(newChapters); };
  const updateOption = (cIndex, sIndex, lIndex, eIndex, qIndex, optIndex, value) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].questions[qIndex].options[optIndex] = value; setChapters(newChapters); };
  const updateMatchingOption = (cIndex, sIndex, lIndex, eIndex, qIndex, optIndex, side, value) => { const newChapters = [...chapters]; let currentVal = newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].questions[qIndex].options[optIndex] || '|'; let parts = currentVal.split('|'); parts[side === 'left' ? 0 : 1] = value; newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].questions[qIndex].options[optIndex] = parts.join('|'); setChapters(newChapters); };
  
  const renderQuestionForm = (exType, q, cIndex, sIndex, lIndex, eIndex, qIndex) => {
    const qKey = `question-${cIndex}-${sIndex}-${lIndex}-${eIndex}-${qIndex}`;
    const isQCollapsed = collapsed.questions[qKey];

    return (
      <div key={qIndex} id={qKey} className="bg-white rounded-xl border border-blue-100 shadow-sm relative overflow-hidden transition-all mt-4">
        
        <div className="bg-blue-50/40 border-b border-blue-100 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
             <span className="bg-blue-500 text-white w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shadow-sm">{qIndex + 1}</span>
             <span className="font-extrabold text-blue-800 text-sm">Nội dung Câu hỏi {qIndex + 1}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
              <span className="text-xs font-bold text-gray-500">Điểm:</span>
              <input type="number" value={q.points} onChange={(e) => updateQuestion(cIndex, sIndex, lIndex, eIndex, qIndex, 'points', Number(e.target.value))} className="w-12 bg-transparent outline-none font-bold text-sm text-center text-blue-700" />
            </div>
            <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
              <button onClick={() => moveQuestion(cIndex, sIndex, lIndex, eIndex, qIndex, 'up')} className="p-1 hover:bg-gray-100 rounded text-gray-400 transition-colors"><ArrowUp size={14}/></button>
              <button onClick={() => moveQuestion(cIndex, sIndex, lIndex, eIndex, qIndex, 'down')} className="p-1 hover:bg-gray-100 rounded text-gray-400 transition-colors"><ArrowDown size={14}/></button>
              <button onClick={() => toggleCollapse('questions', qKey)} className="p-1 hover:bg-blue-50 rounded text-blue-500 ml-1 transition-colors">{isQCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}</button>
              <div className="w-px bg-gray-200 mx-1"></div>
              <button onClick={() => removeQuestion(cIndex, sIndex, lIndex, eIndex, qIndex)} className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors"><Trash2 size={14}/></button>
            </div>
          </div>
        </div>

        {!isQCollapsed && (
          <div className="p-5">
             
            {(exType === 'multiple_choice' || exType === 'listening' || exType === 'reading') && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Nội dung câu hỏi</label>
                  <textarea value={q.question} onChange={(e) => updateQuestion(cIndex, sIndex, lIndex, eIndex, qIndex, 'question', e.target.value)} placeholder="Nhập câu hỏi..." className="w-full text-base font-semibold outline-none border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50" rows="2" />
                </div>
                
                {exType === 'multiple_choice' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Ảnh đính kèm cho riêng câu này (Tùy chọn)</label>
                    <QuickUploadZone value={q.contentUrl || ''} onChange={(url) => updateQuestion(cIndex, sIndex, lIndex, eIndex, qIndex, 'contentUrl', url)} onUpload={uploadFileToServer} placeholder="Nhập Link hoặc dán ảnh vào đây..." />
                  </div>
                )}
                
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Thiết lập các đáp án</label>
                    <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md border border-gray-200 mt-2 sm:mt-0">
                      💡 Chọn vào ô tick xanh để set đáp án ĐÚNG
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className={`p-4 rounded-xl border-2 transition-all relative group ${q.correctAnswer === opt && opt !== '' ? 'border-green-500 bg-green-50/40 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${q.correctAnswer === opt && opt !== '' ? 'border-green-500 bg-green-500' : 'border-gray-400 bg-white group-hover:border-blue-400'}`}>
                              {q.correctAnswer === opt && opt !== '' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                            <input type="radio" name={`correct-${cIndex}-${sIndex}-${lIndex}-${eIndex}-${qIndex}`} checked={q.correctAnswer === opt && opt !== ''} onChange={() => updateQuestion(cIndex, sIndex, lIndex, eIndex, qIndex, 'correctAnswer', opt)} className="hidden" />
                            <span className={`font-extrabold text-sm ${q.correctAnswer === opt && opt !== '' ? 'text-green-700' : 'text-gray-600'}`}>
                              Đáp án {String.fromCharCode(65 + oIdx)}
                            </span>
                          </label>
                          <button onClick={() => removeOption(cIndex, sIndex, lIndex, eIndex, qIndex, oIdx)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"><X size={16}/></button>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-1">
                          <QuickUploadZone value={opt} onChange={(val) => updateOption(cIndex, sIndex, lIndex, eIndex, qIndex, oIdx, val)} onUpload={uploadFileToServer} placeholder={`Nhập nội dung đáp án ${String.fromCharCode(65 + oIdx)}...`} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => addOption(cIndex, sIndex, lIndex, eIndex, qIndex)} className="mt-5 flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-bold text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all">
                    <Plus size={18}/> Thêm lựa chọn đáp án
                  </button>
                </div>
              </div>
            )}

            {exType === 'fill_blank' && (
              <div className="space-y-5">
                <div className="text-sm text-blue-800 bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center gap-2 font-medium">
                  <Type size={18} className="text-blue-600"/> 
                  <span>Mẹo: Dùng 3 dấu gạch dưới <b>___</b> để định vị một khoảng trống trong câu.</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Nội dung câu hỏi (chứa chỗ trống)</label>
                  <textarea value={q.question} onChange={(e) => updateQuestion(cIndex, sIndex, lIndex, eIndex, qIndex, 'question', e.target.value)} placeholder="VD: I go to ___ every morning." className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-400 bg-gray-50 font-medium" rows="3" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Đáp án chuẩn xác</label>
                  <input type="text" value={q.correctAnswer} onChange={(e) => updateQuestion(cIndex, sIndex, lIndex, eIndex, qIndex, 'correctAnswer', e.target.value)} placeholder="Nhập từ cần điền (VD: school)" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-50 font-bold text-green-700 bg-white" />
                </div>
              </div>
            )}

            {exType === 'speaking' && (
              <div className="space-y-6">
                 <div>
                   <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Nội dung câu hỏi hiển thị</label>
                   <input type="text" value={q.question} onChange={(e) => updateQuestion(cIndex, sIndex, lIndex, eIndex, qIndex, 'question', e.target.value)} placeholder="Nhập đề bài cho học sinh..." className="w-full text-base font-bold outline-none border border-gray-300 rounded-lg p-3 focus:border-blue-500 bg-gray-50" />
                 </div>
                 
                 <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                    <label className="block text-sm font-extrabold text-blue-800 mb-2 uppercase">Lựa chọn đáp án nâng cao (Tùy chọn)</label>
                    <p className="text-xs text-gray-600 mb-4 font-medium">Nếu thêm, học sinh phải CHỌN đáp án đúng rồi mới đọc. Nếu để trống, học sinh chỉ cần bấm Mic và đọc.</p>
                    <div className="space-y-3 mb-4">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className={`flex items-center gap-3 p-2.5 rounded-lg border shadow-sm ${q.correctAnswer === opt && opt !== '' ? 'border-green-500 bg-green-50' : 'bg-white border-gray-200'}`}>
                           <input type="radio" name={`spk-${cIndex}-${sIndex}-${lIndex}-${eIndex}-${qIndex}`} checked={q.correctAnswer === opt && opt !== ''} onChange={() => updateQuestion(cIndex, sIndex, lIndex, eIndex, qIndex, 'correctAnswer', opt)} className="cursor-pointer w-4 h-4 ml-2" />
                           <div className="flex-1">
                             <QuickUploadZone value={opt} onChange={(val) => updateOption(cIndex, sIndex, lIndex, eIndex, qIndex, oIdx, val)} onUpload={uploadFileToServer} placeholder="Dán ảnh hoặc nhập Text đáp án..." />
                           </div>
                           <button onClick={() => removeOption(cIndex, sIndex, lIndex, eIndex, qIndex, oIdx)} className="text-gray-400 hover:text-red-500 p-2"><X size={18}/></button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => addOption(cIndex, sIndex, lIndex, eIndex, qIndex)} className="text-sm text-blue-700 font-bold bg-white px-4 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 shadow-sm">+ Thêm lựa chọn</button>
                 </div>
                 
                 {(!q.options || q.options.length === 0) && (
                   <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2 uppercase flex items-center gap-2"><Mic size={16}/> Cấu hình từ khóa chấm điểm (AI)</label>
                      <input type="text" value={q.correctAnswer} onChange={(e) => updateQuestion(cIndex, sIndex, lIndex, eIndex, qIndex, 'correctAnswer', e.target.value)} placeholder="Nhập đoạn text để AI so sánh chấm giọng đọc (VD: Hello World)" className="w-full text-base font-mono bg-white border border-gray-300 p-3 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-50 text-green-700 font-bold" />
                   </div>
                 )}
              </div>
            )}

            {exType === 'matching' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Yêu cầu nối từ</label>
                  <input type="text" value={q.question} onChange={(e) => updateQuestion(cIndex, sIndex, lIndex, eIndex, qIndex, 'question', e.target.value)} placeholder="Nhập câu hỏi hoặc yêu cầu bài tập..." className="w-full text-base font-bold outline-none border border-gray-300 rounded-lg p-3 focus:border-blue-500 bg-gray-50" />
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex gap-4 items-center mb-3 font-extrabold text-gray-600 px-2 text-xs uppercase tracking-wide">
                    <div className="flex-1 text-center bg-white py-1 rounded border shadow-sm">Cột A</div>
                    <div className="w-24 text-center">Nối với</div>
                    <div className="flex-1 text-center bg-white py-1 rounded border shadow-sm">Cột B</div>
                    <div className="w-8"></div>
                  </div>
                  <div className="space-y-3">
                    {q.options.map((opt, oIdx) => {
                      const parts = opt.split('|');
                      return (
                        <div key={oIdx} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-all">
                          <div className="flex-1">
                            <QuickUploadZone value={parts[0]||''} onChange={(val) => updateMatchingOption(cIndex, sIndex, lIndex, eIndex, qIndex, oIdx, 'left', val)} onUpload={uploadFileToServer} placeholder="Nội dung A..." />
                          </div>
                          
                          <div className="w-24 flex flex-col items-center justify-center text-gray-400 bg-gray-50 h-full rounded-lg">
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                          </div>

                          <div className="flex-1">
                            <QuickUploadZone value={parts[1]||''} onChange={(val) => updateMatchingOption(cIndex, sIndex, lIndex, eIndex, qIndex, oIdx, 'right', val)} onUpload={uploadFileToServer} placeholder="Nội dung B..." />
                          </div>
                          <div className="w-8 flex justify-center">
                            <button onClick={() => removeOption(cIndex, sIndex, lIndex, eIndex, qIndex, oIdx)} className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-md transition-colors"><X size={18}/></button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <button onClick={() => addOption(cIndex, sIndex, lIndex, eIndex, qIndex, true)} className="mt-5 text-sm text-blue-700 font-bold bg-white px-5 py-2.5 rounded-lg border-2 border-dashed border-blue-300 hover:bg-blue-50 w-full shadow-sm">+ Thêm cặp đáp án mới</button>
                </div>
              </div>
            )}

            {(exType === 'flashcard' || exType === 'vocab') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-xs font-extrabold text-blue-800 mb-2 uppercase">Mặt Trước Thẻ (Front)</label>
                    <div className="border border-blue-100 bg-blue-50/20 p-2 rounded-xl">
                      <QuickUploadZone value={q.question} onChange={(val) => updateQuestion(cIndex, sIndex, lIndex, eIndex, qIndex, 'question', val)} onUpload={uploadFileToServer} placeholder="Dán ảnh hoặc nhập từ vựng..." />
                    </div>
                 </div>
                 <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-extrabold text-orange-800 mb-2 uppercase">Mặt Sau Thẻ (Nghĩa/Giải thích)</label>
                      <input type="text" value={q.correctAnswer} onChange={(e) => updateQuestion(cIndex, sIndex, lIndex, eIndex, qIndex, 'correctAnswer', e.target.value)} placeholder="Nhập văn bản nghĩa mặt sau..." className="w-full p-3 border border-orange-200 rounded-xl text-sm outline-none bg-orange-50/20 focus:border-orange-400" />
                   </div>
                   <div>
                      <label className="block text-xs font-extrabold text-orange-800 mb-2 uppercase">Âm thanh đi kèm mặt sau (Audio)</label>
                      <div className="border border-orange-200 rounded-xl overflow-hidden">
                        <QuickUploadZone value={q.audioUrl || ''} onChange={(val) => updateQuestion(cIndex, sIndex, lIndex, eIndex, qIndex, 'audioUrl', val)} onUpload={uploadFileToServer} placeholder="Tải lên hoặc dán link Audio" type="text" isAudio={true} />
                      </div>
                   </div>
                 </div>
              </div>
            )}

            {exType === 'essay' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Đề bài tự luận</label>
                  <textarea value={q.question} onChange={(e) => updateQuestion(cIndex, sIndex, lIndex, eIndex, qIndex, 'question', e.target.value)} placeholder="Nhập đề bài tự luận chi tiết..." className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-400 bg-gray-50" rows="3" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Barem Chấm Điểm / Keyword (Cho giáo viên)</label>
                  <textarea value={q.correctAnswer} onChange={(e) => updateQuestion(cIndex, sIndex, lIndex, eIndex, qIndex, 'correctAnswer', e.target.value)} placeholder="Ghi chú barem chấm điểm..." className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none bg-gray-100 font-medium text-gray-700" rows="3" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderExerciseForm = (exercise, cIndex, sIndex, lIndex, eIndex) => {
    const exKey = `exercise-${cIndex}-${sIndex}-${lIndex}-${eIndex}`;
    const isExCollapsed = collapsed.exercises[exKey];

    return (
      <div key={eIndex} id={exKey} className="bg-white rounded-xl border border-gray-200 shadow-md relative scroll-mt-24 overflow-hidden mb-6">
        
        <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="bg-orange-500 text-white w-7 h-7 rounded-md flex items-center justify-center font-extrabold text-sm shadow-sm">
              {eIndex + 1}
            </span>
            <span className="font-extrabold text-gray-800 uppercase tracking-wide text-sm">
              Block Bài Tập: {getTypeLabel(exercise.type)}
            </span>
          </div>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            <button onClick={() => moveExercise(cIndex, sIndex, lIndex, eIndex, 'up')} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors"><ArrowUp size={14}/></button>
            <button onClick={() => moveExercise(cIndex, sIndex, lIndex, eIndex, 'down')} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors"><ArrowDown size={14}/></button>
            <button onClick={() => toggleCollapse('exercises', exKey)} className="p-1.5 hover:bg-orange-50 rounded text-orange-500 ml-1 transition-colors">{isExCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}</button>
            <div className="w-px bg-gray-200 mx-1"></div>
            <button onClick={() => removeExercise(cIndex, sIndex, lIndex, eIndex)} className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors"><Trash2 size={14}/></button>
          </div>
        </div>
        
        {!isExCollapsed && (
          <div className="p-5 space-y-6">
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Đổi Dạng Block Bài Tập</label>
              <select value={exercise.type} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'type', e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white font-bold text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all">
                <option value="multiple_choice">Trắc nghiệm (Multiple Choice)</option>
                <option value="fill_blank">Điền vào chỗ trống (Fill Blank)</option>
                <option value="speaking">Luyện nói AI (Speaking)</option>
                <option value="listening">Luyện nghe (Listening)</option>
                <option value="matching">Nối từ (Matching)</option>
                <option value="flashcard">Thẻ từ vựng (Flashcard)</option>
                <option value="reading">Bài đọc hiểu (Reading)</option>
                <option value="essay">Tự luận (Essay)</option>
              </select>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Hướng Dẫn Làm Bài Chung (Tùy chọn)</label>
                <input type="text" value={exercise.instruction || ''} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'instruction', e.target.value)} placeholder="VD: Lắng nghe đoạn audio và chọn đáp án đúng..." className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none bg-yellow-50/40 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 transition-all" />
              </div>

              {exercise.type === 'reading' && (
                <div>
                   <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Bài Đọc Chung (Passage) - Ctrl+V để dán ảnh</label>
                   <QuickUploadZone value={exercise.passage} onChange={(val) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'passage', val)} onUpload={uploadFileToServer} placeholder="Nhập văn bản bài đọc hoặc dán ảnh vào đây..." />
                 </div>
              )}

              {exercise.type === 'listening' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-3 uppercase">File Audio Chung & Cắt ghép</label>
                  <div className="flex items-center gap-3 mb-4">
                    <input type="text" value={exercise.contentUrl || ''} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'contentUrl', e.target.value)} placeholder="Nhập Link MP3..." className="flex-1 p-3 text-sm border border-gray-300 rounded-lg bg-gray-50 outline-none focus:border-blue-400" />
                    <label className="bg-blue-50 text-blue-600 border border-blue-200 px-5 py-3 rounded-lg text-sm font-bold cursor-pointer hover:bg-blue-100 transition-colors shadow-sm whitespace-nowrap"> 
                      Tải Audio <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'contentUrl', url))} /> 
                    </label>
                  </div>
                  {exercise.contentUrl && <AudioVisualTrimmer src={exercise.contentUrl} startTime={exercise.startTime} endTime={exercise.endTime} onUpdate={(field, val) => updateExercise(cIndex, sIndex, lIndex, eIndex, field, val)} />}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6 mt-4">
              <h4 className="font-extrabold text-gray-700 uppercase tracking-wide text-sm flex items-center gap-2 mb-2">
                <List size={18}/> Danh sách câu hỏi trong Block này
              </h4>
              
              <div className="space-y-4">
                {exercise.questions && exercise.questions.map((q, qIndex) => renderQuestionForm(exercise.type, q, cIndex, sIndex, lIndex, eIndex, qIndex))}
              </div>

              <button onClick={() => addQuestion(cIndex, sIndex, lIndex, eIndex)} className="mt-6 text-sm text-blue-600 font-bold bg-white w-full py-3.5 rounded-xl border-2 border-dashed border-blue-300 hover:bg-blue-50 shadow-sm transition-all flex items-center justify-center gap-2">
                <Plus size={18}/> Thêm Câu Hỏi Cùng Dạng Vào Block Này
              </button>
            </div>

          </div>
        )}
      </div>
    );
  };

  if (isUploading && chapters.length === 0) return <div className="flex items-center justify-center min-h-screen text-blue-500">Đang tải...</div>;

  return (
    // FIX 1: Đổi layout gốc thành Fixed, chặn cuộn toàn cửa sổ
    <div className="flex w-full font-sans h-screen overflow-hidden bg-[#f8fafc]">
      
      {/* SIDEBAR MỤC LỤC - Sẽ tự động đầy đủ chiều cao và đứng yên do nằm trong flex cố định */}
      {isTocOpen && (
        <aside className="w-72 flex-shrink-0 bg-white border-r border-gray-200 shadow-sm flex flex-col z-40 h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Mục lục khóa học</h3>
            <button onClick={() => setIsTocOpen(false)} className="text-gray-400 hover:text-gray-800 p-1 rounded-md hover:bg-gray-100">
              <X size={16}/>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
            {chapters.map((ch, cIndex) => (
              <div key={cIndex} className="mb-2">
                <div className="font-bold text-sm text-blue-600 mb-1.5 cursor-pointer hover:underline truncate" onClick={() => scrollToElement('chapter', cIndex)}>
                  {ch.badgeText || `Chương ${cIndex+1}`} {ch.title ? `- ${ch.title}` : ''}
                </div>
                
                {ch.sections.map((sec, sIndex) => (
                  <div key={sIndex} className="pl-3 border-l-2 border-blue-100 ml-1.5 mt-1 space-y-1.5 pb-1">
                    <div className="text-xs font-bold text-orange-500 hover:underline cursor-pointer truncate" onClick={() => scrollToElement('section', cIndex, sIndex)}>
                      {sIndex + 1}. {sec.title || `Buổi ${sIndex+1}`}
                    </div>
                    
                    {sec.lessons.map((les, lIndex) => (
                      <div key={lIndex} className="space-y-1">
                        <div className="text-xs font-medium text-gray-700 hover:text-blue-600 cursor-pointer truncate pl-2" onClick={() => scrollToElement('lesson', cIndex, sIndex, lIndex)}>
                            - {les.title || `Bài học ${lIndex+1}`}
                        </div>
                        
                        {les.exercises && les.exercises.length > 0 && (
                          <div className="pl-6 space-y-1.5 mt-1">
                            {les.exercises.map((ex, eIndex) => (
                              <div key={eIndex} className="text-[11px] text-gray-500 hover:text-orange-500 cursor-pointer truncate" onClick={() => scrollToElement('exercise', cIndex, sIndex, lIndex, eIndex)}>
                                Block bài tập {eIndex + 1}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* CỘT PHẢI (Chứa Topbar và Nội dung) */}
      <div className="flex-1 flex flex-col relative min-w-0 h-full">
        
        {/* THANH TOPBAR - Không dùng sticky nữa, nó sẽ dính chặt ở trên cùng nhờ cấu trúc flex-col */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 shadow-sm flex items-center justify-between z-30 flex-shrink-0">
          <div className="flex items-center gap-3">
            {!isTocOpen && (
              <button onClick={() => setIsTocOpen(true)} className="p-2 hover:bg-gray-100 rounded text-gray-500 transition-colors">
                <AlignLeft size={20} />
              </button>
            )}
            <h2 className="text-xl font-extrabold text-gray-800 tracking-tight truncate max-w-xs md:max-w-md hidden sm:block">
              {courseInfo.title ? courseInfo.title : "Trình Tạo Khóa Học"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-400 font-medium hidden md:inline-block mr-2">
              {isSavingDraft ? "Đang lưu..." : "Hệ thống tự động lưu sau 5s"}
            </span>
            <button onClick={() => handleSaveCourse(false)} disabled={isSavingDraft || isUploading} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors bg-white shadow-sm">
              <Save size={16}/> <span className="hidden md:inline">Lưu Bản Nháp</span>
            </button>
            <button onClick={() => handleSaveCourse(true)} disabled={isSavingDraft || isUploading} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md transition-all">
              <Send size={16}/> <span className="hidden md:inline">Xuất Bản</span>
            </button>
          </div>
        </div>

        {/* FIX 2: KHU VỰC NỘI DUNG RIÊNG BIỆT ĐƯỢC PHÉP CUỘN - Gắn ID để hàm cuộn nhận diện */}
        <div id="main-content-scroll" className="flex-1 overflow-y-auto relative w-full custom-scrollbar">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 pb-32">
            
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 mb-8 mt-2">
               <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-6 uppercase tracking-wide">Thông tin cơ bản</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div><label className="block text-sm font-bold mb-1.5 text-gray-700">Tên khóa học *</label><input type="text" name="title" value={courseInfo.title} onChange={handleInfoChange} className="w-full p-3.5 border border-gray-300 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" /></div>
                    <div><label className="block text-sm font-bold mb-1.5 text-gray-700">Mô tả khóa học</label><textarea name="description" value={courseInfo.description} onChange={handleInfoChange} rows="4" className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100 transition-all"></textarea></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div><label className="block text-sm font-bold mb-1.5 text-gray-700">Môn học</label><select name="subject" value={courseInfo.subject} onChange={handleInfoChange} className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 outline-none"><option>Tiếng Anh</option><option>Toán</option></select></div>
                      <div><label className="block text-sm font-bold mb-1.5 text-gray-700">Phân loại</label><select name="tag" value={courseInfo.tag} onChange={handleInfoChange} className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 outline-none"><option>Cơ bản</option><option>Nâng cao</option></select></div>
                      <div><label className="block text-sm font-bold mb-1.5 text-gray-700">Giá (VNĐ) *</label><input type="number" name="price" value={courseInfo.price} onChange={handleInfoChange} className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-orange-100" /></div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Ảnh bìa (Thumbnail) *</label>
                    <div className="flex-1 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 flex items-center justify-center relative overflow-hidden group hover:bg-gray-100 transition-colors min-h-[300px]">
                      {courseInfo.thumbnail ? (
                        <img src={courseInfo.thumbnail} className="w-full h-full object-cover absolute" alt="Cover" />
                      ) : <span className="text-gray-400 font-bold flex flex-col items-center gap-2"><ImageIcon size={40} className="opacity-50" /> Bấm hoặc kéo thả ảnh</span>}
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setCourseInfo(prev => ({ ...prev, thumbnail: url })))} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
               </div>
            </div>

            <div className="space-y-8">
              {chapters.map((chapter, cIndex) => {
                const chapKey = `chapter-${cIndex}`;
                const isChapCollapsed = collapsed.chapters[chapKey];
                
                return (
                <div key={cIndex} id={chapKey} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-blue-200 relative scroll-mt-24">
                  <div className="absolute top-6 right-6 flex gap-1">
                     <button onClick={() => moveChapter(cIndex, 'up')} className="p-1.5 bg-gray-50 hover:bg-gray-200 rounded text-gray-500"><ArrowUp size={16}/></button>
                     <button onClick={() => moveChapter(cIndex, 'down')} className="p-1.5 bg-gray-50 hover:bg-gray-200 rounded text-gray-500"><ArrowDown size={16}/></button>
                     <button onClick={() => toggleCollapse('chapters', chapKey)} className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded ml-2">{isChapCollapsed ? <ChevronDown size={16}/> : <ChevronUp size={16}/>}</button>
                     <button onClick={() => removeChapter(cIndex)} className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded"><Trash2 size={16}/></button>
                  </div>

                  <div className="flex items-center gap-4 mb-6 pr-36 border-b-2 border-blue-100 pb-4">
                    <input type="text" value={chapter.badgeText !== undefined ? chapter.badgeText : `Chương ${cIndex + 1}`} onChange={(e) => { const newChapters = [...chapters]; newChapters[cIndex].badgeText = e.target.value; setChapters(newChapters); }} className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-1.5 rounded-lg font-bold text-sm shadow-sm w-32 text-center outline-none focus:ring-2 focus:ring-blue-300 placeholder-white/70" placeholder="VD: Chương 1" />
                    <input type="text" value={chapter.title} onChange={(e) => { const newChapters = [...chapters]; newChapters[cIndex].title = e.target.value; setChapters(newChapters); }} className="text-2xl font-extrabold outline-none bg-transparent w-full text-gray-800 placeholder-gray-300" placeholder="Nhập tiêu đề chương..." />
                  </div>

                  {!isChapCollapsed && (
                    <div className="space-y-6">
                      {chapter.sections.map((section, sIndex) => {
                        const secKey = `section-${cIndex}-${sIndex}`;
                        const isSecCollapsed = collapsed.sections[secKey];
                        
                        return (
                        <div key={sIndex} id={secKey} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 scroll-mt-24 relative">
                          <div className="absolute top-5 right-5 flex gap-1">
                             <button onClick={() => moveSection(cIndex, sIndex, 'up')} className="p-1 hover:bg-gray-200 rounded text-gray-400"><ArrowUp size={14}/></button>
                             <button onClick={() => moveSection(cIndex, sIndex, 'down')} className="p-1 hover:bg-gray-200 rounded text-gray-400"><ArrowDown size={14}/></button>
                             <button onClick={() => toggleCollapse('sections', secKey)} className="p-1 hover:bg-gray-200 rounded text-gray-500 ml-2">{isSecCollapsed ? <ChevronDown size={14}/> : <ChevronUp size={14}/>}</button>
                             <button onClick={() => removeSection(cIndex, sIndex)} className="p-1 hover:bg-red-100 rounded text-red-400"><Trash2 size={14}/></button>
                          </div>

                          <div className="flex items-center gap-2 mb-6 pr-32">
                            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm"></div>
                            <input type="text" value={section.title} onChange={(e) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].title = e.target.value; setChapters(newChapters); }} className="font-bold text-lg text-orange-600 outline-none bg-transparent flex-1 placeholder-orange-300" placeholder="Tên Unit / Buổi học..." />
                          </div>

                          {!isSecCollapsed && (
                            <div className="space-y-8 pl-3 border-l-[3px] border-orange-200 ml-1">
                              {section.lessons.map((lesson, lIndex) => {
                                const lessonKey = `lesson-${cIndex}-${sIndex}-${lIndex}`;
                                const isCollapsed = collapsed.lessons[lessonKey];

                                return (
                                <div key={lIndex} id={lessonKey} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm scroll-mt-24 relative">
                                  <div className="absolute top-5 right-5 flex gap-1 z-10">
                                    <button onClick={() => moveLesson(cIndex, sIndex, lIndex, 'up')} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 transition-colors"><ArrowUp size={16}/></button>
                                    <button onClick={() => moveLesson(cIndex, sIndex, lIndex, 'down')} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 transition-colors"><ArrowDown size={16}/></button>
                                    <button onClick={() => toggleCollapse('lessons', lessonKey)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 ml-2 transition-colors">{isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}</button>
                                    <button onClick={() => removeLesson(cIndex, sIndex, lIndex)} className="p-1.5 bg-red-50 hover:bg-red-100 rounded text-red-500 transition-colors"><Trash2 size={16} /></button>
                                  </div>

                                  <div className="flex items-center mb-6 pr-36 border-b border-gray-100 pb-4">
                                    <span className="font-extrabold text-gray-800 text-xl">{lesson.title || `Bài học số ${lIndex + 1}`}</span>
                                  </div>

                                  {!isCollapsed && (
                                    <div className="flex flex-col gap-6">
                                      
                                      <div className="bg-blue-50/40 p-5 rounded-xl border border-blue-200 shadow-sm relative">
                                        <h4 className="font-extrabold text-blue-800 mb-5 flex items-center gap-3 uppercase tracking-wider text-sm">
                                          <span className="bg-blue-600 text-white w-7 h-7 rounded-lg flex items-center justify-center shadow-sm">1</span>
                                          Nội dung lý thuyết
                                        </h4>
                                        
                                        <div className="flex flex-col lg:flex-row gap-6">
                                          <div className="flex-1 space-y-5">
                                            <div>
                                              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Tên Bài Lý Thuyết</label>
                                              <input type="text" value={lesson.title} placeholder="VD: Vocabulary..." onChange={(e) => updateLesson(cIndex, sIndex, lIndex, 'title', e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl text-sm font-bold bg-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all" />
                                            </div>
                                            <div>
                                              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Nội dung đính kèm</label>
                                              <div className="flex flex-col sm:flex-row gap-3">
                                                <select value={lesson.type} onChange={(e) => updateLesson(cIndex, sIndex, lIndex, 'type', e.target.value)} className="p-3 border border-gray-300 rounded-xl text-sm bg-white outline-none focus:border-blue-400 font-bold text-gray-700 w-full sm:w-48 shadow-sm">
                                                  <option value="video_upload">Video MP4</option><option value="image">Hình ảnh</option><option value="youtube">Link YouTube</option><option value="document">Tài liệu (PDF/Link)</option>
                                                </select>
                                                <div className="flex-1">
                                                  {lesson.type === 'youtube' || lesson.type === 'document' ? (
                                                    <input type="text" value={lesson.contentUrl} onChange={(e) => updateLesson(cIndex, sIndex, lIndex, 'contentUrl', e.target.value)} placeholder="Nhập Link/URL..." className="w-full p-3 border border-gray-300 rounded-xl text-sm outline-none focus:border-blue-400 shadow-sm bg-white" />
                                                  ) : (
                                                    <label className="cursor-pointer bg-white border border-gray-300 hover:bg-blue-50 hover:border-blue-300 text-blue-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 w-full transition-colors shadow-sm">
                                                      {lesson.contentUrl ? '✅ Đã tải file (Nhấp đổi)' : 'Tải File Máy Tính'}
                                                      <input type="file" accept={lesson.type === 'image' ? "image/*" : "video/*"} className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateLesson(cIndex, sIndex, lIndex, 'contentUrl', url))} />
                                                    </label>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="w-full lg:w-[40%] aspect-video bg-white rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shadow-sm">
                                            <LessonPreview lesson={lesson} />
                                          </div>
                                        </div>
                                      </div>

                                      <div className="bg-orange-50/30 p-5 rounded-xl border border-orange-200 shadow-sm relative">
                                        <h4 className="font-extrabold text-orange-800 mb-5 flex items-center gap-3 uppercase tracking-wider text-sm">
                                          <span className="bg-orange-600 text-white w-7 h-7 rounded-lg flex items-center justify-center shadow-sm">2</span>
                                          Bài tập thực hành đi kèm
                                        </h4>
                                        
                                        {lesson.exercises && lesson.exercises.length > 0 ? (
                                          <div className="space-y-6">
                                            {lesson.exercises.map((exercise, eIndex) => renderExerciseForm(exercise, cIndex, sIndex, lIndex, eIndex))}
                                          </div>
                                        ) : (
                                          <div className="text-center py-8 bg-white rounded-xl border border-dashed border-orange-300">
                                            <p className="text-orange-500/80 font-bold text-sm mb-1">Chưa có bài tập nào!</p>
                                            <p className="text-gray-400 text-xs">Hãy thêm block bài tập để học viên thực hành.</p>
                                          </div>
                                        )}

                                        <button onClick={() => addExercise(cIndex, sIndex, lIndex)} className="mt-6 w-full py-3.5 bg-white border-2 border-dashed border-orange-400 rounded-xl text-orange-600 font-extrabold hover:bg-orange-50 hover:border-orange-500 transition-all flex items-center justify-center gap-2 shadow-sm">
                                          <Plus size={20} /> Tạo Thêm Block Bài Tập Mới
                                        </button>
                                      </div>

                                    </div>
                                  )}
                                </div>
                              )})}
                              
                              <button onClick={() => addLesson(cIndex, sIndex)} className="text-sm text-gray-500 font-extrabold hover:text-blue-600 flex items-center gap-2 mt-4 ml-2">
                                <Plus size={16}/> Thêm Bài học (Lý thuyết)
                              </button>
                            </div>
                          )}
                        </div>
                      )})}
                      <button onClick={() => addSection(cIndex)} className="text-sm text-orange-500 font-extrabold hover:text-orange-600 flex items-center gap-2 mt-2 ml-4">
                        <Plus size={16}/> Thêm Unit / Buổi Học Mới
                      </button>
                    </div>
                  )}
                </div>
              )})}
              <button onClick={addChapter} className="w-full py-6 border-2 border-dashed border-blue-400 bg-blue-50/30 rounded-2xl text-blue-600 font-extrabold hover:bg-blue-50 hover:border-blue-500 transition-all flex items-center justify-center gap-2 text-lg shadow-sm"><Plus size={28} /> Thêm Chương Mới</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};