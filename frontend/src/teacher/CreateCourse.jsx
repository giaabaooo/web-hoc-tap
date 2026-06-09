// src/pages/Teacher/CreateCourse.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Image as ImageIcon, Video, Trash2, FileEdit, Mic, Headphones, ScanLine, Type, FileText, ChevronDown, ChevronUp, ImagePlus, List, X, AlignLeft, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore'; 

// --- COMPONENT HỖ TRỢ UPLOAD NHANH (KÉO THẢ & PASTE) ---
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

// --- COMPONENT THANH TRƯỢT CẮT AUDIO ---
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

// --- CÁC HÀM HIỂN THỊ PREVIEW ---
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

export const CreateCourse = () => {
  const { token } = useAuthStore();
  const navigate = useNavigate(); 
  const [isUploading, setIsUploading] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(true); 
  const [collapsed, setCollapsed] = useState({ chapters: {}, sections: {}, lessons: {} });
  
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [courseInfo, setCourseInfo] = useState({ title: '', description: '', subject: 'Tiếng Anh', tag: 'Cơ bản', price: '', thumbnail: '' });
  const [chapters, setChapters] = useState([ { badgeText: 'Chương 1', title: '', sections: [{ title: '', lessons: [{ title: '', type: 'video_upload', contentUrl: '', exercises: [] }] }] } ]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleInfoChange = (e) => setCourseInfo({ ...courseInfo, [e.target.name]: e.target.value });
  const toggleCollapse = (type, id) => setCollapsed(prev => ({ ...prev, [type]: { ...prev[type], [id]: !prev[type][id] } }));

  const scrollToElement = (type, cIndex, sIndex, lIndex) => {
    setCollapsed(prev => {
      const newCol = { ...prev };
      newCol.chapters[`chapter-${cIndex}`] = false;
      if (type === 'section' || type === 'lesson') newCol.sections[`section-${cIndex}-${sIndex}`] = false;
      if (type === 'lesson') newCol.lessons[`lesson-${cIndex}-${sIndex}-${lIndex}`] = false;
      return newCol;
    });
    setTimeout(() => {
      const elId = type === 'chapter' ? `chapter-${cIndex}` : type === 'section' ? `section-${cIndex}-${sIndex}` : `lesson-${cIndex}-${sIndex}-${lIndex}`;
      const el = document.getElementById(elId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const validateData = () => {
    if (!courseInfo.title.trim()) return "Vui lòng nhập Tên khóa học!";
    if (!courseInfo.thumbnail) return "Vui lòng tải lên Ảnh bìa!";
    return null;
  };

  const handleSaveCourse = async (isPublished = true) => {
    if (isPublished) {
      const errorMsg = validateData();
      if (errorMsg) return toast.warning(errorMsg);
    } else {
      if (!courseInfo.title.trim()) return toast.warning("Vui lòng nhập Tên khóa học để lưu nháp!");
    }
    try {
      await axios.post(`${API_URL}/api/courses`, { ...courseInfo, chapters, isPublished }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(isPublished ? 'Xuất bản thành công!' : 'Lưu nháp thành công!');
      navigate('/teacher-dashboard');
    } catch (error) { toast.error('Lỗi khi lưu!'); }
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

  // --- HÀM SẮP XẾP MẢNG ---
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

  // --- CRUD ACTIONS ---
  const addChapter = () => setChapters([...chapters, { badgeText: `Chương ${chapters.length + 1}`, title: '', sections: [] }]);
  const removeChapter = (cIndex) => { const newChapters = [...chapters]; newChapters.splice(cIndex, 1); setChapters(newChapters); };
  const addSection = (cIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections.push({ title: '', lessons: [] }); setChapters(newChapters); };
  const removeSection = (cIndex, sIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections.splice(sIndex, 1); setChapters(newChapters); };
  const addLesson = (cIndex, sIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons.push({ title: '', type: 'video_upload', contentUrl: '', exercises: [] }); setChapters(newChapters); };
  const updateLesson = (cIndex, sIndex, lIndex, field, value) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons[lIndex][field] = value; if(field==='type') newChapters[cIndex].sections[sIndex].lessons[lIndex].contentUrl = ''; setChapters(newChapters); };
  const removeLesson = (cIndex, sIndex, lIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons.splice(lIndex, 1); setChapters(newChapters); };
  
  const addExercise = (cIndex, sIndex, lIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises.push({ type: 'multiple_choice', instruction: '', question: '', options: ['', '', '', ''], correctAnswer: '', points: 10, contentUrl: '', startTime: 0, endTime: 0, subQuestions: [] }); setChapters(newChapters); };
  const updateExercise = (cIndex, sIndex, lIndex, eIndex, field, value) => { 
    const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex][field] = value; 
    if (field === 'type') {
      const type = value; let opts = [];
      if (type === 'multiple_choice') opts = ['', '', '', '']; else if (type === 'matching') opts = ['|', '|', '|', '|']; else if (type === 'speaking') opts = []; 
      newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].options = opts;
      if (type === 'reading') newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].subQuestions = [{ question: '', options: ['', '', '', ''], correctAnswer: '' }];
    } 
    setChapters(newChapters); 
  };
  const removeExercise = (cIndex, sIndex, lIndex, eIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises.splice(eIndex, 1); setChapters(newChapters); };
  
  const addExerciseOption = (cIndex, sIndex, lIndex, eIndex, isMatching = false) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].options.push(isMatching ? '|' : ''); setChapters(newChapters); };
  const removeExerciseOption = (cIndex, sIndex, lIndex, eIndex, optIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].options.splice(optIndex, 1); setChapters(newChapters); };
  const updateExerciseOption = (cIndex, sIndex, lIndex, eIndex, optIndex, value) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].options[optIndex] = value; setChapters(newChapters); };
  const updateMatchingOption = (cIndex, sIndex, lIndex, eIndex, optIndex, side, value) => { const newChapters = [...chapters]; let currentVal = newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].options[optIndex] || '|'; let parts = currentVal.split('|'); parts[side === 'left' ? 0 : 1] = value; newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].options[optIndex] = parts.join('|'); setChapters(newChapters); };
  
  const addSubQuestion = (cIndex, sIndex, lIndex, eIndex) => { const newC = [...chapters]; newC[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].subQuestions.push({ question: '', options: ['', '', '', ''], correctAnswer: '' }); setChapters(newC); };
  const updateSubQuestion = (cIndex, sIndex, lIndex, eIndex, sqIndex, field, val) => { const newC = [...chapters]; newC[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].subQuestions[sqIndex][field] = val; setChapters(newC); };
  const removeSubQuestion = (cIndex, sIndex, lIndex, eIndex, sqIndex) => { const newC = [...chapters]; newC[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].subQuestions.splice(sqIndex, 1); setChapters(newC); };
  const updateSubQOption = (cIndex, sIndex, lIndex, eIndex, sqIndex, optIndex, val) => { const newC = [...chapters]; newC[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].subQuestions[sqIndex].options[optIndex] = val; setChapters(newC); };
  const addSubQOption = (cIndex, sIndex, lIndex, eIndex, sqIndex) => { const newC = [...chapters]; newC[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].subQuestions[sqIndex].options.push(''); setChapters(newC); };
  const removeSubQOption = (cIndex, sIndex, lIndex, eIndex, sqIndex, optIndex) => { const newC = [...chapters]; newC[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].subQuestions[sqIndex].options.splice(optIndex, 1); setChapters(newC); };


  const renderExerciseForm = (exercise, cIndex, sIndex, lIndex, eIndex) => {
    return (
      <div key={eIndex} className="bg-white p-5 rounded-lg border border-gray-200 mt-4 shadow-sm relative">
        <div className="absolute top-3 right-3 flex gap-1">
           <button onClick={() => moveExercise(cIndex, sIndex, lIndex, eIndex, 'up')} className="p-1 hover:bg-gray-100 rounded text-gray-500"><ArrowUp size={16}/></button>
           <button onClick={() => moveExercise(cIndex, sIndex, lIndex, eIndex, 'down')} className="p-1 hover:bg-gray-100 rounded text-gray-500"><ArrowDown size={16}/></button>
           <button onClick={() => removeExercise(cIndex, sIndex, lIndex, eIndex)} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-1 rounded ml-2"><Trash2 size={16}/></button>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-4 items-center border-b border-gray-100 pb-4 pr-24">
          <select value={exercise.type} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'type', e.target.value)} className="p-2 border border-gray-300 rounded text-sm bg-gray-50 font-medium outline-none focus:border-blue-400">
            <option value="multiple_choice">Trắc nghiệm</option>
            <option value="fill_blank">Điền vào chỗ trống</option>
            <option value="speaking">Luyện nói AI</option>
            <option value="listening">Luyện nghe (Audio Trimmer)</option>
            <option value="matching">Nối từ</option>
            <option value="flashcard">Thẻ từ vựng (Flashcard)</option>
            <option value="reading">Bài đọc hiểu (Reading)</option>
            <option value="essay">Tự luận</option>
          </select>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded text-sm"><span className="text-gray-500">Điểm:</span><input type="number" value={exercise.points} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'points', Number(e.target.value))} className="w-12 bg-transparent outline-none font-bold" /></div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">HƯỚNG DẪN LÀM BÀI (KHÔNG BẮT BUỘC)</label>
            <input type="text" value={exercise.instruction || ''} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'instruction', e.target.value)} placeholder="VD: Lắng nghe đoạn audio và chọn đáp án..." className="w-full p-2 border border-gray-300 rounded text-sm outline-none bg-yellow-50/30" />
          </div>

          {exercise.type === 'reading' && (
            <div className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1">BÀI ĐỌC (PASSAGE) - CTRL+V ĐỂ DÁN ẢNH</label>
                 <QuickUploadZone value={exercise.passage} onChange={(val) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'passage', val)} onUpload={uploadFileToServer} placeholder="Nhập văn bản bài đọc hoặc dán ảnh vào đây..." />
               </div>
               <div className="pl-4 border-l-2 border-blue-200 space-y-4">
                  <label className="block text-xs font-bold text-blue-600 uppercase mb-2">Các câu hỏi phụ:</label>
                  {exercise.subQuestions?.map((sq, sqIdx) => (
                    <div key={sqIdx} className="bg-blue-50/30 p-3 rounded border border-blue-100 relative">
                       <button onClick={() => removeSubQuestion(cIndex, sIndex, lIndex, eIndex, sqIdx)} className="absolute top-2 right-2 text-red-400"><X size={16}/></button>
                       <input type="text" value={sq.question} onChange={(e) => updateSubQuestion(cIndex, sIndex, lIndex, eIndex, sqIdx, 'question', e.target.value)} placeholder={`Câu hỏi ${sqIdx + 1}...`} className="w-full p-2 border border-gray-300 rounded text-sm outline-none mb-2" />
                       <div className="space-y-2">
                         {sq.options.map((opt, oIdx) => (
                           <div key={oIdx} className={`flex items-center gap-2 p-1.5 rounded border ${sq.correctAnswer === opt && opt !== '' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
                             <input type="radio" name={`sq-${eIndex}-${sqIdx}`} checked={sq.correctAnswer === opt && opt !== ''} onChange={() => updateSubQuestion(cIndex, sIndex, lIndex, eIndex, sqIdx, 'correctAnswer', opt)} className="cursor-pointer" />
                             <QuickUploadZone value={opt} onChange={(val) => updateSubQOption(cIndex, sIndex, lIndex, eIndex, sqIdx, oIdx, val)} onUpload={uploadFileToServer} placeholder={`Đáp án ${oIdx + 1}`} />
                             <button onClick={() => removeSubQOption(cIndex, sIndex, lIndex, eIndex, sqIdx, oIdx)} className="text-gray-400 hover:text-red-500 px-1"><X size={14}/></button>
                           </div>
                         ))}
                       </div>
                       <button onClick={() => addSubQOption(cIndex, sIndex, lIndex, eIndex, sqIdx)} className="mt-2 text-xs text-blue-600 font-bold">+ Thêm đáp án</button>
                    </div>
                  ))}
                  <button onClick={() => addSubQuestion(cIndex, sIndex, lIndex, eIndex)} className="text-sm text-blue-600 font-bold bg-white px-3 py-1.5 rounded border border-blue-200">+ Thêm câu hỏi phụ</button>
               </div>
            </div>
          )}

          {exercise.type === 'listening' && (
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <label className="block text-xs font-bold text-gray-700 mb-2">FILE AUDIO & CẮT GHÉP</label>
              <div className="flex items-center gap-2 mb-2">
                <input type="text" value={exercise.contentUrl || ''} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'contentUrl', e.target.value)} placeholder="Link MP3..." className="flex-1 p-2 text-sm border rounded outline-none" />
                <label className="bg-white border px-3 py-2 rounded text-sm font-medium cursor-pointer hover:bg-gray-100"> Tải lên <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'contentUrl', url))} /> </label>
              </div>
              {exercise.contentUrl && <AudioVisualTrimmer src={exercise.contentUrl} startTime={exercise.startTime} endTime={exercise.endTime} onUpdate={(field, val) => updateExercise(cIndex, sIndex, lIndex, eIndex, field, val)} />}
            </div>
          )}

          {exercise.type !== 'listening' && exercise.type !== 'speaking' && exercise.type !== 'essay' && exercise.type !== 'fill_blank' && exercise.type !== 'reading' && (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">ẢNH MINH HỌA (CTRL+V ĐỂ DÁN)</label>
              <QuickUploadZone value={exercise.contentUrl || ''} onChange={(url) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'contentUrl', url)} onUpload={uploadFileToServer} placeholder="Nhập Link hoặc dán ảnh vào đây..." />
            </div>
          )}

          {exercise.type === 'multiple_choice' && (
            <div className="space-y-3">
              <input type="text" value={exercise.question} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'question', e.target.value)} placeholder="Nhập câu hỏi trắc nghiệm..." className="w-full text-base font-bold outline-none border-b border-gray-300 focus:border-blue-500 pb-1" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {exercise.options.map((opt, oIdx) => (
                  <div key={oIdx} className={`p-2 rounded border ${exercise.correctAnswer === opt && opt !== '' ? 'border-green-500 bg-green-50/50' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <input type="radio" name={`correct-${cIndex}-${sIndex}-${lIndex}-${eIndex}`} checked={exercise.correctAnswer === opt && opt !== ''} onChange={() => updateExercise(cIndex, sIndex, lIndex, eIndex, 'correctAnswer', opt)} className="cursor-pointer" />
                      <span className="text-xs text-gray-500 font-medium flex-1">Lựa chọn {oIdx + 1}</span>
                      <button onClick={() => removeExerciseOption(cIndex, sIndex, lIndex, eIndex, oIdx)} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
                    </div>
                    <QuickUploadZone value={opt} onChange={(val) => updateExerciseOption(cIndex, sIndex, lIndex, eIndex, oIdx, val)} onUpload={uploadFileToServer} placeholder={`Dán ảnh hoặc nhập text...`} />
                  </div>
                ))}
              </div>
              <button onClick={() => addExerciseOption(cIndex, sIndex, lIndex, eIndex)} className="text-sm text-blue-600 font-bold">+ Thêm lựa chọn</button>
            </div>
          )}

          {exercise.type === 'fill_blank' && (
            <div className="space-y-3">
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded"><Type size={14}/> Mẹo: Dùng 3 dấu gạch dưới <b>___</b> để tạo ô trống.</div>
              <textarea value={exercise.question} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'question', e.target.value)} placeholder="I go to ___ every morning." className="w-full p-2 border rounded outline-none" rows="2" />
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Đáp án đúng:</span>
                <input type="text" value={exercise.correctAnswer} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'correctAnswer', e.target.value)} className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-blue-400" />
              </div>
            </div>
          )}

          {exercise.type === 'speaking' && (
            <div className="space-y-4">
               <input type="text" value={exercise.question} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'question', e.target.value)} placeholder="Nhập CÂU HỎI hiển thị cho học sinh..." className="w-full text-base font-bold outline-none border-b border-gray-300 focus:border-blue-500 pb-1" />
               <div className="bg-blue-50/50 p-4 rounded border border-blue-100">
                  <label className="block text-xs font-bold text-blue-600 mb-2">CÁC LỰA CHỌN ĐÁP ÁN (TÙY CHỌN)</label>
                  <p className="text-xs text-gray-500 mb-3">Nếu thêm lựa chọn, học sinh phải chọn đáp án đúng rồi mới đọc. Nếu để trống, học sinh chỉ cần bấm Mic và đọc đáp án.</p>
                  <div className="space-y-2 mb-3">
                    {exercise.options.map((opt, oIdx) => (
                      <div key={oIdx} className={`flex items-center gap-2 p-2 rounded border ${exercise.correctAnswer === opt && opt !== '' ? 'border-green-500 bg-green-50' : 'bg-white border-gray-200'}`}>
                         <input type="radio" name={`spk-${cIndex}-${sIndex}-${lIndex}-${eIndex}`} checked={exercise.correctAnswer === opt && opt !== ''} onChange={() => updateExercise(cIndex, sIndex, lIndex, eIndex, 'correctAnswer', opt)} className="cursor-pointer" />
                         <QuickUploadZone value={opt} onChange={(val) => updateExerciseOption(cIndex, sIndex, lIndex, eIndex, oIdx, val)} onUpload={uploadFileToServer} placeholder="Dán ảnh hoặc nhập Text..." />
                         <button onClick={() => removeExerciseOption(cIndex, sIndex, lIndex, eIndex, oIdx)} className="text-gray-400 hover:text-red-500 p-1"><X size={16}/></button>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => addExerciseOption(cIndex, sIndex, lIndex, eIndex)} className="text-sm text-blue-600 font-bold bg-white px-3 py-1.5 rounded border border-blue-200">+ Thêm lựa chọn</button>
               </div>
               {(!exercise.options || exercise.options.length === 0) && (
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">ĐÁP ÁN ĐÚNG ĐỂ AI CHẤM</label>
                    <input type="text" value={exercise.correctAnswer} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'correctAnswer', e.target.value)} placeholder="Nhập Text để AI so sánh (VD: Hello World)" className="w-full text-sm font-mono bg-gray-50 border p-2 rounded outline-none focus:border-green-400" />
                 </div>
               )}
            </div>
          )}

          {/* SỬA LẠI BÀI TẬP NỐI TỪ (MATCHING) Ở ĐÂY */}
          {exercise.type === 'matching' && (
            <div className="space-y-3">
              <input type="text" value={exercise.question} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'question', e.target.value)} placeholder="Nhập yêu cầu bài tập..." className="w-full text-base font-bold outline-none border-b border-gray-300 focus:border-blue-500 pb-1" />
              
              <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-md border border-blue-100 mb-3">
                <p className="font-semibold text-xs">💡 Lưu ý dạng bài Nối Từ:</p>
                <ul className="list-disc ml-5 mt-1 text-xs">
                  <li>Hãy nhập các cặp <strong>ĐÁP ÁN ĐÚNG</strong> nằm ngang hàng với nhau (Cột A nối với Cột B).</li>
                  <li>Hệ thống (khi học viên làm bài) sẽ <strong>tự động xáo trộn ngẫu nhiên</strong> vị trí các thẻ ở Cột B.</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="flex gap-4 items-center mb-2 font-semibold text-gray-600 px-2 text-xs">
                  <div className="flex-1 text-center">Nội dung Cột A</div>
                  <div className="w-24 text-center text-gray-400">Logic Nối</div>
                  <div className="flex-1 text-center">Nội dung Cột B</div>
                  <div className="w-8"></div>
                </div>
                <div className="space-y-2">
                  {exercise.options.map((opt, oIdx) => {
                    const parts = opt.split('|');
                    return (
                      <div key={oIdx} className="flex items-center gap-4 bg-white p-2 rounded border focus-within:ring-2 focus-within:ring-blue-400 transition-all">
                        <div className="flex-1">
                          <QuickUploadZone value={parts[0]||''} onChange={(val) => updateMatchingOption(cIndex, sIndex, lIndex, eIndex, oIdx, 'left', val)} onUpload={uploadFileToServer} placeholder="Nhập nội dung A..." />
                        </div>
                        
                        <div className="w-24 flex flex-col items-center justify-center text-gray-400">
                          <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1">Đáp án</span>
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                        </div>

                        <div className="flex-1">
                          <QuickUploadZone value={parts[1]||''} onChange={(val) => updateMatchingOption(cIndex, sIndex, lIndex, eIndex, oIdx, 'right', val)} onUpload={uploadFileToServer} placeholder="Nhập nội dung B..." />
                        </div>
                        <div className="w-8 flex justify-center">
                          <button onClick={() => removeExerciseOption(cIndex, sIndex, lIndex, eIndex, oIdx)} className="text-gray-400 hover:text-red-500 p-1"><X size={16}/></button>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <button onClick={() => addExerciseOption(cIndex, sIndex, lIndex, eIndex, true)} className="mt-3 text-sm text-blue-600 font-bold bg-white px-3 py-1.5 rounded border border-blue-200">+ Thêm cặp đáp án</button>
              </div>
            </div>
          )}

          {(exercise.type === 'flashcard' || exercise.type === 'vocab') && (
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Mặt trước</label>
                  <QuickUploadZone value={exercise.question} onChange={(val) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'question', val)} onUpload={uploadFileToServer} placeholder="Dán ảnh mặt trước hoặc nhập chữ" />
               </div>
               <div className="grid grid-cols-1 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Mặt sau (Text)</label>
                    <input type="text" value={exercise.correctAnswer} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'correctAnswer', e.target.value)} placeholder="Nhập Text giải nghĩa" className="w-full p-2 border rounded text-sm outline-none bg-white" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Mặt sau (Audio MP3)</label>
                    <QuickUploadZone value={exercise.audioUrl || ''} onChange={(val) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'audioUrl', val)} onUpload={uploadFileToServer} placeholder="Tải lên hoặc dán link Audio" type="text" isAudio={true} />
                 </div>
               </div>
            </div>
          )}

          {exercise.type === 'essay' && (
            <div className="space-y-3">
              <textarea value={exercise.question} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'question', e.target.value)} placeholder="Nhập đề bài tự luận..." className="w-full p-2 border rounded text-sm outline-none" rows="2" />
              <textarea value={exercise.correctAnswer} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'correctAnswer', e.target.value)} placeholder="Barem chấm điểm..." className="w-full p-2 border rounded text-sm outline-none bg-gray-50" rows="2" />
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isUploading && chapters.length === 0) return <div className="flex items-center justify-center min-h-screen text-blue-500">Đang tải...</div>;

  return (
    <div className="flex relative font-sans">
      {isTocOpen && (
        <aside className="w-64 flex-shrink-0 sticky top-20 max-h-[85vh] overflow-y-auto bg-white border-r border-gray-200 shadow-sm p-4 hidden md:block custom-scrollbar z-10">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Mục lục khóa học</h3>
            <button onClick={() => setIsTocOpen(false)} className="text-gray-400 hover:text-gray-800 p-1 rounded-md hover:bg-gray-100"><X size={16}/></button>
          </div>
          {chapters.map((ch, cIndex) => (
            <div key={cIndex} className="mb-4">
              {/* SỬA LẠI HIỂN THỊ MỤC LỤC */}
              <div className="font-bold text-sm text-blue-600 mb-1.5 cursor-pointer hover:underline truncate" onClick={() => scrollToElement('chapter', cIndex)}>
                {ch.badgeText !== undefined ? ch.badgeText : `Chương ${cIndex+1}`} {ch.title ? `- ${ch.title}` : ''}
              </div>
              {ch.sections.map((sec, sIndex) => (
                <div key={sIndex} className="pl-2 border-l-2 border-blue-100 ml-1.5 mt-1 space-y-1.5">
                  <div className="text-xs font-bold text-orange-500 hover:underline cursor-pointer truncate" onClick={() => scrollToElement('section', cIndex, sIndex)}>
                    {sec.title || `Buổi ${sIndex+1}`}
                  </div>
                  {sec.lessons.map((les, lIndex) => (
                    <div key={lIndex} className="text-xs text-gray-500 hover:text-blue-600 cursor-pointer truncate pl-2" onClick={() => scrollToElement('lesson', cIndex, sIndex, lIndex)}>
                       - {les.title || `Bài ${lIndex+1}`}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </aside>
      )}

      {!isTocOpen && (
        <button onClick={() => setIsTocOpen(true)} className="fixed left-0 top-24 bg-white border border-l-0 border-gray-200 shadow-md p-2 rounded-r-lg z-40 hover:bg-gray-50 hidden md:block text-gray-500 hover:text-blue-600">
          <AlignLeft size={20} />
        </button>
      )}

      <div className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Tạo Khóa Học</h2>
          <div className="flex gap-2">
            <button onClick={() => handleSaveCourse(false)} disabled={isUploading} className="px-5 py-2.5 rounded-lg text-sm font-bold border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors shadow-sm bg-white">Lưu nháp</button>
            <button onClick={() => handleSaveCourse(true)} disabled={isUploading} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md hover:shadow-blue-500/30 transition-all flex items-center gap-2">
              {isUploading && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>} Lưu & Xuất bản
            </button>
          </div>
        </div>
        
        {/* Form Thông tin */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 mb-8">
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

              {/* SỬA LẠI INPUT NHẬP TÊN CHƯƠNG/PHẦN Ở ĐÂY */}
              <div className="flex items-center gap-4 mb-6 pr-36 border-b-2 border-blue-100 pb-4">
                <input 
                  type="text" 
                  value={chapter.badgeText !== undefined ? chapter.badgeText : `Chương ${cIndex + 1}`} 
                  onChange={(e) => { 
                    const newChapters = [...chapters]; 
                    newChapters[cIndex].badgeText = e.target.value; 
                    setChapters(newChapters); 
                  }} 
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-1.5 rounded-lg font-bold text-sm shadow-sm w-32 text-center outline-none focus:ring-2 focus:ring-blue-300 placeholder-white/70"
                  placeholder="VD: Chương 1"
                />
                <input 
                  type="text" 
                  value={chapter.title} 
                  onChange={(e) => { 
                    const newChapters = [...chapters]; 
                    newChapters[cIndex].title = e.target.value; 
                    setChapters(newChapters); 
                  }} 
                  className="text-2xl font-extrabold outline-none bg-transparent w-full text-gray-800 placeholder-gray-300" 
                  placeholder="Nhập tiêu đề chương..." 
                />
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

                      <div className="flex items-center gap-2 mb-4 pr-32">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm"></div>
                        <input type="text" value={section.title} onChange={(e) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].title = e.target.value; setChapters(newChapters); }} className="font-bold text-lg text-orange-600 outline-none bg-transparent flex-1 placeholder-orange-300" placeholder="Tên Unit / Buổi học..." />
                      </div>

                      {!isSecCollapsed && (
                        <div className="space-y-4 pl-3 border-l-2 border-orange-200 ml-1">
                          {section.lessons.map((lesson, lIndex) => {
                            const lessonKey = `lesson-${cIndex}-${sIndex}-${lIndex}`;
                            const isCollapsed = collapsed.lessons[lessonKey];

                            return (
                            <div key={lIndex} id={lessonKey} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm scroll-mt-24 relative">
                              <div className="absolute top-4 right-4 flex gap-1 z-10">
                                <button onClick={() => moveLesson(cIndex, sIndex, lIndex, 'up')} className="p-1 hover:bg-gray-100 rounded text-gray-400"><ArrowUp size={14}/></button>
                                <button onClick={() => moveLesson(cIndex, sIndex, lIndex, 'down')} className="p-1 hover:bg-gray-100 rounded text-gray-400"><ArrowDown size={14}/></button>
                                <button onClick={() => toggleCollapse('lessons', lessonKey)} className="p-1 hover:bg-gray-100 rounded text-gray-500 ml-2">{isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}</button>
                                <button onClick={() => removeLesson(cIndex, sIndex, lIndex)} className="p-1 hover:bg-red-50 rounded text-red-400"><Trash2 size={14} /></button>
                              </div>

                              <div className="flex items-center mb-4 pr-32">
                                <span className="font-bold text-gray-800 text-base">{lesson.title || `Bài học ${lIndex + 1}`}</span>
                              </div>

                              {!isCollapsed && (
                                <>
                                  <div className="flex flex-col lg:flex-row gap-5 mb-2">
                                    <div className="flex-1 space-y-3">
                                      <div>
                                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Tên Bài Lý Thuyết</label>
                                        <input type="text" value={lesson.title} placeholder="VD: Vocabulary..." onChange={(e) => updateLesson(cIndex, sIndex, lIndex, 'title', e.target.value)} className="w-full p-2.5 border rounded-lg text-sm font-bold bg-gray-50 outline-none focus:bg-white focus:border-blue-400" />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Nội dung đính kèm</label>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                          <select value={lesson.type} onChange={(e) => updateLesson(cIndex, sIndex, lIndex, 'type', e.target.value)} className="p-2.5 border rounded-lg text-sm bg-white outline-none focus:border-blue-400 font-bold text-gray-600">
                                            <option value="video_upload">Video MP4</option><option value="image">Hình ảnh</option><option value="youtube">Link YouTube</option><option value="document">Tài liệu (PDF/Link)</option>
                                          </select>
                                          <div className="flex-1">
                                            {lesson.type === 'youtube' || lesson.type === 'document' ? (
                                              <input type="text" value={lesson.contentUrl} onChange={(e) => updateLesson(cIndex, sIndex, lIndex, 'contentUrl', e.target.value)} placeholder="Nhập Link/URL..." className="w-full p-2.5 border rounded-lg text-sm outline-none" />
                                            ) : (
                                              <label className="cursor-pointer bg-gray-50 border border-gray-300 hover:bg-blue-50 hover:border-blue-300 text-blue-600 px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 w-full transition-colors">
                                                {lesson.contentUrl ? '✅ Đã tải file (Click đổi)' : 'Tải File Từ Máy Tính'}
                                                <input type="file" accept={lesson.type === 'image' ? "image/*" : "video/*"} className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateLesson(cIndex, sIndex, lIndex, 'contentUrl', url))} />
                                              </label>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="w-full lg:w-[40%] aspect-video bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center overflow-hidden"><LessonPreview lesson={lesson} /></div>
                                  </div>

                                  {lesson.exercises && lesson.exercises.length > 0 && (
                                    <div className="mt-6 border-t border-gray-100 pt-5">
                                      <h4 className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mb-2 uppercase tracking-wide"><List size={14}/> Bài tập đi kèm</h4>
                                      {lesson.exercises.map((exercise, eIndex) => renderExerciseForm(exercise, cIndex, sIndex, lIndex, eIndex))}
                                    </div>
                                  )}
                                  <button onClick={() => addExercise(cIndex, sIndex, lIndex)} className="mt-4 text-sm text-blue-600 font-bold hover:underline">+ Thêm Bài tập</button>
                                </>
                              )}
                            </div>
                          )})}
                          <button onClick={() => addLesson(cIndex, sIndex)} className="text-sm text-gray-500 font-bold hover:text-blue-600">+ Thêm Bài học (Lý thuyết)</button>
                        </div>
                      )}
                    </div>
                  )})}
                  <button onClick={() => addSection(cIndex)} className="text-sm text-orange-500 font-bold hover:text-orange-600">+ Thêm Unit / Buổi Học</button>
                </div>
              )}
            </div>
          )})}
          <button onClick={addChapter} className="w-full py-6 border-2 border-dashed border-blue-400 bg-blue-50/30 rounded-2xl text-blue-600 font-extrabold hover:bg-blue-50 hover:border-blue-500 transition-all flex items-center justify-center gap-2 text-lg shadow-sm"><Plus size={28} /> Thêm Chương Mới</button>
        </div>
      </div>
    </div>
  );
};