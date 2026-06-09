// src/pages/Teacher/CreateCourse.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Image as ImageIcon, Video, Trash2, FileEdit, Mic, Headphones, ScanLine, Type, FileText, ChevronDown, ChevronUp, ImagePlus, List, X, AlignLeft } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore'; 

const QuickUploadZone = ({ value, onChange, onUpload, placeholder, type = "text" }) => {
  const isImage = value && value.startsWith('http');
  const handlePaste = async (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let index in items) {
      if (items[index].kind === 'file') {
        e.preventDefault();
        onUpload(items[index].getAsFile(), onChange);
        break;
      }
    }
  };
  return (
    <div className="relative w-full group">
      {isImage ? (
        <div className="relative h-28 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center p-2">
          <img src={value} className="h-full object-contain rounded" alt="Uploaded" />
          <button onClick={() => onChange('')} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">X</button>
        </div>
      ) : (
        <div className="flex relative">
          <input type={type} value={value} onChange={(e) => onChange(e.target.value)} onPaste={handlePaste} placeholder={placeholder} className="w-full p-2.5 pr-12 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-400 bg-white" />
          <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-blue-500 p-1" title="Tải ảnh lên">
            <ImagePlus size={18} />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { if(e.target.files[0]) onUpload(e.target.files[0], onChange); }} />
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
    <div className="bg-gray-800 p-4 rounded-lg mt-3">
      <audio ref={audioRef} src={src} onLoadedMetadata={handleLoadedMetadata} onTimeUpdate={handleTimeUpdate} controls className="w-full h-10 mb-4 outline-none" />
      <div className="flex gap-4 items-center bg-gray-900 p-3 rounded text-white">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Từ giây:</label>
          <input type="range" min="0" max={duration} step="0.5" value={startTime || 0} onChange={(e) => onUpdate('startTime', parseFloat(e.target.value))} className="w-full accent-blue-500" />
          <div className="text-center text-blue-400 text-sm font-bold mt-1">{startTime || 0}s</div>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Đến giây:</label>
          <input type="range" min={startTime || 0} max={duration} step="0.5" value={endTime || duration} onChange={(e) => onUpdate('endTime', parseFloat(e.target.value))} className="w-full accent-red-500" />
          <div className="text-center text-red-400 text-sm font-bold mt-1">{endTime || duration}s</div>
        </div>
      </div>
    </div>
  );
};

export const CreateCourse = () => {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(true); 
  const [collapsed, setCollapsed] = useState({ chapters: {}, sections: {}, lessons: {} });
  
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [courseInfo, setCourseInfo] = useState({ title: '', description: '', subject: 'Tiếng Anh', tag: 'Cơ bản', price: '', thumbnail: '' });
  const [chapters, setChapters] = useState([ { title: 'Ngày 1', sections: [{ title: 'Unit 1 - Buổi 1', lessons: [{ title: 'Bài 1', type: 'video_upload', contentUrl: '', exercises: [] }] }] } ]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleInfoChange = (e) => setCourseInfo({ ...courseInfo, [e.target.name]: e.target.value });
  const toggleCollapse = (type, id) => setCollapsed(prev => ({ ...prev, [type]: { ...prev[type], [id]: !prev[type][id] } }));

  // HÀM TỰ ĐỘNG MỞ RỘNG VÀ CUỘN (SCROLL) MƯỢT MÀ
  const scrollToElement = (type, cIndex, sIndex, lIndex) => {
    setCollapsed(prev => {
      const newCol = { ...prev };
      newCol.chapters[`chapter-${cIndex}`] = false;
      if (type === 'section' || type === 'lesson') newCol.sections[`section-${cIndex}-${sIndex}`] = false;
      if (type === 'lesson') newCol.lessons[`lesson-${cIndex}-${sIndex}-${lIndex}`] = false;
      return newCol;
    });

    setTimeout(() => {
      const id = type === 'chapter' ? `chapter-${cIndex}` : type === 'section' ? `section-${cIndex}-${sIndex}` : `lesson-${cIndex}-${sIndex}-${lIndex}`;
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const validateData = () => {
    if (!courseInfo.title.trim()) return "Vui lòng nhập Tên khóa học!";
    if (courseInfo.price === '' || isNaN(courseInfo.price) || Number(courseInfo.price) < 0) return "Vui lòng nhập Giá hợp lệ!";
    if (!courseInfo.thumbnail) return "Vui lòng tải lên Ảnh bìa!";
    return null;
  };

  const handleSaveCourse = async (isPublished = true) => {
    if (isPublished) {
      const errorMsg = validateData();
      if (errorMsg) return toast.warning(errorMsg);
    } else {
      if (!courseInfo.title.trim()) return toast.warning("Vui lòng nhập ít nhất Tên khóa học để lưu nháp!");
    }
    
    try {
      await axios.post(`${API_URL}/api/courses`, { ...courseInfo, chapters, isPublished }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(isPublished ? 'Xuất bản khóa học thành công!' : 'Lưu nháp thành công!');
      navigate('/teacher-dashboard');
    } catch (error) { toast.error('Lỗi khi lưu khóa học!'); }
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
  const getYouTubeId = (url) => { const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/); return match?.[1] || null; };

  const LessonPreview = ({ lesson }) => {
    if (!lesson.contentUrl) return <div className="text-gray-400 text-sm">Preview Box</div>;
    if (lesson.type === 'image') return <img src={lesson.contentUrl} className="w-full h-full object-contain bg-gray-100" />;
    if (lesson.type === 'video_upload') return <video src={lesson.contentUrl} controls className="w-full h-full bg-black object-contain" />;
    if (lesson.type === 'youtube') return <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${getYouTubeId(lesson.contentUrl)}`} frameBorder="0" allowFullScreen></iframe>;
    return <div className="flex flex-col items-center justify-center p-4 text-blue-500"><FileText size={40} /><span className="text-xs break-all mt-2">{lesson.contentUrl}</span></div>;
  };

  const addChapter = () => setChapters([...chapters, { title: `Ngày ${chapters.length + 1}`, sections: [] }]);
  const addSection = (cIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections.push({ title: `Unit - Buổi mới`, lessons: [] }); setChapters(newChapters); };
  const addLesson = (cIndex, sIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons.push({ title: '', type: 'video_upload', contentUrl: '', exercises: [] }); setChapters(newChapters); };
  const updateLesson = (cIndex, sIndex, lIndex, field, value) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons[lIndex][field] = value; if(field==='type') newChapters[cIndex].sections[sIndex].lessons[lIndex].contentUrl = ''; setChapters(newChapters); };
  const removeLesson = (cIndex, sIndex, lIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons.splice(lIndex, 1); setChapters(newChapters); };
  const removeSection = (cIndex, sIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections.splice(sIndex, 1); setChapters(newChapters); };
  const removeChapter = (cIndex) => { const newChapters = [...chapters]; newChapters.splice(cIndex, 1); setChapters(newChapters); };
  
  const addExercise = (cIndex, sIndex, lIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises.push({ type: 'multiple_choice', instruction: '', question: '', options: ['', '', '', ''], correctAnswer: '', points: 10, contentUrl: '', startTime: 0, endTime: 0 }); setChapters(newChapters); };
  const updateExercise = (cIndex, sIndex, lIndex, eIndex, field, value) => { 
    const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex][field] = value; 
    if (field === 'type') {
      const type = value; let opts = [];
      if (type === 'multiple_choice') opts = ['', '', '', '']; else if (type === 'matching') opts = ['|', '|', '|', '|'];
      newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].options = opts;
    } 
    setChapters(newChapters); 
  };
  const updateExerciseOption = (cIndex, sIndex, lIndex, eIndex, optIndex, value) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].options[optIndex] = value; setChapters(newChapters); };
  const updateMatchingOption = (cIndex, sIndex, lIndex, eIndex, optIndex, side, value) => { const newChapters = [...chapters]; let currentVal = newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].options[optIndex] || '|'; let parts = currentVal.split('|'); parts[side === 'left' ? 0 : 1] = value; newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].options[optIndex] = parts.join('|'); setChapters(newChapters); };
  const removeExercise = (cIndex, sIndex, lIndex, eIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises.splice(eIndex, 1); setChapters(newChapters); };

  const renderExerciseForm = (exercise, cIndex, sIndex, lIndex, eIndex) => {
    return (
      <div key={eIndex} className="bg-white p-5 rounded-lg border border-gray-200 mt-4 shadow-sm relative">
        <button onClick={() => removeExercise(cIndex, sIndex, lIndex, eIndex)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 bg-gray-50 p-1.5 rounded-md"><Trash2 size={16}/></button>
        
        <div className="flex flex-wrap gap-3 mb-4 items-center border-b border-gray-100 pb-4">
          <select value={exercise.type} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'type', e.target.value)} className="p-2 border border-gray-300 rounded text-sm bg-gray-50 font-medium outline-none focus:border-blue-400">
            <option value="multiple_choice">Trắc nghiệm (4 đáp án)</option>
            <option value="fill_blank">Điền vào chỗ trống</option>
            <option value="speaking">Luyện nói AI</option>
            <option value="listening">Luyện nghe (Audio Trimmer)</option>
            <option value="matching">Nối từ</option>
            <option value="flashcard">Thẻ từ vựng (Vocab)</option>
            <option value="essay">Tự luận</option>
          </select>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded text-sm"><span className="text-gray-500">Điểm:</span><input type="number" value={exercise.points} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'points', Number(e.target.value))} className="w-12 bg-transparent outline-none font-bold" /></div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">HƯỚNG DẪN LÀM BÀI (KHÔNG BẮT BUỘC)</label>
            <input type="text" value={exercise.instruction || ''} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'instruction', e.target.value)} placeholder="VD: Lắng nghe đoạn audio và chọn đáp án..." className="w-full p-2 border border-gray-300 rounded text-sm outline-none bg-yellow-50/30" />
          </div>

          {exercise.type === 'listening' ? (
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <label className="block text-xs font-bold text-gray-700 mb-2">FILE AUDIO & CẮT GHÉP</label>
              <div className="flex items-center gap-2 mb-2">
                <input type="text" value={exercise.contentUrl || ''} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'contentUrl', e.target.value)} placeholder="Link MP3..." className="flex-1 p-2 text-sm border rounded outline-none" />
                <label className="bg-white border px-3 py-2 rounded text-sm font-medium cursor-pointer hover:bg-gray-100"> Tải lên <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'contentUrl', url))} /> </label>
              </div>
              {exercise.contentUrl && <AudioVisualTrimmer src={exercise.contentUrl} startTime={exercise.startTime} endTime={exercise.endTime} onUpdate={(field, val) => updateExercise(cIndex, sIndex, lIndex, eIndex, field, val)} />}
            </div>
          ) : (exercise.type !== 'speaking' && exercise.type !== 'essay' && exercise.type !== 'fill_blank' && (
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">ẢNH MINH HỌA (CTRL+V ĐỂ DÁN)</label>
              <QuickUploadZone value={exercise.contentUrl || ''} onChange={(url) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'contentUrl', url)} onUpload={uploadFileToServer} placeholder="Nhập Link hoặc dán ảnh vào đây..." />
            </div>
          ))}

          {exercise.type === 'multiple_choice' && (
            <div className="space-y-3">
              <input type="text" value={exercise.question} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'question', e.target.value)} placeholder="Nhập câu hỏi trắc nghiệm..." className="w-full text-base font-bold outline-none border-b border-gray-300 focus:border-blue-500 pb-1" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {exercise.options.map((opt, oIdx) => (
                  <div key={oIdx} className={`p-2 rounded border ${exercise.correctAnswer === opt && opt !== '' ? 'border-green-500 bg-green-50/50' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <input type="radio" name={`correct-${cIndex}-${sIndex}-${lIndex}-${eIndex}`} checked={exercise.correctAnswer === opt && opt !== ''} onChange={() => updateExercise(cIndex, sIndex, lIndex, eIndex, 'correctAnswer', opt)} className="cursor-pointer" />
                      <span className="text-xs text-gray-500 font-medium">Lựa chọn {oIdx + 1}</span>
                    </div>
                    <QuickUploadZone value={opt} onChange={(val) => updateExerciseOption(cIndex, sIndex, lIndex, eIndex, oIdx, val)} onUpload={uploadFileToServer} placeholder={`Nhập text hoặc dán ảnh`} />
                  </div>
                ))}
              </div>
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
            <div className="space-y-3">
               <input type="text" value={exercise.question} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'question', e.target.value)} placeholder="Nhập Text yêu cầu học sinh đọc..." className="w-full text-base font-bold outline-none border-b border-gray-300 focus:border-blue-500 pb-1" />
               <input type="text" value={exercise.correctAnswer} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'correctAnswer', e.target.value)} placeholder="Nhập CHÍNH XÁC text để AI chấm điểm (VD: Hello World)" className="w-full text-sm font-mono bg-gray-50 border p-2 rounded outline-none focus:border-green-400" />
            </div>
          )}

          {exercise.type === 'matching' && (
            <div className="space-y-3">
              <input type="text" value={exercise.question} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'question', e.target.value)} placeholder="Nhập yêu cầu bài tập..." className="w-full text-base font-bold outline-none border-b border-gray-300 focus:border-blue-500 pb-1" />
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="flex justify-between text-xs text-gray-500 mb-2"><span>Cột A</span><span>Cột B</span></div>
                <div className="space-y-2">
                  {exercise.options.map((opt, oIdx) => {
                    const parts = opt.split('|');
                    return (
                      <div key={oIdx} className="flex items-center gap-3 bg-white p-2 rounded border">
                        <QuickUploadZone value={parts[0]||''} onChange={(val) => updateMatchingOption(cIndex, sIndex, lIndex, eIndex, oIdx, 'left', val)} onUpload={uploadFileToServer} placeholder="A" />
                        <ScanLine size={16} className="text-gray-300" />
                        <QuickUploadZone value={parts[1]||''} onChange={(val) => updateMatchingOption(cIndex, sIndex, lIndex, eIndex, oIdx, 'right', val)} onUpload={uploadFileToServer} placeholder="B" />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {(exercise.type === 'flashcard' || exercise.type === 'vocab') && (
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Mặt trước</label>
                  <input type="text" value={exercise.question} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'question', e.target.value)} placeholder="Từ vựng" className="w-full p-2 border rounded text-sm outline-none" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Mặt sau</label>
                  <QuickUploadZone value={exercise.correctAnswer} onChange={(val) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'correctAnswer', val)} onUpload={uploadFileToServer} placeholder="Dán ảnh hoặc Text giải nghĩa" />
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

  return (
    <div className="flex relative">
      {isTocOpen && (
        <aside className="w-64 flex-shrink-0 sticky top-20 max-h-[85vh] overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-sm p-4 mr-6 hidden md:block">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h3 className="font-bold text-gray-700 text-sm uppercase">Mục lục khóa học</h3>
            <button onClick={() => setIsTocOpen(false)} className="text-gray-400 hover:text-gray-800 p-1"><X size={16}/></button>
          </div>
          {chapters.map((ch, cIndex) => (
            <div key={cIndex} className="mb-3">
              <div className="font-semibold text-sm text-gray-800 mb-1 cursor-pointer hover:text-blue-600 truncate" onClick={() => scrollToElement('chapter', cIndex)}>
                {ch.title || `Chương ${cIndex+1}`}
              </div>
              {ch.sections.map((sec, sIndex) => (
                <div key={sIndex} className="pl-3 border-l-2 border-gray-100 ml-1.5 mt-1 space-y-1">
                  {sec.lessons.map((les, lIndex) => (
                    <div key={lIndex} className="text-xs text-gray-500 hover:text-blue-600 cursor-pointer truncate" onClick={() => scrollToElement('lesson', cIndex, sIndex, lIndex)}>
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
        <button onClick={() => setIsTocOpen(true)} className="fixed left-0 top-32 bg-white border border-l-0 border-gray-200 shadow-md p-2 rounded-r-lg z-40 hover:bg-gray-50 hidden md:block text-gray-500 hover:text-blue-600" title="Hiện mục lục">
          <AlignLeft size={20} />
        </button>
      )}

      <div className="flex-1 w-full max-w-5xl mx-auto">
        <div className="sticky top-[64px] z-40 bg-white/90 backdrop-blur-md py-4 mb-6 border border-gray-200 flex justify-between items-center shadow-sm -mx-4 px-4 sm:mx-0 sm:px-6 rounded-xl">
    <h2 className="text-2xl font-bold text-gray-800">Tạo Khóa Học Mới</h2>
    <div className="flex gap-2">
        <button 
            onClick={() => handleSaveCourse(false)} 
            disabled={isUploading} 
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
        >
            Lưu nháp
        </button>
        <button 
            onClick={() => handleSaveCourse(true)} 
            disabled={isUploading} 
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2"
        >
            {isUploading && <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></span>} 
            Lưu & Xuất bản
        </button>
    </div>
</div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h3 className="text-base font-bold text-gray-800 border-b pb-3 mb-5 uppercase tracking-wide">Thông tin cơ bản</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1 text-gray-700">Tên khóa học *</label><input type="text" name="title" value={courseInfo.title} onChange={handleInfoChange} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-400" /></div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700">Mô tả khóa học</label><textarea name="description" value={courseInfo.description} onChange={handleInfoChange} rows="3" className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-400"></textarea></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-sm font-medium mb-1 text-gray-700">Môn học</label><select name="subject" value={courseInfo.subject} onChange={handleInfoChange} className="w-full p-2 border rounded-lg outline-none bg-white"><option>Tiếng Anh</option><option>Toán</option></select></div>
                <div><label className="block text-sm font-medium mb-1 text-gray-700">Phân loại</label><select name="tag" value={courseInfo.tag} onChange={handleInfoChange} className="w-full p-2 border rounded-lg outline-none bg-white"><option>Cơ bản</option><option>Nâng cao</option></select></div>
                <div><label className="block text-sm font-medium mb-1 text-gray-700">Giá (VNĐ) *</label><input type="number" name="price" value={courseInfo.price} onChange={handleInfoChange} className="w-full p-2 border rounded-lg outline-none" /></div>
              </div>
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-1 text-gray-700">Ảnh bìa (Thumbnail) *</label>
              <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center relative overflow-hidden group hover:bg-gray-100">
                {courseInfo.thumbnail ? (
                  <img src={courseInfo.thumbnail} className="w-full h-full object-cover absolute" alt="Cover" />
                ) : <span className="text-gray-400 text-sm font-medium flex flex-col items-center gap-2"><ImageIcon size={32} /> Tải ảnh lên</span>}
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setCourseInfo(prev => ({ ...prev, thumbnail: url })))} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {chapters.map((chapter, cIndex) => {
            const chapKey = `chapter-${cIndex}`;
            const isChapCollapsed = collapsed.chapters[chapKey];
            
            return (
            <div key={cIndex} id={chapKey} className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-200 scroll-mt-24">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs font-bold whitespace-nowrap">Chương {cIndex + 1}</span>
                <input type="text" value={chapter.title} onChange={(e) => { const newChapters = [...chapters]; newChapters[cIndex].title = e.target.value; setChapters(newChapters); }} className="text-lg font-bold outline-none flex-1" placeholder="Tên Chương..." />
                <div className="flex gap-1 ml-auto">
                   <button onClick={() => toggleCollapse('chapters', chapKey)} className="text-gray-500 hover:bg-gray-100 p-1.5 rounded">{isChapCollapsed ? <ChevronDown size={18}/> : <ChevronUp size={18}/>}</button>
                   <button onClick={() => removeChapter(cIndex)} className="text-red-400 hover:bg-red-50 p-1.5 rounded"><Trash2 size={18}/></button>
                </div>
              </div>

              {!isChapCollapsed && (
                <div className="space-y-4">
                  {chapter.sections.map((section, sIndex) => {
                    const secKey = `section-${cIndex}-${sIndex}`;
                    const isSecCollapsed = collapsed.sections[secKey];
                    
                    return (
                    <div key={sIndex} id={secKey} className="bg-gray-50 p-4 rounded-lg border border-gray-200 scroll-mt-24">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        <input type="text" value={section.title} onChange={(e) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].title = e.target.value; setChapters(newChapters); }} className="font-semibold text-orange-600 outline-none bg-transparent flex-1" placeholder="Tên Unit / Buổi học..." />
                        <div className="flex gap-1 ml-auto">
                           <button onClick={() => toggleCollapse('sections', secKey)} className="text-gray-500 hover:bg-gray-200 p-1 rounded">{isSecCollapsed ? <ChevronDown size={16}/> : <ChevronUp size={16}/>}</button>
                           <button onClick={() => removeSection(cIndex, sIndex)} className="text-red-400 hover:bg-red-100 p-1 rounded"><Trash2 size={16}/></button>
                        </div>
                      </div>

                      {!isSecCollapsed && (
                        <div className="space-y-4 pl-3 border-l-2 border-orange-200 ml-1">
                          {section.lessons.map((lesson, lIndex) => {
                            const lessonKey = `lesson-${cIndex}-${sIndex}-${lIndex}`;
                            const isCollapsed = collapsed.lessons[lessonKey];

                            return (
                            <div key={lIndex} id={lessonKey} className="bg-white p-4 rounded border border-gray-200 shadow-sm scroll-mt-24">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-gray-800 text-sm">{lesson.title || `Bài học ${lIndex + 1}`}</span>
                                <div className="flex gap-1">
                                  <button onClick={() => toggleCollapse('lessons', lessonKey)} className="text-gray-500 hover:bg-gray-100 p-1 rounded">{isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}</button>
                                  <button onClick={() => removeLesson(cIndex, sIndex, lIndex)} className="text-red-400 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
                                </div>
                              </div>

                              {!isCollapsed && (
                                <>
                                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                                    <div className="flex-1 space-y-3">
                                      <input type="text" value={lesson.title} placeholder="Tên bài học lý thuyết..." onChange={(e) => updateLesson(cIndex, sIndex, lIndex, 'title', e.target.value)} className="w-full p-2 border rounded text-sm outline-none focus:border-blue-400" />
                                      <div className="flex gap-2">
                                        <select value={lesson.type} onChange={(e) => updateLesson(cIndex, sIndex, lIndex, 'type', e.target.value)} className="p-2 border rounded text-sm outline-none bg-white">
                                          <option value="video_upload">Video MP4</option><option value="image">Hình ảnh</option><option value="youtube">Link YouTube</option><option value="document">Tài liệu (PDF/Link)</option>
                                        </select>
                                        <div className="flex-1">
                                          {lesson.type === 'youtube' || lesson.type === 'document' ? (
                                            <input type="text" value={lesson.contentUrl} onChange={(e) => updateLesson(cIndex, sIndex, lIndex, 'contentUrl', e.target.value)} placeholder="Link/URL..." className="w-full p-2 border rounded text-sm outline-none" />
                                          ) : (
                                            <label className="cursor-pointer bg-gray-50 border hover:bg-gray-100 px-3 py-2 rounded text-sm font-medium flex items-center justify-center">
                                              {lesson.contentUrl ? '✅ Đã tải file' : 'Tải File'}
                                              <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateLesson(cIndex, sIndex, lIndex, 'contentUrl', url))} />
                                            </label>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="w-full md:w-[40%] aspect-video bg-gray-50 rounded border border-dashed flex items-center justify-center overflow-hidden"><LessonPreview lesson={lesson} /></div>
                                  </div>

                                  {lesson.exercises && lesson.exercises.length > 0 && (
                                    <div className="mt-4 border-t pt-4">
                                      <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-2"><List size={14}/> Bài tập</h4>
                                      {lesson.exercises.map((exercise, eIndex) => renderExerciseForm(exercise, cIndex, sIndex, lIndex, eIndex))}
                                    </div>
                                  )}
                                  <button onClick={() => addExercise(cIndex, sIndex, lIndex)} className="mt-3 text-sm text-blue-600 font-medium hover:underline">+ Thêm Bài tập</button>
                                </>
                              )}
                            </div>
                          )})}
                          <button onClick={() => addLesson(cIndex, sIndex)} className="text-sm text-gray-600 font-medium hover:text-blue-600">+ Thêm Bài học (Lý thuyết)</button>
                        </div>
                      )}
                    </div>
                  )})}
                  <button onClick={() => addSection(cIndex)} className="text-sm text-orange-600 font-medium hover:underline">+ Thêm Unit / Buổi Học</button>
                </div>
              )}
            </div>
          )})}
          <button onClick={addChapter} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:bg-gray-50 hover:text-blue-600 transition-colors">+ Thêm Chương</button>
        </div>
      </div>
    </div>
  );
};