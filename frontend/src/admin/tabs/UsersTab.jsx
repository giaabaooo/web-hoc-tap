import React, { useState } from 'react';
import { Edit2, ShieldAlert, ShieldCheck, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';

export const UsersTab = ({ users, searchQuery, handleToggleStatus }) => {
  const [editingUser, setEditingUser] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState('');

  const filteredUsers = users.filter(u => u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSavePackage = (userId) => {
    // Tạm thời chưa có API
    toast.success(`Đã cập nhật khóa/gói thành công cho học viên! (Tính năng Demo)`);
    setEditingUser(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fadeIn">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Danh sách quản lý Học sinh</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase">
              <th className="py-3.5 px-4">Học sinh</th>
              <th className="py-3.5 px-4">Email liên kết</th>
              <th className="py-3.5 px-4">Trạng thái</th>
              <th className="py-3.5 px-4">Gói / Combo</th>
              <th className="py-3.5 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {filteredUsers.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-6 text-slate-400">Không tìm thấy dữ liệu học viên.</td></tr>
            ) : (
              filteredUsers.map((user) => (
                <React.Fragment key={user._id}>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-mono text-xs">{user.displayName?.charAt(0) || 'U'}</div>
                      {user.displayName}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{user.email}</td>
                    <td className="py-3 px-4"><span className={`text-xs font-bold ${user.isActive !== false ? 'text-emerald-600' : 'text-rose-600'}`}>{user.isActive !== false ? 'Đang hoạt động' : 'Đã khóa'}</span></td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded bg-indigo-50 text-indigo-600 uppercase">
                        {user.subscription || 'FREE'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditingUser(user._id); setSelectedPackage(user.subscription || 'PRO'); }} className="text-xs font-semibold px-3 py-1.5 rounded-lg border text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100 flex items-center gap-1.5 transition-all">
                          <Edit2 size={14} /> Cấp Gói
                        </button>
                        <button onClick={() => handleToggleStatus(user._id, user.isActive !== false)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${user.isActive !== false ? 'text-rose-600 bg-rose-50 border-rose-100 hover:bg-rose-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100'}`}>
                          {user.isActive !== false ? <><ShieldAlert size={14}/> Khóa</> : <><ShieldCheck size={14}/> Mở khóa</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Dòng tùy chọn Gói/Combo hiển thị khi Admin bấm nút Cấp Gói */}
                  {editingUser === user._id && (
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <td colSpan="5" className="py-4 px-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-3">
                          <span className="text-sm font-medium text-slate-600">
                            Cập nhật gói / khóa học cho <strong className="text-blue-600">{user.displayName}</strong>:
                          </span>
                          <select 
                            value={selectedPackage} 
                            onChange={(e) => setSelectedPackage(e.target.value)} 
                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 font-medium text-slate-700 bg-white min-w-[280px]"
                          >
                            <option value="" disabled>-- Chọn Gói / Combo có phí --</option>
                            <option value="PRO">Gói PRO (Mở khóa toàn bộ)</option>
                            <option value="PREMIUM">Gói PREMIUM (Học 1-1)</option>
                            <option value="COMBO_3">Combo 3: Starters + Movers + Flyers</option>
                            <option value="COMBO_2">Combo 2: Mua 2 khóa tiếng Anh bất kỳ</option>
                            <option value="FREE">Hủy quyền truy cập (Trở về FREE)</option>
                          </select>
                          <div className="flex gap-2">
                            <button onClick={() => handleSavePackage(user._id)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 transition-colors shadow-sm">
                              <Check size={14}/> Xác nhận
                            </button>
                            <button onClick={() => setEditingUser(null)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-slate-300 transition-colors">
                              <X size={14}/> Hủy
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};