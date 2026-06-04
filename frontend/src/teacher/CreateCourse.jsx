// src/pages/Teacher/CreateCourse.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Image as ImageIcon, Video, Trash2 } from 'lucide-react'; // Đã gỡ bỏ Youtube bị lỗi

export const CreateCourse = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [courseInfo, setCourseInfo] = useState({
    title: '',
    description: '',
    subject: 'Tiếng Anh',
    tag: 'Cơ bản',
    price: '',
    thumbnail: ''
  });

  // Cấu trúc 3 cấp: Chapter (Ngày) -> Section (Unit/Buổi) -> Lesson (Nội dung)
  const [chapters, setChapters] = useState([
    {
      title: 'Ngày 1',
      sections: [
        {
          title: 'Unit 1 - Buổi 1',
          lessons: [{ title: '', type: 'video_upload', contentUrl: '', duration: 0 }]
        }
      ]
    }
  ]);

  // --- XỬ LÝ THÔNG TIN CƠ BẢN ---
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setCourseInfo(prev => ({ ...prev, [name]: value }));
  };
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Hàm upload dùng chung (Thumbnail, Video, Ảnh)
  const uploadFileToServer = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');
    
    const res = await axios.post(`${API_URL}/api/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
    });
    return res.data.secure_url;
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    toast.info('Đang tải ảnh bìa lên...');
    try {
      const url = await uploadFileToServer(file);
      setCourseInfo(prev => ({ ...prev, thumbnail: url }));
      toast.success('Tải ảnh bìa thành công!');
    } catch (error) {
      toast.error('Lỗi tải ảnh bìa!');
    } finally {
      setIsUploading(false);
    }
  };

  // --- XỬ LÝ LOGIC 3 CẤP (NGÀY -> UNIT -> NỘI DUNG) ---
  const addChapter = () => {
    setChapters([...chapters, { title: `Ngày ${chapters.length + 1}`, sections: [] }]);
  };

  const addSection = (cIndex) => {
    const newChapters = [...chapters];
    newChapters[cIndex].sections.push({ title: `Unit - Buổi mới`, lessons: [] });
    setChapters(newChapters);
  };

  const addLesson = (cIndex, sIndex) => {
    const newChapters = [...chapters];
    newChapters[cIndex].sections[sIndex].lessons.push({ title: '', type: 'video_upload', contentUrl: '', duration: 0 });
    setChapters(newChapters);
  };

  const updateLesson = (cIndex, sIndex, lIndex, field, value) => {
    const newChapters = [...chapters];
    newChapters[cIndex].sections[sIndex].lessons[lIndex][field] = value;
    // Reset url nếu đổi type
    if (field === 'type') newChapters[cIndex].sections[sIndex].lessons[lIndex]['contentUrl'] = ''; 
    setChapters(newChapters);
  };

  const handleLessonUpload = async (e, cIndex, sIndex, lIndex, fileTypeDesc) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    toast.info(`Đang tải ${fileTypeDesc} lên...`);
    try {
      const url = await uploadFileToServer(file);
      updateLesson(cIndex, sIndex, lIndex, 'contentUrl', url);
      toast.success(`Tải ${fileTypeDesc} thành công!`);
    } catch (error) {
      toast.error(`Lỗi tải ${fileTypeDesc}!`);
    } finally {
      setIsUploading(false);
    }
  };

  const removeLesson = (cIndex, sIndex, lIndex) => {
    const newChapters = [...chapters];
    newChapters[cIndex].sections[sIndex].lessons.splice(lIndex, 1);
    setChapters(newChapters);
  };

  // --- SUBMIT ---
  const handleSaveCourse = async () => {
    if (!courseInfo.title) return toast.error('Vui lòng nhập tên khóa học!');
    try {
      const payload = { ...courseInfo, chapters };
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/courses`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Xuất bản khóa học thành công!');
    } catch (error) {
      toast.error('Lỗi khi lưu khóa học!');
    }
  };

  // --- RENDER PREVIEW COMPONENT ---
  const renderPreview = (type, url) => {
    if (!url) return null;
    if (type === 'image') return <img src={url} alt="preview" className="mt-3 max-h-40 rounded border shadow-sm object-cover" />;
    if (type === 'video_upload') return <video src={url} controls className="mt-3 max-h-40 w-full bg-black rounded border shadow-sm" />;
    if (type === 'youtube') {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1];
      if (!videoId) return <p className="text-red-500 text-xs mt-2">Link YouTube không hợp lệ</p>;
      return (
        <iframe className="mt-3 w-full h-40 rounded border shadow-sm" src={`https://www.youtube.com/embed/${videoId}`} title="YouTube preview" frameBorder="0" allowFullScreen></iframe>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen font-primary">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Tạo Khóa Học Mới</h2>
          <button onClick={handleSaveCourse} disabled={isUploading} className="bg-surface-raised text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-600 shadow-2 disabled:opacity-50 transition-all">
            Lưu & Xuất bản
          </button>
        </div>
        
        {/* THÔNG TIN CHUNG */}
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
                <textarea name="description" value={courseInfo.description} onChange={handleInfoChange} rows="3" className="w-full p-3 border rounded-lg bg-gray-50 outline-none" placeholder="Giới thiệu tổng quan về lộ trình..."></textarea>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Môn học</label>
                  <select name="subject" value={courseInfo.subject} onChange={handleInfoChange} className="w-full p-3 border rounded-lg bg-gray-50">
                    <option value="Toán">Toán</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="Tiếng Việt">Tiếng Việt</option>
                    <option value="Tiếng Trung">Tiếng Trung</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phân loại</label>
                  <select name="tag" value={courseInfo.tag} onChange={handleInfoChange} className="w-full p-3 border rounded-lg bg-gray-50">
                    <option value="Cơ bản">Cơ bản</option>
                    <option value="Nâng cao">Nâng cao</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Giá (VNĐ)</label>
                  <input type="number" name="price" value={courseInfo.price} onChange={handleInfoChange} className="w-full p-3 border rounded-lg bg-gray-50" placeholder="0 = Miễn phí" />
                </div>
              </div>
            </div>

            {/* Khối Thumbnail Preview */}
            <div className="flex flex-col">
              <label className="block font-semibold text-gray-700 mb-1">Ảnh bìa (Thumbnail)</label>
              <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden group">
                {courseInfo.thumbnail ? (
                  <>
                    <img src={courseInfo.thumbnail} alt="Thumbnail" className="w-full h-full object-cover absolute inset-0" />
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white font-medium">
                      Đổi ảnh khác
                      <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" disabled={isUploading}/>
                    </label>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-surface-raised transition-colors">
                    <ImageIcon size={40} className="mb-2 opacity-50" />
                    <span className="font-medium">Click để tải ảnh lên</span>
                    <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" disabled={isUploading}/>
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NỘI DUNG CHƯƠNG TRÌNH HỌC */}
        <h3 className="text-xl font-bold text-gray-800 mb-4">Lộ trình học tập</h3>
        
        <div className="space-y-6">
          {chapters.map((chapter, cIndex) => (
            <div key={cIndex} className="bg-white p-6 rounded-xl shadow-sm border-2 border-blue-100">
              {/* CẤP 1: NGÀY */}
              <div className="flex items-center gap-3 mb-4 border-b-2 border-blue-500 pb-2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-md font-bold text-sm">Chương {cIndex + 1}</span>
                <input 
                  type="text" value={chapter.title} 
                  onChange={(e) => {
                    const newChapters = [...chapters];
                    newChapters[cIndex].title = e.target.value;
                    setChapters(newChapters);
                  }}
                  className="text-xl font-bold text-gray-800 outline-none bg-transparent w-full"
                  placeholder="VD: Ngày 1"
                />
              </div>

              {/* CẤP 2: UNIT / BUỔI */}
              <div className="space-y-4 pl-4">
                {chapter.sections.map((section, sIndex) => (
                  <div key={sIndex} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                      <input 
                        type="text" value={section.title} 
                        onChange={(e) => {
                          const newChapters = [...chapters];
                          newChapters[cIndex].sections[sIndex].title = e.target.value;
                          setChapters(newChapters);
                        }}
                        className="font-bold text-orange-600 outline-none bg-transparent w-full"
                        placeholder="VD: Unit 1 - Buổi 1"
                      />
                    </div>

                    {/* CẤP 3: BÀI HỌC (LESSONS) */}
                    <div className="space-y-3 pl-4 border-l-2 border-gray-200 ml-1">
                      {section.lessons.map((lesson, lIndex) => (
                        <div key={lIndex} className="bg-white p-4 rounded-md shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-4 relative group">
                          
                          <button onClick={() => removeLesson(cIndex, sIndex, lIndex)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                            <Trash2 size={16} />
                          </button>

                          <div className="flex-1 space-y-3">
                            <div className="flex gap-3">
                              <input 
                                type="text" value={lesson.title} placeholder="Tên bài học (VD: Hướng dẫn phát âm)"
                                onChange={(e) => updateLesson(cIndex, sIndex, lIndex, 'title', e.target.value)}
                                className="p-2 border rounded-md flex-1 text-sm font-medium"
                              />
                              <input 
                                type="number" value={lesson.duration} placeholder="Phút"
                                onChange={(e) => updateLesson(cIndex, sIndex, lIndex, 'duration', e.target.value)}
                                className="p-2 border rounded-md w-24 text-sm"
                                title="Thời lượng (phút)"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Loại hình hiển thị */}
                              <select 
                                value={lesson.type} 
                                onChange={(e) => updateLesson(cIndex, sIndex, lIndex, 'type', e.target.value)}
                                className="p-2 border rounded-md text-sm bg-gray-50 outline-none"
                              >
                                <option value="video_upload">Video File (MP4)</option>
                                <option value="youtube">Link YouTube</option>
                                <option value="image">Hình ảnh</option>
                              </select>

                              {/* Khu vực input/upload dựa trên loại hình */}
                              <div className="flex-1">
                                {lesson.type === 'youtube' ? (
                                  <input 
                                    type="text" value={lesson.contentUrl} placeholder="Nhập Link YouTube (VD: https://youtube.com/...)"
                                    onChange={(e) => updateLesson(cIndex, sIndex, lIndex, 'contentUrl', e.target.value)}
                                    className="p-2 border rounded-md w-full text-sm text-red-600 bg-red-50"
                                  />
                                ) : (
                                  <div className="flex items-center gap-3">
                                    <label className="cursor-pointer bg-surface-muted border border-border-default hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                                      {lesson.type === 'image' ? <ImageIcon size={16}/> : <Video size={16}/>}
                                      {lesson.contentUrl ? 'Đổi file khác' : 'Chọn file tải lên'}
                                      <input 
                                        type="file" 
                                        accept={lesson.type === 'image' ? "image/*" : "video/*"} 
                                        className="hidden" 
                                        onChange={(e) => handleLessonUpload(e, cIndex, sIndex, lIndex, lesson.type === 'image' ? 'ảnh' : 'video')} 
                                        disabled={isUploading} 
                                      />
                                    </label>
                                    {lesson.contentUrl && <span className="text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded">Đã tải file</span>}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* KHU VỰC PREVIEW NỘI DUNG */}
                          <div className="w-full lg:w-1/3 bg-gray-50 rounded-md border border-dashed flex items-center justify-center p-2 min-h-[120px]">
                            {lesson.contentUrl ? renderPreview(lesson.type, lesson.contentUrl) : <span className="text-gray-400 text-sm">Chưa có nội dung Preview</span>}
                          </div>

                        </div>
                      ))}

                      {/* Nút thêm Lesson vào Unit này */}
                      <button onClick={() => addLesson(cIndex, sIndex)} className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline mt-2">
                        <Plus size={16} /> Thêm Nội dung học
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Nút thêm Unit vào Ngày này */}
                <button onClick={() => addSection(cIndex)} className="text-orange-600 text-sm font-bold flex items-center gap-1 hover:underline mt-4">
                  <Plus size={16} /> Thêm Unit / Buổi học mới
                </button>
              </div>
            </div>
          ))}

          {/* Nút thêm Ngày mới */}
          <button onClick={addChapter} className="w-full py-4 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
            <Plus size={20} /> Thêm Ngày / Chương học mới
          </button>
        </div>

      </div>
    </div>
  );
};