import React from 'react';
import { Star, Image as ImageIcon } from 'lucide-react';

export const FeedbacksTab = ({ feedbacks, handleUpdateFeedbackStatus }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fadeIn">
      <h2 className="text-lg font-bold text-slate-900 mb-6">Hộp thư góp ý & Báo lỗi bài học thực tế</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase">
              <th className="py-3.5 px-4">Học viên/Email</th>
              <th className="py-3.5 px-4">Chủ đề phân loại</th>
              <th className="py-3.5 px-4">Nội dung phản hồi chi tiết</th>
              <th className="py-3.5 px-4">Đánh giá</th>
              <th className="py-3.5 px-4">Hình minh họa</th>
              <th className="py-3.5 px-4">Tình trạng</th>
              <th className="py-3.5 px-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {feedbacks.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-8 text-slate-400">Hộp thư trống! Chưa nhận được phản hồi nào từ học viên.</td></tr>
            ) : (
              feedbacks.map((f) => (
                <tr key={f._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-xs">{f.email || (f.userId && f.userId.email) || 'Khách vãng lai'}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium border ${f.topic === 'Báo lỗi hệ thống' ? 'bg-red-50 text-rose-600 border-rose-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                      {f.topic}
                    </span>
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate" title={f.message}>{f.message}</td>
                  <td className="py-3 px-4 text-amber-400">
                    <div className="flex items-center gap-0.5">{[...Array(f.rating || 5)].map((_, i) => <Star key={i} size={13} fill="currentColor" />)}</div>
                  </td>
                  <td className="py-3 px-4">
                    {f.image ? <a href={f.image} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs flex items-center gap-1"><ImageIcon size={14} /> Xem ảnh lỗi</a> : <span className="text-slate-300 text-xs">Không đính kèm</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${f.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {f.status === 'resolved' ? 'Đã giải quyết' : 'Mới tiếp nhận'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {f.status !== 'resolved' && <button onClick={() => handleUpdateFeedbackStatus(f._id)} className="text-xs text-blue-600 font-bold hover:underline">Đánh dấu xử lý xong</button>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};