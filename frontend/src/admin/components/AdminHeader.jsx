import React from 'react';
import { Search, Calendar } from 'lucide-react';

export const AdminHeader = ({ searchQuery, setSearchQuery, startDate, setStartDate, endDate, setEndDate }) => {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
      <div className="relative w-96">
        <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400"><Search size={16} /></span>
        <input 
          type="text" 
          placeholder="Tìm kiếm nhanh..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          className="w-full bg-slate-50 text-slate-800 pl-11 pr-4 py-2.5 rounded-xl text-sm border border-slate-200 outline-none focus:bg-white focus:border-blue-500 transition-all" 
        />
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
          <Calendar size={14} className="text-blue-500" />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent outline-none cursor-pointer" />
          <span>đến</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent outline-none cursor-pointer" />
        </div>
        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">Admin Tự Học Vui</p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">Quản trị viên tối cao</p>
          </div>
          <img src="https://api.dicebear.com/7.x/initials/svg?seed=Admin&backgroundColor=3b82f6" alt="Avatar" className="w-10 h-10 rounded-xl bg-slate-100 object-cover" />
        </div>
      </div>
    </header>
  );
};