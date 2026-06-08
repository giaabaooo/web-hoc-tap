// src/pages/Teacher/CreateCourse.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Image as ImageIcon, Video, Trash2, FileEdit, Mic, Headphones, ScanLine, Type, FileText } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore'; 

export const CreateCourse = () => {
  const { user, token } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [courseInfo, setCourseInfo] = useState({
    title: '', description: '', subject: 'Tiếng Anh', tag: 'Cơ bản', price: '', thumbnail: ''
  });

  const [chapters, setChapters] = useState([
    { title: 'Ngày 1', sections: [{ title: 'Unit 1 - Buổi 1', lessons: [{ title: '', type: 'video_upload', contentUrl: '', exercises: [] }] }] }
  ]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setCourseInfo(prev => ({ ...prev, [name]: value }));
  };

  // HÀM KIỂM TRA DỮ LIỆU CHẶT CHẼ TRƯỚC KHI LƯU
  const validateData = () => {
    if (!courseInfo.title.trim()) return "Vui lòng nhập Tên khóa học!";
    if (courseInfo.price === '' || isNaN(courseInfo.price) || Number(courseInfo.price) < 0) return "Vui lòng nhập Giá hợp lệ (Nhập 0 nếu Miễn phí)!";
    if (!courseInfo.thumbnail) return "Vui lòng tải lên Ảnh bìa (Thumbnail)!";

    for (let c = 0; c < chapters.length; c++) {
      const chapter = chapters[c];
      if (!chapter.title.trim()) return `Vui lòng nhập tên Chương ${c + 1}!`;
      if (chapter.sections.length === 0) return `Chương "${chapter.title}" cần ít nhất 1 Buổi học!`;

      for (let s = 0; s < chapter.sections.length; s++) {
        const section = chapter.sections[s];
        if (!section.title.trim()) return `Vui lòng nhập tên Buổi học ${s + 1} (thuộc Chương ${c + 1})!`;
        if (section.lessons.length === 0) return `Buổi học "${section.title}" cần ít nhất 1 Bài học lý thuyết!`;

        for (let l = 0; l < section.lessons.length; l++) {
          const lesson = section.lessons[l];
          if (!lesson.title.trim()) return `Vui lòng nhập Tên bài học lý thuyết thứ ${l + 1} (trong "${section.title}")!`;
          if (!lesson.contentUrl.trim()) return `Bài học "${lesson.title}" chưa có File đính kèm hoặc Đường dẫn (Link)!`;

          if (lesson.exercises) {
            for (let e = 0; e < lesson.exercises.length; e++) {
              const ex = lesson.exercises[e];
              if (!ex.question.trim()) return `Bài tập thứ ${e + 1} (trong "${lesson.title}") không được để trống Câu hỏi/Yêu cầu!`;
            }
          }
        }
      }
    }
    return null; // Trả về null nếu mọi thứ OK
  };

  const handleSaveCourse = async () => {
    const errorMsg = validateData();
    if (errorMsg) return toast.warning(errorMsg);

    try {
      const payload = { ...courseInfo, chapters };
      await axios.post(`${API_URL}/api/courses`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Xuất bản khóa học thành công!');
    } catch (error) { 
      console.error(error.response?.data);
      toast.error(error.response?.data?.message || 'Lỗi khi lưu khóa học! Vui lòng kiểm tra lại đường truyền mạng.'); 
    }
  };

  const uploadFileToServer = async (file) => {
    const formData = new FormData(); formData.append('file', file);
    const res = await axios.post(`${API_URL}/api/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }});
    return res.data.secure_url;
  };

  const handleFileUpload = async (e, callback, fileTypeDesc) => {
    const file = e.target.files[0]; if (!file) return;
    setIsUploading(true); toast.info(`Đang tải ${fileTypeDesc} lên...`);
    try {
      const url = await uploadFileToServer(file);
      callback(url); toast.success(`Tải ${fileTypeDesc} thành công!`);
    } catch (error) { toast.error(`Lỗi tải ${fileTypeDesc}!`); } 
    finally { setIsUploading(false); }
  };

  // HÀM EXTRACT YOUTUBE ID DÙNG CHO PREVIEW
  const getYouTubeId = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
    return (match && match[1]) ? match[1] : null;
  };

  // COMPONENT HIỂN THỊ PREVIEW
  const LessonPreview = ({ lesson }) => {
    if (!lesson.contentUrl) {
      return <div className="text-gray-400 font-medium text-sm">Khu vực xem trước nội dung</div>;
    }
    if (lesson.type === 'image') {
      return <img src={lesson.contentUrl} alt="Preview" className="w-full h-full object-contain bg-black/5" />;
    }
    if (lesson.type === 'video_upload') {
      return <video src={lesson.contentUrl} controls className="w-full h-full bg-black object-contain" />;
    }
    if (lesson.type === 'youtube') {
      const yId = getYouTubeId(lesson.contentUrl);
      if (yId) {
        return <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${yId}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>;
      }
      return <div className="text-red-500 font-medium text-sm text-center px-4">Link YouTube không hợp lệ! Vui lòng kiểm tra lại.</div>;
    }
    // Dành cho Document (PDF) hoặc Link khác
    return (
      <div className="flex flex-col items-center justify-center p-4 text-blue-500">
        <FileText size={40} className="mb-2 opacity-80" />
        <span className="text-xs text-center break-all text-gray-600 px-4 font-medium">{lesson.contentUrl}</span>
      </div>
    );
  };

  const addChapter = () => setChapters([...chapters, { title: `Ngày ${chapters.length + 1}`, sections: [] }]);
  const addSection = (cIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections.push({ title: `Unit - Buổi mới`, lessons: [] }); setChapters(newChapters); };
  const addLesson = (cIndex, sIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons.push({ title: '', type: 'video_upload', contentUrl: '', exercises: [] }); setChapters(newChapters); };
  const updateLesson = (cIndex, sIndex, lIndex, field, value) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons[lIndex][field] = value; if (field === 'type') newChapters[cIndex].sections[sIndex].lessons[lIndex]['contentUrl'] = ''; setChapters(newChapters); };
  const removeLesson = (cIndex, sIndex, lIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons.splice(lIndex, 1); setChapters(newChapters); };
  
  const addExercise = (cIndex, sIndex, lIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises.push({ type: 'multiple_choice', instruction: '', question: '', options: ['', '', '', ''], correctAnswer: '', points: 10, contentUrl: '' }); setChapters(newChapters); };
  
  const updateExercise = (cIndex, sIndex, lIndex, eIndex, field, value) => { 
    const newChapters = [...chapters]; 
    newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex][field] = value; 
    if (field === 'type') {
      if (value === 'matching') newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].options = ['|', '|', '|', '|'];
      else if (value === 'multiple_choice') newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].options = ['', '', '', ''];
      else if (value === 'fill_blank') newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].options = []; 
    } 
    setChapters(newChapters); 
  };
  const updateExerciseOption = (cIndex, sIndex, lIndex, eIndex, optIndex, value) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].options[optIndex] = value; setChapters(newChapters); };
  const updateMatchingOption = (cIndex, sIndex, lIndex, eIndex, optIndex, side, value) => { const newChapters = [...chapters]; let currentVal = newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].options[optIndex] || '|'; let parts = currentVal.split('|'); parts[side === 'left' ? 0 : 1] = value; newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises[eIndex].options[optIndex] = parts.join('|'); setChapters(newChapters); };
  const removeExercise = (cIndex, sIndex, lIndex, eIndex) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].lessons[lIndex].exercises.splice(eIndex, 1); setChapters(newChapters); };

  const renderExerciseForm = (exercise, cIndex, sIndex, lIndex, eIndex) => {
    const isFillBlankChoice = exercise.type === 'fill_blank' && exercise.options && exercise.options.length > 0;

    return (
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mt-4 relative shadow-sm">
        <button onClick={() => removeExercise(cIndex, sIndex, lIndex, eIndex)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 bg-white p-1.5 rounded-md border shadow-sm transition-colors z-10"><Trash2 size={16}/></button>
        
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <select value={exercise.type} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'type', e.target.value)} className="p-2 border border-blue-300 rounded-lg text-sm bg-blue-50 font-bold text-blue-700 outline-none hover:bg-blue-100 transition-colors">
            <option value="multiple_choice">🔘 Trắc nghiệm (4 đáp án)</option>
            <option value="fill_blank">📝 Điền vào chỗ trống</option>
            <option value="speaking">🎙️ Luyện nói AI</option>
            <option value="listening">🎧 Luyện nghe</option>
            <option value="matching">🔗 Nối từ</option>
            <option value="flashcard">🗂️ Thẻ từ vựng</option>
            <option value="vocab">📖 Học từ vựng</option>
            <option value="essay">✍️ Tự luận</option>
          </select>
          <div className="flex items-center gap-2 bg-white border px-3 py-1.5 rounded-lg"><span className="text-sm font-semibold text-gray-500">Điểm:</span><input type="number" value={exercise.points} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'points', e.target.value)} className="w-12 text-sm font-bold text-gray-800 outline-none bg-transparent" /></div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 bg-slate-100 text-slate-400 text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-br-lg">Giao diện học sinh</div>
          <div className="mt-6">
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Hướng dẫn làm bài (Không bắt buộc)</label>
              <textarea
                value={exercise.instruction || ''}
                onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'instruction', e.target.value)}
                placeholder="VD: Lắng nghe đoạn audio và chọn đáp án đúng..."
                className="w-full p-2.5 text-sm bg-yellow-50 border border-yellow-200 rounded-lg outline-none focus:border-yellow-400 focus:bg-yellow-100/50 transition-colors resize-none"
                rows="2"
              />
            </div>

            {exercise.type === 'multiple_choice' && (
              <div className="space-y-4">
                <input type="text" value={exercise.question} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'question', e.target.value)} placeholder="Nhập câu hỏi trắc nghiệm..." className="w-full text-lg font-bold text-gray-800 outline-none border-b-2 border-transparent focus:border-blue-400 pb-1" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {exercise.options.map((opt, oIdx) => (
                    <label key={oIdx} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${exercise.correctAnswer === opt && opt !== '' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-300'}`}>
                      <input type="radio" name={`correct-${cIndex}-${sIndex}-${lIndex}-${eIndex}`} checked={exercise.correctAnswer === opt && opt !== ''} onChange={() => updateExercise(cIndex, sIndex, lIndex, eIndex, 'correctAnswer', opt)} className="w-4 h-4 text-blue-600" />
                      <input type="text" value={opt} onChange={(e) => updateExerciseOption(cIndex, sIndex, lIndex, eIndex, oIdx, e.target.value)} placeholder={`Lựa chọn ${oIdx + 1}`} className="flex-1 bg-transparent outline-none text-sm font-medium" />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {exercise.type === 'fill_blank' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-blue-50 text-blue-800 text-xs p-2 rounded mb-2">
                  <div className="flex gap-2"><Type size={14}/> Mẹo: Dùng 3 dấu gạch dưới <b>___</b> để tạo ô trống.</div>
                  <button onClick={() => updateExercise(cIndex, sIndex, lIndex, eIndex, 'options', isFillBlankChoice ? [] : ['', '', '', ''])} className="bg-blue-600 text-white px-3 py-1 rounded font-bold hover:bg-blue-700 transition-colors">
                    {isFillBlankChoice ? 'Chuyển sang: Học sinh Tự gõ' : 'Chuyển sang: Trắc nghiệm 4 đáp án'}
                  </button>
                </div>
                <textarea value={exercise.question} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'question', e.target.value)} placeholder="Ví dụ: I go to ___ every morning." className="w-full text-lg font-medium text-gray-800 outline-none resize-none bg-transparent" rows="2" />
                
                {isFillBlankChoice ? (
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <p className="text-sm font-bold text-green-800 mb-2">Nhập 4 lựa chọn & Chọn đáp án đúng:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {exercise.options.map((opt, oIdx) => (
                        <label key={oIdx} className="flex items-center gap-3 bg-white p-2 border rounded-lg cursor-pointer">
                          <input type="radio" name={`fb-correct-${cIndex}-${sIndex}-${lIndex}-${eIndex}`} checked={exercise.correctAnswer === opt && opt !== ''} onChange={() => updateExercise(cIndex, sIndex, lIndex, eIndex, 'correctAnswer', opt)} className="w-4 h-4 text-green-600" />
                          <input type="text" value={opt} onChange={(e) => updateExerciseOption(cIndex, sIndex, lIndex, eIndex, oIdx, e.target.value)} placeholder={`Lựa chọn ${oIdx + 1}`} className="flex-1 outline-none text-sm font-medium" />
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-green-50 p-3 rounded-lg border border-green-200">
                    <span className="text-sm font-bold text-green-800">Đáp án đúng:</span>
                    <input type="text" value={exercise.correctAnswer} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'correctAnswer', e.target.value)} placeholder="Nhập từ cần điền..." className="flex-1 bg-white border border-green-300 rounded px-3 py-1.5 text-sm outline-none font-medium text-green-700" />
                  </div>
                )}
              </div>
            )}

            {exercise.type === 'speaking' && (
              <div className="flex flex-col items-center justify-center py-6 text-center"><div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6"><Mic size={32} /></div><input type="text" value={exercise.question} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'question', e.target.value)} placeholder="Nhập câu tiếng Anh cần đọc..." className="w-full max-w-lg text-2xl font-bold text-gray-800 text-center outline-none border-b-2 border-dashed border-gray-300 focus:border-blue-500 pb-2 bg-transparent" /></div>
            )}

            {exercise.type === 'listening' && (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200 p-6">
                  {exercise.contentUrl ? (
                    <div className="flex items-center gap-4 w-full max-w-sm bg-white p-3 rounded-full shadow-sm border border-gray-200"><button className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center"><Headphones size={20}/></button><div className="flex-1 h-2 bg-gray-200 rounded-full"><div className="w-1/3 h-full bg-blue-500"></div></div><label className="text-xs text-blue-600 font-bold cursor-pointer hover:underline">Đổi file<input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'contentUrl', url), 'File Nghe')} disabled={isUploading}/></label></div>
                  ) : (<label className="cursor-pointer flex flex-col items-center text-gray-500 hover:text-blue-600"><Headphones size={40} className="mb-2 opacity-50" /><span className="font-medium text-sm">Click để tải Audio (MP3)</span><input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'contentUrl', url), 'File Nghe')} disabled={isUploading}/></label>)}
                </div>
                <div className="space-y-2"><input type="text" value={exercise.question} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'question', e.target.value)} placeholder="Câu hỏi..." className="w-full text-sm font-medium text-gray-800 outline-none border-b focus:border-blue-400 pb-1" /><input type="text" value={exercise.correctAnswer} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'correctAnswer', e.target.value)} placeholder="Đáp án đúng..." className="w-full bg-green-50 border border-green-300 rounded-lg px-4 py-3 text-sm outline-none font-medium text-green-800" /></div>
              </div>
            )}

            {exercise.type === 'matching' && (
              <div className="space-y-4">
                <input type="text" value={exercise.question} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'question', e.target.value)} placeholder="Yêu cầu..." className="w-full text-lg font-bold text-gray-800 outline-none border-b-2 focus:border-blue-400 pb-1 mb-2" />
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-3 px-2"><span>Cột A</span><span>Cột B</span></div>
                  <div className="space-y-3">
                    {exercise.options.map((opt, oIdx) => {
                      const parts = opt.split('|');
                      return (
                        <div key={oIdx} className="flex items-center gap-4"><input type="text" value={parts[0]||''} onChange={(e) => updateMatchingOption(cIndex, sIndex, lIndex, eIndex, oIdx, 'left', e.target.value)} placeholder="Từ A" className="flex-1 p-2 border rounded-lg text-sm text-center outline-none focus:border-blue-400" /><ScanLine size={18} className="text-gray-300" /><input type="text" value={parts[1]||''} onChange={(e) => updateMatchingOption(cIndex, sIndex, lIndex, eIndex, oIdx, 'right', e.target.value)} placeholder="Nghĩa B" className="flex-1 p-2 border rounded-lg text-sm text-center outline-none focus:border-green-400" /></div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {(exercise.type === 'flashcard' || exercise.type === 'vocab') && (
              <div className="space-y-4">
                 <input type="text" value={exercise.question} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'question', e.target.value)} placeholder={exercise.type === 'flashcard' ? "Mặt trước thẻ" : "Từ vựng cần học"} className="w-full text-2xl font-bold text-center text-blue-600 outline-none border-b-2 border-dashed focus:border-blue-400 pb-2 bg-transparent" />
                 <input type="text" value={exercise.correctAnswer} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'correctAnswer', e.target.value)} placeholder={exercise.type === 'flashcard' ? "Mặt sau thẻ" : "Nghĩa / Giải thích"} className="w-full text-lg font-medium text-center text-gray-600 outline-none bg-transparent" />
                 <div className="flex justify-center mt-4">
                    {exercise.contentUrl ? (
                      <div className="relative w-32 h-32 rounded-lg border overflow-hidden group">
                        <img src={exercise.contentUrl} alt="Vocab" className="w-full h-full object-cover" />
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer text-white text-xs font-bold transition-opacity">Đổi ảnh<input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'contentUrl', url), 'Ảnh')} disabled={isUploading}/></label>
                      </div>
                    ) : (<label className="cursor-pointer bg-gray-50 border border-dashed text-gray-500 px-4 py-3 rounded-lg text-sm font-medium flex gap-2"><ImageIcon size={18}/> Thêm ảnh<input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'contentUrl', url), 'Ảnh')} disabled={isUploading}/></label>)}
                 </div>
              </div>
            )}

            {exercise.type === 'essay' && (
              <div className="space-y-4">
                <textarea value={exercise.question} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'question', e.target.value)} placeholder="Nhập đề bài tự luận..." className="w-full text-lg font-bold text-gray-800 outline-none resize-none bg-transparent" rows="3" />
                <div className="w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm font-medium">Khu vực học sinh sẽ nhập văn bản</div>
                <div className="mt-4 border-t pt-4">
                  <label className="block text-sm font-bold text-gray-600 mb-2">Barem chấm điểm (Dành cho giáo viên):</label>
                  <textarea value={exercise.correctAnswer} onChange={(e) => updateExercise(cIndex, sIndex, lIndex, eIndex, 'correctAnswer', e.target.value)} placeholder="Nhập các ý chính..." className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm outline-none" rows="3" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Tạo Khóa Học Mới</h2>
          <button onClick={handleSaveCourse} disabled={isUploading} className="bg-surface-raised text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-600 shadow-2 disabled:opacity-50 transition-all">
            Lưu & Xuất bản
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-1 border border-border-default mb-8 space-y-5">
          <h3 className="text-xl font-bold text-gray-800 border-b pb-3">Thông tin cơ bản</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tên khóa học *</label>
                <input type="text" name="title" value={courseInfo.title} onChange={handleInfoChange} className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 outline-none" placeholder="VD: Tiếng Anh Starters 360 ngày" />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mô tả khóa học</label>
                <textarea name="description" value={courseInfo.description} onChange={handleInfoChange} rows="3" className="w-full p-3 border rounded-lg bg-gray-50 outline-none"></textarea>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Môn học</label>
                  <select name="subject" value={courseInfo.subject} onChange={handleInfoChange} className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 outline-none">
                    <option value="Tiếng Anh">Tiếng Anh</option><option value="Tiếng Việt">Tiếng Việt</option><option value="Tiếng Trung">Tiếng Trung</option><option value="Toán">Toán</option><option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phân loại</label>
                  <select name="tag" value={courseInfo.tag} onChange={handleInfoChange} className="w-full p-3 border rounded-lg bg-gray-50">
                    <option value="Cơ bản">Cơ bản</option><option value="Nâng cao">Nâng cao</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Giá (VNĐ) *</label>
                  <input type="number" name="price" value={courseInfo.price} onChange={handleInfoChange} className="w-full p-3 border rounded-lg bg-gray-50 border-orange-300" placeholder="0 = Miễn phí" />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="block font-semibold text-gray-700 mb-1">Ảnh bìa (Thumbnail) *</label>
              <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden group min-h-[250px]">
                {courseInfo.thumbnail ? (
                  <>
                    <img src={courseInfo.thumbnail} alt="Thumbnail" className="w-full h-full object-cover absolute inset-0" />
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white font-medium">Đổi ảnh khác<input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setCourseInfo(prev => ({ ...prev, thumbnail: url })), 'Ảnh bìa')} className="hidden" disabled={isUploading}/></label>
                  </>
                ) : (<label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-500"><ImageIcon size={40} className="mb-2 opacity-50" /><span className="font-medium">Tải ảnh lên</span><input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setCourseInfo(prev => ({ ...prev, thumbnail: url })), 'Ảnh bìa')} className="hidden" disabled={isUploading}/></label>)}
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-4">Lộ trình & Nội dung học</h3>
        <div className="space-y-6">
          {chapters.map((chapter, cIndex) => (
            <div key={cIndex} className="bg-white p-6 rounded-xl shadow-sm border-2 border-blue-100">
              <div className="flex items-center gap-3 mb-4 border-b-2 border-blue-500 pb-2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-md font-bold text-sm">Chương {cIndex + 1}</span>
                <input type="text" value={chapter.title} onChange={(e) => { const newChapters = [...chapters]; newChapters[cIndex].title = e.target.value; setChapters(newChapters); }} className="text-xl font-bold text-gray-800 outline-none bg-transparent w-full" placeholder="Nhập tên Chương..." />
              </div>

              <div className="space-y-4 pl-4">
                {chapter.sections.map((section, sIndex) => (
                  <div key={sIndex} className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-3">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <input type="text" value={section.title} onChange={(e) => { const newChapters = [...chapters]; newChapters[cIndex].sections[sIndex].title = e.target.value; setChapters(newChapters); }} className="font-bold text-lg text-orange-600 outline-none bg-transparent w-full" placeholder="Nhập tên Buổi học..." />
                    </div>

                    <div className="space-y-6 pl-2 border-l-2 border-orange-200 ml-1.5">
                      {section.lessons.map((lesson, lIndex) => (
                        <div key={lIndex} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 relative group">
                          <button onClick={() => removeLesson(cIndex, sIndex, lIndex)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 bg-gray-50 p-1.5 rounded-md transition-colors z-10" title="Xóa bài học"><Trash2 size={18} /></button>

                          {/* KHU VỰC NHẬP LÝ THUYẾT ĐÃ ĐƯỢC CHIA ĐÔI LAYOUT */}
                          <div className="flex flex-col md:flex-row gap-6 mb-2">
                            {/* NỬA TRÁI: Nhập liệu */}
                            <div className="flex-1 space-y-4 pt-1">
                              <input type="text" value={lesson.title} placeholder="Tên bài học lý thuyết (VD: Vocabulary, Grammar...)" onChange={(e) => updateLesson(cIndex, sIndex, lIndex, 'title', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg text-sm font-bold bg-gray-50 outline-none focus:border-blue-400 focus:bg-white transition-colors" />

                              <div className="flex flex-col xl:flex-row xl:items-center gap-3">
                                <select value={lesson.type} onChange={(e) => updateLesson(cIndex, sIndex, lIndex, 'type', e.target.value)} className="p-3 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-blue-400 font-medium">
                                  <option value="video_upload">Video MP4</option>
                                  <option value="image">Hình ảnh</option>
                                  <option value="youtube">Link YouTube</option>
                                  <option value="document">Tài liệu (PDF/Link)</option>
                                </select>
                                
                                <div className="flex-1">
                                  {lesson.type === 'youtube' || lesson.type === 'document' ? (
                                    <input type="text" value={lesson.contentUrl} placeholder="Nhập Link/URL (VD: https://...)" onChange={(e) => updateLesson(cIndex, sIndex, lIndex, 'contentUrl', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-400" />
                                  ) : (
                                    <label className="cursor-pointer bg-gray-100 border border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 px-5 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all w-full">
                                      {lesson.type === 'image' ? <ImageIcon size={18}/> : <Video size={18}/>} 
                                      {lesson.contentUrl ? '✅ Đã tải file - Đổi file' : (lesson.type === 'image' ? 'Chọn Ảnh tải lên' : 'Chọn Video tải lên')}
                                      <input type="file" accept={lesson.type === 'image' ? "image/*" : "video/*"} className="hidden" onChange={(e) => handleFileUpload(e, (url) => updateLesson(cIndex, sIndex, lIndex, 'contentUrl', url), lesson.type === 'image' ? 'Ảnh' : 'Video')} disabled={isUploading} />
                                    </label>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* NỬA PHẢI: Khung Preview To */}
                            <div className="w-full md:w-[45%] lg:w-1/2 aspect-video bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative shadow-inner">
                               <LessonPreview lesson={lesson} />
                            </div>
                          </div>

                          {lesson.exercises && lesson.exercises.length > 0 && (
                            <div className="mt-6 border-t border-gray-200 pt-5">
                              <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2"><FileEdit size={16} className="text-blue-500"/> Các bài tập / hoạt động đi kèm:</h4>
                              {lesson.exercises.map((exercise, eIndex) => renderExerciseForm(exercise, cIndex, sIndex, lIndex, eIndex))}
                            </div>
                          )}

                          <div className="mt-5 text-center"><button onClick={() => addExercise(cIndex, sIndex, lIndex)} className="inline-flex items-center justify-center gap-2 text-green-600 bg-green-50/80 border border-green-200 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-green-100 hover:shadow-sm transition-all w-full md:w-auto"><Plus size={18} /> Thêm Hoạt động / Bài tập</button></div>
                        </div>
                      ))}

                      <button onClick={() => addLesson(cIndex, sIndex)} className="text-blue-600 bg-blue-50/50 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-100 transition-colors w-max"><Plus size={16} /> Thêm Bài học Lý thuyết mới</button>
                    </div>
                  </div>
                ))}
                
                <button onClick={() => addSection(cIndex)} className="text-orange-600 text-sm font-bold flex items-center gap-2 hover:underline mt-4 px-2"><Plus size={18} /> Thêm Buổi học / Unit mới</button>
              </div>
            </div>
          ))}

          <button onClick={addChapter} className="w-full py-5 border-2 border-dashed border-blue-400 bg-blue-50/30 rounded-2xl text-blue-600 font-bold hover:bg-blue-50 hover:border-blue-500 transition-all flex items-center justify-center gap-2 shadow-sm"><Plus size={24} /> Thêm Chương mới (Ngày mới)</button>
        </div>
      </div>
    </div>
  );
};