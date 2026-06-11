import React from 'react';

export const TeachersTab = ({ teachers, searchQuery, handleApproveTeacher, handleToggleStatus }) => {
  const filteredTeachers = teachers.filter(t => t.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || t.email?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fadeIn">
      <h2 className="text-lg font-bold text-slate-900 mb-6">Hồ sơ cấp quyền Giáo viên hệ thống</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase">
              <th className="py-3.5 px-4">Họ và Tên</th>
              <th className="py-3.5 px-4">Hộp thư Email</th>
              <th className="py-3.5 px-4">Trạng thái duyệt</th>
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
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${teacher.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {teacher.isApproved ? 'Đã cấp quyền dạy' : 'Chờ xét duyệt'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right space-x-2">
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
    </div>
  );
};