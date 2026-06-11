import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Users, UserCheck, Clock, TrendingUp, BarChart3 } from 'lucide-react';

export const OverviewTab = ({ stats, chartData }) => {
  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan hệ thống học tập</h1>
        <p className="text-sm text-slate-500 mt-1">Theo dõi số liệu tăng trưởng lớp học, doanh thu và xét duyệt tài khoản vĩ mô.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng số Học sinh</p><h3 className="text-3xl font-bold text-slate-900 mt-1 font-mono">{stats.totalUsers}</h3></div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Users size={22} /></div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Giáo viên đã duyệt</p><h3 className="text-3xl font-bold text-emerald-600 mt-1 font-mono">{stats.approvedTeachers}</h3></div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><UserCheck size={22} /></div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm relative">
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Giáo viên chờ duyệt</p><h3 className="text-3xl font-bold text-amber-500 mt-1 font-mono">{stats.pendingTeachers}</h3></div>
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500"><Clock size={22} /></div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doanh thu tháng này</p><h3 className="text-2xl font-bold text-indigo-600 mt-1.5 font-mono">{formatCurrency(stats.totalRevenue)}</h3></div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><TrendingUp size={22} /></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2"><BarChart3 size={18} className="text-blue-600" /> Biểu đồ doanh thu thực tế</h3>
        </div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs><linearGradient id="colorRevenueWeb" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/><stop offset="95%" stopColor="#3B82F6" stopOpacity={0.01}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} tickFormatter={(val) => `${val/1000000}M`} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0' }} formatter={(value) => [formatCurrency(value), "Doanh thu"]} />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueWeb)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};