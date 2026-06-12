// src/admin/CoursesTab.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package as PackageIcon, CheckCircle2, Tag, ListOrdered, FileText, FileEdit, X, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store/useAuthStore';

export const CoursesTab = () => {
  const [courses, setCourses] = useState([]);
  const [combos, setCombos] = useState([]);
  const [courseTab, setCourseTab] = useState('list');
  const [isLoading, setIsLoading] = useState(true);

  const [editingComboId, setEditingComboId] = useState(null);

  const [comboForm, setComboForm] = useState({
    title: '', price: '', durationDays: 365, type: 'fixed', courses: [],
    tagsInput: '', priority: 0, featuresInput: ''
  });

  // --- STATE CHO MODAL EDIT KHÓA HỌC LẺ ---
  const [courseModal, setCourseModal] = useState({ isOpen: false, courseId: null, title: '' });
  const [courseForm, setCourseForm] = useState({
    price: '', durationDays: 9999, tagsInput: '', priority: 0, featuresInput: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuthStore();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchData = async () => {
    if (!token) return; // Fix 1: Chặn chạy nếu mất token
    try {
      setIsLoading(true);
      const [coursesRes, combosRes] = await Promise.all([
        axios.get(`${API_URL}/api/courses`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/admin/packages`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCourses(coursesRes.data);
      setCombos(combosRes.data);
    } catch (error) {
      // Fix 2: Đưa check 401 vào CATCH
      if (error.response?.status === 401) {
        console.warn("Phiên đăng nhập đã hết hạn.");
      } else {
        toast.error("Lỗi khi tải dữ liệu");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  /* ================== LOGIC COMBO (Giữ nguyên của bạn) ================== */
  const handleCourseToggle = (courseId, isChecked) => {
    if (isChecked) setComboForm(prev => ({ ...prev, courses: [...prev.courses, courseId] }));
    else setComboForm(prev => ({ ...prev, courses: prev.courses.filter(id => id !== courseId) }));
  };

  const handleEditCombo = (combo) => {
    setEditingComboId(combo._id);
    const courseIds = combo.courses ? combo.courses.map(c => typeof c === 'object' ? c._id : c) : [];
    setComboForm({
      title: combo.title, price: combo.price, durationDays: combo.durationDays, type: combo.type || 'fixed',
      courses: courseIds, tagsInput: combo.tags ? combo.tags.join(', ') : '', priority: combo.priority || 0,
      featuresInput: combo.features ? combo.features.join('\n') : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingComboId(null);
    setComboForm({ title: '', price: '', durationDays: 365, type: 'fixed', courses: [], tagsInput: '', priority: 0, featuresInput: '' });
  };

  const handleSubmitCombo = async () => {
    if (!comboForm.title || comboForm.price === '' || comboForm.courses.length === 0) return toast.warning("Vui lòng điền tên, giá và chọn ít nhất 1 khóa học!");
    const payload = {
      title: comboForm.title, price: comboForm.price, durationDays: comboForm.durationDays, type: comboForm.type, courses: comboForm.courses,
      tags: comboForm.tagsInput.split(',').map(t => t.trim()).filter(t => t), priority: comboForm.priority, features: comboForm.featuresInput.split('\n').map(f => f.trim()).filter(f => f)
    };
    try {
      setIsSubmitting(true);
      if (editingComboId) {
        await axios.put(`${API_URL}/api/admin/packages/${editingComboId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Cập nhật Combo thành công!");
      } else {
        await axios.post(`${API_URL}/api/admin/packages`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Tạo Combo thành công!");
      }
      handleCancelEdit(); fetchData();
    } catch (error) { toast.error(error.response?.data?.message || "Lỗi xử lý Combo"); } finally { setIsSubmitting(false); }
  };

  /* ================== LOGIC EDIT BÁN HÀNG KHÓA LẺ ================== */
  const handleOpenCourseModal = (course) => {
    setCourseModal({ isOpen: true, courseId: course._id, title: course.title });
    setCourseForm({
      price: course.price || 0,
      durationDays: course.durationDays || 9999,
      tagsInput: course.tags && Array.isArray(course.tags) ? course.tags.join(', ') : (course.tag || ''),
      priority: course.priority || 0,
      featuresInput: course.features ? course.features.join('\n') : ''
    });
  };

  const handleSaveCourseMarketing = async () => {
    const payload = {
      price: courseForm.price,
      durationDays: courseForm.durationDays,
      priority: courseForm.priority,
      tags: courseForm.tagsInput.split(',').map(t => t.trim()).filter(t => t),
      features: courseForm.featuresInput.split('\n').map(f => f.trim()).filter(f => f)
    };

    try {
      setIsSubmitting(true);
      await axios.put(`${API_URL}/api/admin/courses/${courseModal.courseId}/marketing`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Đã cập nhật thông tin bán khóa lẻ!");
      setCourseModal({ isOpen: false, courseId: null, title: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật khóa học");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fadeIn space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Khóa học & Gói Combo</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý nội dung học và thiết lập luật kết hợp Combo bán hàng.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button onClick={() => setCourseTab('list')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${courseTab === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Danh sách</button>
          <button onClick={() => setCourseTab('combo')} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${courseTab === 'combo' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Thiết lập Combo</button>
        </div>
      </div>

      {courseTab === 'list' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-extrabold tracking-wider">
                  <th className="p-4 pl-6">Khóa học</th>
                  <th className="p-4">Phân loại & Bán hàng</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 pr-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-slate-500 font-medium">Chưa có khóa học nào.</td></tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-4">
                          <img src={course.thumbnail || 'https://via.placeholder.com/150'} alt={course.title} className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-sm flex-shrink-0" />
                          <div className="font-bold text-slate-800 text-sm line-clamp-2 max-w-[280px]">
                            {course.title || "Chưa có tên khóa học"}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-slate-500 mb-1">Môn: <span className="font-bold text-slate-700">{course.subject}</span></div>
                        <div className="flex gap-1 flex-wrap mb-1.5">
                          {course.tags && Array.isArray(course.tags) ? course.tags.map((t, i) => (
                            <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-md">{t}</span>
                          )) : <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-md">{course.tag}</span>}
                        </div>
                        <div className="font-bold text-blue-600 text-sm">
                          {course.price > 0 ? `${course.price.toLocaleString('vi-VN')} ₫` : 'Miễn phí'}
                          <span className="text-slate-400 font-normal text-xs ml-1">({course.durationDays === 9999 ? 'Vĩnh viễn' : `${course.durationDays} ngày`})</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {course.isPublished ? (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[11px] font-extrabold px-3 py-1.5 rounded-lg border border-emerald-100 uppercase tracking-wide">
                            <CheckCircle2 size={14} /> Public
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-500 text-[11px] font-extrabold px-3 py-1.5 rounded-lg border border-slate-200 uppercase tracking-wide">
                            <FileText size={14} /> Draft
                          </span>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        {/* THÊM 2 NÚT THAO TÁC RÕ RÀNG */}
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenCourseModal(course)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-500 hover:text-white px-3 py-2 rounded-xl transition-all border border-amber-100 shadow-sm"
                          >
                            <ShoppingCart size={14} /> Bán hàng
                          </button>
                          <Link
                            to={`edit-course/${course._id}?tab=courses`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-xl transition-all border border-blue-100 shadow-sm"
                          >
                            <FileEdit size={14} /> Nội dung
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GIAO DIỆN TAB COMBO GIỮ NGUYÊN HOÀN TOÀN NHƯ CŨ, BẠN GIỮ CODE CỦA BẠN NHÉ */}
      {courseTab === 'combo' && (

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">



          {/* CỘT TRÁI: FORM TẠO/SỬA COMBO */}

          <div className={`lg:col-span-7 bg-white border ${editingComboId ? 'border-amber-400 shadow-amber-100' : 'border-slate-200'} rounded-2xl p-6 shadow-sm transition-all`}>



            <div className="flex justify-between items-center mb-6">

              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">

                {editingComboId ? (

                  <><FileEdit size={20} className="text-amber-500" /> Cập nhật luật Combo</>

                ) : (

                  <><Plus size={20} className="text-emerald-500" /> Tạo luật Combo mới</>

                )}

              </h3>



              {editingComboId && (

                <button onClick={handleCancelEdit} className="text-sm font-bold text-slate-500 hover:text-red-500 flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-lg">

                  <X size={16} /> Hủy sửa

                </button>

              )}

            </div>



            <div className="space-y-4">

              {/* Row 1: Tên */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">Tên Combo hiển thị</label>

                <input type="text" value={comboForm.title} onChange={(e) => setComboForm({ ...comboForm, title: e.target.value })} placeholder="VD: Combo 3 Sách Starter, Mover, Flyer" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 transition-colors" />

              </div>



              {/* Row 2: Tag & Priority */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1"><Tag size={14} /> Nhãn (Tags)</label>

                  <input type="text" value={comboForm.tagsInput} onChange={(e) => setComboForm({ ...comboForm, tagsInput: e.target.value })} placeholder="VD: Luyện thi, Phổ biến, Khuyến nghị" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 transition-colors" />

                  <p className="text-[11px] text-slate-500 mt-1">Cách nhau bởi dấu phẩy (,)</p>

                </div>

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1"><ListOrdered size={14} /> Độ ưu tiên hiển thị</label>

                  <input type="number" value={comboForm.priority} onChange={(e) => setComboForm({ ...comboForm, priority: e.target.value })} placeholder="Số càng lớn xếp càng lên đầu" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 transition-colors" />

                </div>

              </div>



              {/* Row 3: Hạn, Giá, Loại */}

              <div className="grid grid-cols-3 gap-4">

                <div className="col-span-1">

                  <label className="block text-sm font-semibold text-slate-700 mb-2">Hạn (Ngày)</label>

                  <input type="number" value={comboForm.durationDays} onChange={(e) => setComboForm({ ...comboForm, durationDays: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500" />

                </div>

                <div className="col-span-1">

                  <label className="block text-sm font-semibold text-slate-700 mb-2">Giá (VNĐ)</label>

                  <input type="number" value={comboForm.price} onChange={(e) => setComboForm({ ...comboForm, price: e.target.value })} placeholder="150000" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500" />

                </div>

                <div className="col-span-1">

                  <label className="block text-sm font-semibold text-slate-700 mb-2">Loại Combo</label>

                  <select value={comboForm.type} onChange={(e) => setComboForm({ ...comboForm, type: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 bg-white">

                    <option value="fixed">Cố định</option>

                    <option value="dynamic">Linh hoạt</option>

                  </select>

                </div>

              </div>



              {/* Row 4: Mô tả Bullet points */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1"><FileText size={14} /> Mô tả Combo (Hiển thị dạng danh sách)</label>

                <textarea

                  rows={3}

                  value={comboForm.featuresInput}

                  onChange={(e) => setComboForm({ ...comboForm, featuresInput: e.target.value })}

                  placeholder="Ôn thi tất cả các bộ đề...&#10;Bao gồm 2 khóa học lẻ chất lượng...&#10;Thi lại không giới hạn..."

                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 resize-none"

                />

                <p className="text-[11px] text-slate-500 mt-1">Nhấn Enter (Xuống dòng) để tạo gạch đầu dòng mới.</p>

              </div>



              {/* Row 5: Chọn Khóa học */}

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mt-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Chọn Khóa học gán vào ({comboForm.courses.length} đã chọn)</label>
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                  {courses
                    .filter(c => c.isPublished) // CHỈ LẤY CÁC KHÓA HỌC ĐÃ PUBLIC
                    .map(c => (
                      <label key={c._id} className="flex items-center gap-3 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-emerald-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={comboForm.courses.includes(c._id)}
                          onChange={(e) => handleCourseToggle(c._id, e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                        />
                        <span className="text-sm font-medium text-slate-700">{c.title}</span>
                      </label>
                    ))}
                </div>
              </div>



              <button

                onClick={handleSubmitCombo}

                disabled={isSubmitting}

                className={`w-full text-white font-bold py-3 rounded-xl transition-all shadow-md mt-4 disabled:bg-slate-400 ${editingComboId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}

              >

                {isSubmitting ? 'Đang lưu...' : (editingComboId ? 'Lưu thay đổi Combo' : 'Lưu cấu hình Combo')}

              </button>

            </div>

          </div>



          {/* CỘT PHẢI: DANH SÁCH COMBO REAL */}

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><PackageIcon size={20} className="text-indigo-500" /> Combo đang hoạt động</h3>

            <div className="space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar pr-2">

              {combos.length === 0 ? (

                <p className="text-sm text-slate-500 text-center py-4">Chưa có Combo nào được tạo.</p>

              ) : (

                combos.map(combo => (

                  <div key={combo._id} className={`border p-4 rounded-xl relative overflow-hidden group transition-colors ${editingComboId === combo._id ? 'border-amber-400 bg-amber-50/30' : 'border-slate-200 hover:border-indigo-300 bg-slate-50/50'}`}>



                    {/* Nút Edit nhanh góc phải */}

                    <button

                      onClick={() => handleEditCombo(combo)}

                      className="absolute top-4 right-4 text-slate-400 hover:text-amber-500 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-200 p-2 rounded-lg shadow-sm transition-all"

                      title="Chỉnh sửa Combo"

                    >

                      <FileEdit size={16} />

                    </button>



                    {/* Tags */}

                    <div className="flex flex-wrap gap-1 mb-2 pr-10">

                      {combo.tags && combo.tags.map((tag, i) => (

                        <span key={i} className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-700">{tag}</span>

                      ))}

                    </div>



                    <h4 className="font-bold text-slate-800 text-base pr-10">{combo.title}</h4>



                    <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">

                      <CheckCircle2 size={14} className="text-emerald-500" />

                      Gộp {combo.courses?.length || 0} khóa học (Hạn {combo.durationDays} ngày)

                    </div>



                    {/* Features Preview */}

                    {combo.features && combo.features.length > 0 && (

                      <ul className="mt-2 text-xs text-slate-600 space-y-1 list-disc pl-4 marker:text-blue-500">

                        {combo.features.slice(0, 2).map((feat, i) => (

                          <li key={i}>{feat}</li>

                        ))}

                        {combo.features.length > 2 && <li className="text-slate-400 list-none text-[10px]">...và {combo.features.length - 2} mục khác</li>}

                      </ul>

                    )}



                    <div className="mt-4 flex justify-between items-end">

                      <span className="text-[10px] text-slate-400 font-medium">Ưu tiên: {combo.priority || 0}</span>

                      <span className="font-mono font-bold text-lg text-blue-600">

                        {combo.price.toLocaleString('vi-VN')} ₫

                      </span>

                    </div>

                  </div>

                ))

              )}

            </div>

          </div>



        </div>

      )}

      {/* MODAL CẤU HÌNH BÁN HÀNG KHÓA LẺ (QUICK EDIT) */}
      {courseModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <ShoppingCart className="text-amber-500" size={20} />
                Cấu hình bán: <span className="text-blue-600 line-clamp-1">{courseModal.title}</span>
              </h3>
              <button onClick={() => setCourseModal({ isOpen: false })} className="text-slate-400 hover:text-red-500"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Giá (VNĐ)</label>
                  <input type="number" value={courseForm.price} onChange={e => setCourseForm({ ...courseForm, price: e.target.value })} className="w-full px-4 py-2 border rounded-xl text-sm focus:border-amber-500 outline-none" placeholder="VD: 590000" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Hạn sử dụng (Ngày)</label>
                  <input type="number" value={courseForm.durationDays} onChange={e => setCourseForm({ ...courseForm, durationDays: e.target.value })} className="w-full px-4 py-2 border rounded-xl text-sm focus:border-amber-500 outline-none" placeholder="9999 là vĩnh viễn" />
                  <p className="text-[10px] text-slate-400 mt-1">Ghi 9999 cho Vĩnh viễn</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nhãn (Tags)</label>
                  <input type="text" value={courseForm.tagsInput} onChange={e => setCourseForm({ ...courseForm, tagsInput: e.target.value })} className="w-full px-4 py-2 border rounded-xl text-sm focus:border-amber-500 outline-none" placeholder="Luyện thi, Mua lẻ" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Độ ưu tiên</label>
                  <input type="number" value={courseForm.priority} onChange={e => setCourseForm({ ...courseForm, priority: e.target.value })} className="w-full px-4 py-2 border rounded-xl text-sm focus:border-amber-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả hiển thị (Gạch đầu dòng)</label>
                <textarea rows={4} value={courseForm.featuresInput} onChange={e => setCourseForm({ ...courseForm, featuresInput: e.target.value })} className="w-full px-4 py-2 border rounded-xl text-sm focus:border-amber-500 outline-none resize-none" placeholder="Ôn thi tất cả bộ đề...&#10;Đề mới cập nhật hàng tuần...&#10;Thi lại không giới hạn..." />
              </div>

              <div className="pt-4 flex gap-3">
                <button onClick={() => setCourseModal({ isOpen: false })} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">Hủy</button>
                <button onClick={handleSaveCourseMarketing} disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-colors disabled:bg-slate-400">
                  {isSubmitting ? 'Đang lưu...' : 'Lưu cấu hình bán'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};