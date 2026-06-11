// src/pages/Pricing.jsx
import React, { useState } from 'react';
import { Search, Link as LinkIcon, X, ShoppingCart } from 'lucide-react';

export const Pricing = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl p-8 mb-6 shadow-sm border border-slate-100 flex items-start gap-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100">
            <ShoppingCart size={32} />
          </div>
          <div>
            <div className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-2 flex items-center gap-1.5 w-max">
              ⭐ Chọn gói học phù hợp
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mua chương trình học</h1>
            <p className="text-slate-500 mt-2 font-medium">Tìm gói học, thêm vào giỏ và thanh toán bằng mã QR ngân hàng.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* CỘT TRÁI: FILTER & DANH SÁCH */}
          <div className="flex-1 space-y-6 w-full">
            
            {/* BỘ LỌC */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2"><span className="text-blue-500">▽</span> Bộ lọc</h3>
                  <p className="text-sm text-slate-500 mt-1">Thu hẹp danh sách theo tên, loại và môn học.</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                    <LinkIcon size={14} /> Chia sẻ
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                    Xóa bộ lọc
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tìm kiếm theo tiêu đề</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Nhập tên chương trình" className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 transition-all bg-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Loại chương trình</label>
                  <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 bg-white cursor-pointer appearance-none">
                    <option>Tất cả loại</option>
                    <option>Combo gộp</option>
                    <option>Sách lẻ</option>
                    <option>Khóa học lẻ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Môn học</label>
                  <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 bg-white cursor-pointer appearance-none">
                    <option>Tất cả môn học</option>
                    <option>Tiếng Anh</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100 text-sm text-slate-500 font-medium">
                Hiển thị 381 trong tổng số 381 chương trình
              </div>
            </div>

            {/* DANH SÁCH GÓI (PLACEHOLDER) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
               <div className="flex justify-between items-center mb-6">
                 <div>
                   <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">📖 Danh sách gói</span>
                   <h2 className="text-xl font-bold text-slate-900">Chương trình có sẵn</h2>
                 </div>
                 <span className="text-sm font-bold text-slate-400">381 chương trình</span>
               </div>

               {/* Mock Card */}
               <div className="border border-slate-200 rounded-2xl p-4 flex gap-4 items-center hover:border-blue-300 transition-all cursor-pointer">
                  <div className="w-32 h-24 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400">IMG</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-slate-800">Combo 3: Starters + Movers + Flyers</h3>
                    <p className="text-sm text-slate-500 line-clamp-1">Trọn bộ chứng chỉ Cambridge cho trẻ em.</p>
                    <div className="mt-2 font-bold text-blue-600">1.300.000 ₫</div>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md">
                    Thêm vào giỏ
                  </button>
               </div>
            </div>

          </div>

          {/* CỘT PHẢI: GIỎ HÀNG (STICKY) */}
          <div className="w-full lg:w-[380px] shrink-0 sticky top-24">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-3">🛒 Thanh toán</div>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Giỏ hàng</h2>
              
              <div className="font-bold text-slate-800 mb-4">Sản phẩm đã chọn (0):</div>
              
              <div className="bg-blue-50/50 border border-dashed border-blue-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <ShoppingCart size={40} className="text-blue-300 mb-3" />
                <h3 className="font-bold text-slate-700">Chưa có sản phẩm nào</h3>
                <p className="text-sm text-slate-500 mt-1">Chọn một chương trình bên trái để bắt đầu.</p>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                 <div className="flex justify-between text-slate-600 text-sm font-medium">
                   <span>Tạm tính:</span>
                   <span>0 ₫</span>
                 </div>
                 <div className="flex justify-between text-slate-600 text-sm font-medium">
                   <span>Chiết khấu Combo:</span>
                   <span className="text-emerald-500">- 0 ₫</span>
                 </div>
                 <div className="flex justify-between text-lg font-bold text-slate-900 pt-2">
                   <span>Tổng tiền:</span>
                   <span className="text-blue-600">0 ₫</span>
                 </div>
              </div>

              <button className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md opacity-50 cursor-not-allowed">
                Tiến hành thanh toán
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};