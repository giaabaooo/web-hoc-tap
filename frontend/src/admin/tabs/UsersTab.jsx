import React, { useState, useEffect } from 'react';
import { Edit2, ShieldAlert, ShieldCheck, Check, X, Shield, PlusCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore'; 

export const UsersTab = ({ users, searchQuery, handleToggleStatus }) => {
  const [editingUser, setEditingUser] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState('');
  
  const [availableItems, setAvailableItems] = useState([]); // Toàn bộ khóa/gói
  const [ownedIds, setOwnedIds] = useState([]); // ID các món user đang sở hữu
  const [isLoadingAccess, setIsLoadingAccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { token } = useAuthStore();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const filteredUsers = users.filter(u => u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()));

  // Lấy toàn bộ khóa/gói khi load trang
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const [resPackages, resCourses] = await Promise.all([
          axios.get(`${API_URL}/api/admin/packages`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/courses`)
        ]);
        const combos = resPackages.data.map(p => ({ ...p, itemType: 'combo' }));
        const courses = resCourses.data.filter(c => c.price > 0 && c.isPublished).map(c => ({ ...c, itemType: 'course' }));
        setAvailableItems([...combos, ...courses]);
      } catch (error) { console.error("Lỗi lấy danh sách", error); }
    };
    fetchItems();
  }, [API_URL, token]);

  // Lấy quyền hiện tại của User khi bấm Edit
  const fetchUserAccess = async (userId) => {
    setIsLoadingAccess(true);
    try {
      const res = await axios.get(`${API_URL}/api/admin/users/${userId}/access`, { headers: { Authorization: `Bearer ${token}` } });
      setOwnedIds(res.data.ownedIds);
    } catch (err) { toast.error("Lỗi tải thông tin sở hữu"); }
    finally { setIsLoadingAccess(false); }
  };

  const handleEditClick = (userId) => {
    setEditingUser(editingUser === userId ? null : userId);
    setSelectedPackage('');
    if (editingUser !== userId) fetchUserAccess(userId);
  };

  // Cấp mới quyền
  const handleGrantAccess = async (userId) => {
    if (!selectedPackage) return toast.warning("Vui lòng chọn 1 Combo hoặc Khóa học!");
    setIsProcessing(true);
    try {
      await axios.put(`${API_URL}/api/admin/users/${userId}/grant-access`, { itemId: selectedPackage }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Đã cấp quyền thành công!`);
      setSelectedPackage('');
      fetchUserAccess(userId); // Tải lại thẻ xanh
    } catch (error) { toast.error(error.response?.data?.message || "Lỗi cấp quyền!"); }
    finally { setIsProcessing(false); }
  };

  // Thu hồi quyền
  const handleRevokeAccess = async (userId, itemId, itemName) => {
    if (!window.confirm(`Bạn có chắc muốn THU HỒI khóa học/gói "${itemName}" của học viên này không?`)) return;
    setIsProcessing(true);
    try {
      await axios.put(`${API_URL}/api/admin/users/${userId}/revoke-access`, { itemId }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Đã thu hồi thành công!`);
      fetchUserAccess(userId); // Tải lại thẻ xanh
    } catch (error) { toast.error(error.response?.data?.message || "Lỗi thu hồi quyền!"); }
    finally { setIsProcessing(false); }
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
              <th className="py-3.5 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {filteredUsers.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-6 text-slate-400">Không tìm thấy dữ liệu học viên.</td></tr>
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
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditClick(user._id)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${editingUser === user._id ? 'bg-blue-600 text-white border-blue-600' : 'text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100'}`}>
                          <Shield size={14} /> Quản lý Quyền
                        </button>
                        <button onClick={() => handleToggleStatus(user._id, user.isActive !== false)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${user.isActive !== false ? 'text-rose-600 bg-rose-50 border-rose-100 hover:bg-rose-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100'}`}>
                          {user.isActive !== false ? <><ShieldAlert size={14}/> Khóa</> : <><ShieldCheck size={14}/> Mở khóa</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* PANEL QUẢN LÝ QUYỀN SỞ HỮU MỞ RỘNG */}
                  {editingUser === user._id && (
                    <tr className="bg-slate-50 border-b border-slate-200 shadow-inner">
                      <td colSpan="4" className="p-6">
                        <div className="bg-white border border-slate-200 rounded-xl p-5 w-full">
                          
                          {/* 1. Khu vực hiển thị đồ ĐÃ SỞ HỮU */}
                          <div className="mb-6">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                              Sản phẩm đang sở hữu
                              {isLoadingAccess && <Loader2 size={14} className="animate-spin text-blue-500" />}
                            </h4>
                            
                            {!isLoadingAccess && (
                              <div className="flex flex-wrap gap-2">
                                {ownedIds.length === 0 ? (
                                  <span className="text-sm text-slate-400 font-medium italic">Học viên chưa sở hữu khóa học nào.</span>
                                ) : (
                                  availableItems.filter(i => ownedIds.includes(i._id)).map(item => (
                                    <div key={item._id} className="bg-emerald-50 border border-emerald-200 text-emerald-700 pl-3 pr-1.5 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold shadow-sm">
                                      <span>{item.itemType === 'combo' ? '📦' : '📘'} {item.title}</span>
                                      <button 
                                        onClick={() => handleRevokeAccess(user._id, item._id, item.title)} 
                                        disabled={isProcessing}
                                        className="hover:bg-rose-500 hover:text-white text-emerald-600/50 p-1 rounded-md transition-colors"
                                        title="Thu hồi quyền"
                                      >
                                        <X size={14}/>
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>

                          {/* 2. Khu vực CẤP MỚI */}
                          <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <span className="text-sm font-bold text-slate-700 whitespace-nowrap">Cấp thêm quyền:</span>
                            
                            <select 
                              value={selectedPackage} 
                              onChange={(e) => setSelectedPackage(e.target.value)} 
                              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 font-medium text-slate-700 bg-slate-50 min-w-[280px]"
                            >
                              <option value="" disabled>-- Chọn Combo / Khóa học --</option>
                              <optgroup label="📦 Các gói Combo">
                                {availableItems.filter(i => i.itemType === 'combo' && !ownedIds.includes(i._id)).map(combo => (
                                  <option key={combo._id} value={combo._id}>[Combo] {combo.title}</option>
                                ))}
                              </optgroup>
                              <optgroup label="📘 Khóa học mua lẻ">
                                {availableItems.filter(i => i.itemType === 'course' && !ownedIds.includes(i._id)).map(course => (
                                  <option key={course._id} value={course._id}>[Khóa lẻ] {course.title}</option>
                                ))}
                              </optgroup>
                            </select>

                            <button 
                              onClick={() => handleGrantAccess(user._id)} 
                              disabled={isProcessing || !selectedPackage}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                            >
                              <PlusCircle size={16}/> Xác nhận cấp
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