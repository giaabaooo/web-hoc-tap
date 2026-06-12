// src/pages/Pricing.jsx
import React, { useState, useEffect } from 'react';
import { Search, Link as LinkIcon, X, ShoppingCart, CreditCard, Trash2, Tag, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export const Pricing = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [allItems, setAllItems] = useState([]);
  const [ownedIds, setOwnedIds] = useState([]); // THÊM STATE ĐỂ KIỂM TRA ĐỒ ĐÃ MUA
  const [filter, setFilter] = useState('all'); 
  const [cartItems, setCartItems] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resPackages, resCourses] = await Promise.all([
          axios.get(`${API_URL}/api/payments/packages`),
          axios.get(`${API_URL}/api/courses`)
        ]);

        const pricedCourses = resCourses.data
          .filter(c => c.price > 0 && c.isPublished)
          .map(c => ({ ...c, itemType: 'course' })); 

        const combos = resPackages.data.map(p => ({ ...p, itemType: 'package' }));
        const mergedItems = [...combos, ...pricedCourses];
        
        setAllItems(mergedItems);

        // KÉO DANH SÁCH NHỮNG MÓN ĐÃ MUA TỪ LỊCH SỬ
        const token = localStorage.getItem('token');
        if (token && token !== 'null') {
          try {
            const historyRes = await axios.get(`${API_URL}/api/payments/history`, { headers: { Authorization: `Bearer ${token}` } });
            // Gom tất cả các ID sản phẩm đã mua vào 1 mảng
            const boughtIds = historyRes.data.reduce((acc, order) => acc.concat(order.items || []), []);
            setOwnedIds(boughtIds);
          } catch(e) {}
        }

        // TỰ ĐỘNG THÊM VÀO GIỎ TỪ NÚT "MUA NGAY" BÊN COURSE DETAIL
        if (location.state?.autoAddCourseId) {
           const courseToAdd = mergedItems.find(i => i._id === location.state.autoAddCourseId);
           if (courseToAdd) {
             setCartItems([courseToAdd]);
             window.history.replaceState({}, document.title);
           }
        }
      } catch (err) { toast.error("Không thể tải danh sách khóa học."); }
    };
    fetchData();
  }, [API_URL, location.state]);

  const displayedItems = allItems.filter(item => {
    if (filter === 'combo') return item.itemType === 'package';
    if (filter === 'single') return item.itemType === 'course';
    return true; 
  });

  const handleToggleCart = (item) => {
    const isExist = cartItems.find(i => i._id === item._id);
    if (isExist) setCartItems(cartItems.filter(i => i._id !== item._id));
    else setCartItems([...cartItems, item]);
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

  const handleCreatePayment = async () => {
    if (cartItems.length === 0) return toast.warning("Giỏ hàng của bạn đang trống!");

    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined') {
      toast.info("Vui lòng đăng nhập tài khoản để thanh toán!");
      return navigate('/auth');
    }

    try {
      setIsProcessing(true);
      const payload = { itemIds: cartItems.map(item => item._id) };
      const res = await axios.post(`${API_URL}/api/payments/create`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      setPaymentData(res.data);
      setShowQRModal(true);
      setIsProcessing(false);
      checkPaymentStatus(res.data.orderCode, token);
    } catch (error) {
      setIsProcessing(false);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo mã thanh toán.');
    }
  };

  const checkPaymentStatus = (orderCode, token) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_URL}/api/payments/status/${orderCode}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Nhờ FALLBACK bên Backend, trạng thái này sẽ nhảy ngay khi quét QR xong!
        if (res.data.status === 'PAID') {
          clearInterval(interval);
          setShowQRModal(false);
          // Thêm các món vừa mua vào danh sách đã sở hữu để UI khóa lại
          setOwnedIds(prev => [...prev, ...cartItems.map(i => i._id)]); 
          setCartItems([]); // Tự động xóa giỏ hàng
          toast.success('Thanh toán thành công! Hệ thống đã mở khóa nội dung.');
        }
      } catch (err) {}
    }, 3000);
    window.paymentInterval = interval;
  };

  const closeModal = () => {
    setShowQRModal(false);
    if (window.paymentInterval) clearInterval(window.paymentInterval);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20 relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* THANH TOP BAR: TỔNG SẢN PHẨM & TỔNG TIỀN */}
        {cartItems.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 shadow-md flex flex-col sm:flex-row justify-between items-center text-white sticky top-20 z-20 transition-all animate-fadeIn">
             <div className="flex items-center gap-3 mb-2 sm:mb-0">
                <ShoppingCart size={24} />
                <span className="font-bold text-lg tracking-wide">Đang chọn: <span className="text-yellow-300">{cartItems.length}</span> Chương trình</span>
             </div>
             <div className="flex items-center gap-4">
                <span className="text-sm font-medium opacity-80 uppercase tracking-widest">Tổng Thanh Toán</span>
                <span className="text-2xl font-black">{totalPrice.toLocaleString('vi-VN')} ₫</span>
             </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-8 mb-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100"><Tag size={32} /></div>
          <div>
            <div className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-2">⭐ Chọn gói học phù hợp</div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Mua chương trình học</h1>
            <p className="text-slate-500 mt-2 font-medium">Tìm gói học, thêm nhiều món vào giỏ và thanh toán bằng mã QR 1 lần duy nhất.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start mt-6">
          <div className="flex-1 w-full space-y-6">
            
            <div className="flex justify-center">
              <div className="bg-white border border-slate-200 p-1.5 rounded-full flex gap-1 shadow-sm">
                <button onClick={() => setFilter('all')} className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${filter === 'all' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Tất cả</button>
                <button onClick={() => setFilter('single')} className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${filter === 'single' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Mua Lẻ</button>
                <button onClick={() => setFilter('combo')} className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${filter === 'combo' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Combo</button>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 mb-4 px-2">Chương trình có sẵn</h2>
              
              {displayedItems.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm"><p className="text-slate-500">Chưa có chương trình nào.</p></div>
              ) : (
                displayedItems.map(item => {
                  const isInCart = cartItems.find(i => i._id === item._id);
                  const isOwned = ownedIds.includes(item._id); // KIỂM TRA ĐÃ MUA

                  return (
                  <div key={item._id} className={`bg-white border shadow-sm rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all hover:shadow-md ${isInCart ? 'border-blue-400 ring-2 ring-blue-50' : 'border-slate-100 hover:border-blue-300'}`}>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-purple-50 text-purple-600 text-xs font-bold px-3 py-1 rounded-full border border-purple-100">🎓 Luyện thi</span>
                        <span className="bg-amber-50 text-amber-600 text-xs font-bold px-3 py-1 rounded-full border border-amber-100">⭐ {item.itemType === 'package' ? 'Combo' : 'Khóa lẻ'}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 leading-tight">{item.title}</h3>
                      <p className="text-xs text-slate-400 font-medium mt-4">Thời hạn: {item.durationDays ? `${item.durationDays} ngày` : 'Vĩnh viễn'}</p>
                    </div>

                    <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-4 shrink-0">
                      <div className="font-extrabold text-blue-600 text-2xl tracking-tight">{item.price.toLocaleString('vi-VN')} ₫</div>
                      
                      {/* LOGIC NÚT ĐÃ SỞ HỮU HOẶC THÊM VÀO GIỎ */}
                      {isOwned ? (
                        <button disabled className="w-full md:w-auto text-green-700 bg-green-50 text-sm font-bold px-6 py-2.5 rounded-full flex items-center justify-center gap-2 shadow-sm border border-green-200 cursor-not-allowed">
                          <CheckCircle2 size={16}/> Đã sở hữu
                        </button>
                      ) : (
                        <button onClick={() => handleToggleCart(item)} className={`w-full md:w-auto text-white text-sm font-bold px-6 py-2.5 rounded-full flex items-center justify-center gap-2 transition-all shadow-sm ${isInCart ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                          {isInCart ? <><Trash2 size={16}/> Bỏ khỏi giỏ</> : <><ShoppingCart size={16}/> Thêm vào giỏ</>}
                        </button>
                      )}

                    </div>
                  </div>
                )})
              )}
            </div>
          </div>

          <div className="w-full lg:w-[380px] shrink-0 sticky top-44">
            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="bg-amber-50/50 p-6 pb-4 border-b border-amber-100">
                <div className="flex items-center gap-2 mb-1">
                   <div className="bg-amber-100 text-amber-700 p-1.5 rounded-lg"><ShoppingCart size={18} /></div>
                   <h2 className="text-lg font-bold text-slate-800">Giỏ hàng</h2>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-bold text-slate-600">Sản phẩm đã chọn:</p>
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{cartItems.length} Món</span>
                </div>
                
                {cartItems.length > 0 ? (
                  <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="bg-blue-50/40 border border-blue-100 rounded-xl p-3 relative group">
                        <button onClick={() => handleToggleCart(item)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 bg-white rounded-md p-1 shadow-sm transition-colors"><X size={14} /></button>
                        <div className="flex gap-2 mb-1.5"><span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded">{item.itemType === 'package' ? 'COMBO' : 'LẺ'}</span></div>
                        <h4 className="font-bold text-slate-700 text-sm leading-snug pr-8 line-clamp-1">{item.title}</h4>
                        <p className="font-bold text-blue-600 mt-1">{item.price.toLocaleString('vi-VN')} ₫</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center mb-6">
                    <ShoppingCart size={24} className="text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400 font-medium">Chưa có sản phẩm</p>
                    <p className="text-xs text-slate-400 mt-1">Chọn một chương trình bên trái.</p>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-4 mb-6">
                  <p className="font-bold text-slate-800 mb-3 text-lg">Tổng hóa đơn:</p>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600 font-medium text-sm"><CreditCard size={18} /><span>Thanh toán bằng QR</span></div>
                    <span className="font-extrabold text-blue-600 text-xl">{totalPrice.toLocaleString('vi-VN')} ₫</span>
                  </div>
                </div>

                <button onClick={handleCreatePayment} disabled={isProcessing || cartItems.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed">
                  {isProcessing ? 'Đang xử lý...' : <><CreditCard size={18} /> Tiến hành thanh toán</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showQRModal && paymentData && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row">
            <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full p-2 transition-colors z-10"><X size={20} /></button>
            <div className="p-8 bg-blue-50/50 border-r border-slate-100 flex-1 flex flex-col items-center justify-center">
              <h3 className="font-bold text-slate-800 mb-4 text-center">Quét mã QR để thanh toán</h3>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(paymentData.qrCode)}`} alt="Mã QR" className="w-64 h-64 object-contain" /></div>
              <p className="text-sm text-slate-500 mt-4 text-center">Hệ thống tự động xác nhận sau 1-3 phút.</p>
              <a href={paymentData.checkoutUrl} target="_blank" rel="noopener noreferrer" className="mt-3 text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline text-center">Chuyển đến cổng thanh toán PayOS</a>
            </div>
            <div className="p-8 flex-1 flex flex-col justify-center space-y-4">
              <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Số Món Đã Đặt</p><p className="font-bold text-slate-800">{cartItems.length} Sản phẩm</p></div>
              <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng Số tiền</p><p className="font-bold text-blue-600 text-xl">{totalPrice.toLocaleString('vi-VN')} ₫</p></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nội dung chuyển khoản</p>
                <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-200">
                  <span className="font-mono font-bold text-slate-700">{paymentData.orderCode}</span>
                  <button onClick={() => { navigator.clipboard.writeText(paymentData.orderCode); toast.success('Đã sao chép nội dung!'); }} className="text-sm font-bold text-blue-600 hover:text-blue-800">Sao chép</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};