// Cập nhật TeachersTab.jsx
import React, { useState } from 'react';
import { Settings, X } from 'lucide-react'; // Thêm icon

// Danh sách tổng các môn hệ thống bạn hỗ trợ
const ALL_SUBJECTS = ['Tiếng Anh', 'Toán', 'Ngữ Văn', 'Vật Lý', 'Hóa Học', 'Sinh Học', 'Khác'];

export const TeachersTab = ({ teachers, searchQuery, handleApproveTeacher, handleToggleStatus, handleAssignSubjects }) => {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [tempSubjects, setTempSubjects] = useState([]);

  const filteredTeachers = teachers.filter(t => t.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || t.email?.toLowerCase().includes(searchQuery.toLowerCase()));

  const openSubjectModal = (teacher) => {
    setSelectedTeacher(teacher);
    setTempSubjects(teacher.allowedSubjects || []);
  };

  const toggleSubject = (subject) => {
    setTempSubjects(prev => 
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const submitSubjects = () => {
    // Gọi hàm truyền từ cha (Admin Component)
    handleAssignSubjects(selectedTeacher._id, tempSubjects);
    setSelectedTeacher(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fadeIn">
      <h2 className="text-lg font-bold text-slate-900 mb-6">Hồ sơ cấp quyền Giáo viên hệ thống</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase">
              <th className="py-3.5 px-4">Họ và Tên</th>
              <th className="py-3.5 px-4">Hộp thư Email</th>
              <th className="py-3.5 px-4">Bộ môn được phép</th>
              <th className="py-3.5 px-4 text-right">Hành động quyết định</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {filteredTeachers.map((teacher) => (
              <tr key={teacher._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-mono text-xs">{teacher.displayName?.charAt(0) || 'T'}</div>
                  {teacher.displayName}
                </td>
                <td className="py-3 px-4 font-mono text-xs">{teacher.email}</td>
                <td className="py-3 px-4">
                   {teacher.allowedSubjects?.length > 0 ? (
                     <div className="flex flex-wrap gap-1">
                       {teacher.allowedSubjects.map(sub => (
                         <span key={sub} className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-md font-bold">{sub}</span>
                       ))}
                     </div>
                   ) : (
                     <span className="text-xs text-gray-400 italic">Chưa phân môn</span>
                   )}
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  <button onClick={() => openSubjectModal(teacher)} className="text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition-all tooltip" title="Phân quyền bộ môn">
                    <Settings size={16} />
                  </button>
                  
                  {!teacher.isApproved && <button onClick={() => handleApproveTeacher(teacher._id, teacher.displayName)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all">Duyệt ngay</button>}
                  <button onClick={() => handleToggleStatus(teacher._id, teacher.isActive !== false)} className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-all">
                    {teacher.isActive !== false ? 'Khóa dạy' : 'Mở khóa'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL PHÂN QUYỀN */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Phân bộ môn cho: <span className="text-blue-600">{selectedTeacher.displayName}</span></h3>
              <button onClick={() => setSelectedTeacher(null)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><X size={20}/></button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {ALL_SUBJECTS.map(subject => (
                <label key={subject} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${tempSubjects.includes(subject) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="checkbox" checked={tempSubjects.includes(subject)} onChange={() => toggleSubject(subject)} className="w-4 h-4 accent-blue-600" />
                  <span className={`text-sm font-semibold ${tempSubjects.includes(subject) ? 'text-blue-700' : 'text-gray-600'}`}>{subject}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setSelectedTeacher(null)} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200">Hủy</button>
              <button onClick={submitSubjects} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700">Lưu quyền</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};