import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShoppingBag, BookOpen, Clock, CheckCircle } from 'lucide-react';

export const MyPurchases = () => {
  const [history, setHistory] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/payments/history`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setHistory(res.data);
      } catch (err) {
        toast.error("Không tải được lịch sử mua hàng");
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><ShoppingBag className="text-blue-600"/> Lịch sử mua hàng</h1>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-bold text-gray-600 text-sm">Combo/Khóa học</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Ngày mua</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Giá tiền</th>
              <th className="p-4 font-bold text-gray-600 text-sm">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {history.map((order) => (
              <tr key={order._id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-800">{order.package?.title || "Sản phẩm đã bị xóa"}</td>
                <td className="p-4 text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="p-4 text-blue-600 font-bold">{order.amount.toLocaleString('vi-VN')} ₫</td>
                <td className="p-4"><span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 w-max"><CheckCircle size={12}/> Thành công</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};