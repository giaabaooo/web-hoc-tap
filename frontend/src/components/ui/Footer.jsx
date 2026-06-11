import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MessageCircle, Building2 } from 'lucide-react'; 

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-10 mt-12 text-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* CHIA BỐ CỤC LỚN: TRÁI (THÔNG TIN) - PHẢI (MENU) */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 justify-between">

          {/* CỘT TRÁI: Logo, Mô tả và 2 Khối hộp (Cards) */}
          <div className="flex-1 lg:max-w-3xl">
            
            {/* Header: Logo Box + Tên Thương Hiệu */}
            <div className="flex items-center gap-4 mb-6">
              {/* Ô chứa logo bo góc như thiết kế */}
              <div className="p-2 border border-gray-200 rounded-2xl bg-white shadow-sm flex items-center justify-center w-20 h-20">
                <img 
                  src="/logo.png" 
                  alt="Tự Học Vui Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-[#0a192f] tracking-tight mb-1">
                  Tự Học Vui
                </h3>
                <p className="text-blue-600 font-medium text-[15px]">
                  Học tập trực tuyến cho học sinh
                </p>
              </div>
            </div>

            {/* Đoạn mô tả */}
            <p className="text-gray-600 text-[15px] leading-relaxed mb-8 max-w-2xl pr-4">
              Nền tảng học tập trực tuyến giúp học sinh củng cố kiến thức, rèn luyện kỹ năng và theo dõi tiến bộ qua từng bài học. Với hệ thống bài tập đa dạng, trẻ không chỉ học tốt hơn mà còn hình thành thói quen tự học hiệu quả mỗi ngày.
            </p>

            {/* Bố cục 2 khối hộp (Company Info & Bộ Công Thương) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Khối 1: Thông tin công ty (Đã cập nhật tên, địa chỉ, MST) */}
              <div className="border border-gray-100 rounded-2xl p-5 bg-[#fafbfc] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <Building2 className="w-[22px] h-[22px] text-blue-500 flex-shrink-0 mt-1" strokeWidth={2.5} />
                  <h4 className="font-bold text-gray-900 text-[15px] leading-snug uppercase">
                    Công ty TNHH TM và DV Chìa Khóa Thành Công
                  </h4>
                </div>
                <p className="text-gray-500 text-[14px] mb-3 leading-relaxed">
                  Giấy phép ĐKKD số: <strong>0110806385</strong>
                  <br />
                  Địa chỉ: Định Công, Hà Nội
                </p>
                <p className="text-gray-800 text-[14px] font-semibold">
                  Hotline: <a href="tel:0896633556" className="text-gray-900 hover:text-blue-600 transition-colors">0896633556</a>
                </p>
              </div>

              {/* Khối 2: Ảnh Bộ Công Thương (Đã thu nhỏ padding, cho ảnh to hết cỡ) */}
              <div className="border border-gray-100 rounded-2xl p-2 bg-[#fafbfc] shadow-sm flex items-center justify-center min-h-[150px] overflow-hidden">
                <a 
                  href="#" 
                  onClick={(e) => e.preventDefault()} 
                  className="inline-block w-full h-full flex items-center justify-center cursor-default"
                  title="Đã thông báo Bộ Công Thương"
                >
                  <img 
                    src="/bocongthuong.png" 
                    alt="Đã thông báo Bộ Công Thương" 
                    className="w-[85%] max-h-[120px] object-contain drop-shadow-sm hover:scale-105 transition-transform" 
                  />
                </a>
              </div>

            </div>
          </div>

          {/* CỘT PHẢI: Menu Liên Kết */}
          <div className="lg:w-[45%] flex flex-col sm:flex-row gap-12 sm:gap-20 pt-4">
            
            {/* Cột Menu 1: MÔN HỌC */}
            <div className="flex-1">
              <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-6 uppercase text-[15px] tracking-wide">
                <BookOpen className="w-[20px] h-[20px] text-blue-500" strokeWidth={2.5} />
                Môn học
              </h4>
              <ul className="space-y-4">
                <li><Link to="/lessons?subject=Toán" className="text-[15px] text-gray-500 hover:text-blue-600 font-medium transition-colors">Toán học</Link></li>
                <li><Link to="/lessons?subject=Tiếng Việt" className="text-[15px] text-gray-500 hover:text-blue-600 font-medium transition-colors">Tiếng Việt</Link></li>
                <li><Link to="/lessons?subject=Tiếng Anh" className="text-[15px] text-gray-500 hover:text-blue-600 font-medium transition-colors">Tiếng Anh</Link></li>
                <li><Link to="/lessons?subject=Tiếng Trung" className="text-[15px] text-gray-500 hover:text-blue-600 font-medium transition-colors">Tiếng Trung</Link></li>
              </ul>
            </div>

            {/* Cột Menu 2: HỖ TRỢ */}
            <div className="flex-1">
              <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-6 uppercase text-[15px] tracking-wide">
                <MessageCircle className="w-[20px] h-[20px] text-blue-500" strokeWidth={2.5} />
                Hỗ trợ
              </h4>
              <ul className="space-y-4">
                <li><Link to="#" className="text-[15px] text-gray-500 hover:text-blue-600 font-medium transition-colors">Trung tâm trợ giúp</Link></li>
                <li><Link to="#" className="text-[15px] text-gray-500 hover:text-blue-600 font-medium transition-colors">Liên hệ</Link></li>
                <li><Link to="/faq" className="text-[15px] text-gray-500 hover:text-blue-600 font-medium transition-colors">Câu hỏi thường gặp</Link></li>
                <li><Link to="/news" className="text-[15px] text-gray-500 hover:text-blue-600 font-medium transition-colors">Hướng dẫn</Link></li>
                <li><Link to="#" className="text-[15px] text-gray-500 hover:text-blue-600 font-medium transition-colors">Gửi phản hồi</Link></li>
              </ul>
            </div>

          </div>
        </div>

        {/* BẢN QUYỀN (Copyright) - Đã thu hẹp khoảng cách margin/padding */}
        <div className="mt-8 pt-5 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400 font-medium">
          <p>© 2026 Tự Học Vui. Tất cả quyền được bảo lưu.</p>
          <div className="mt-3 md:mt-0 space-x-6">
            <Link to="#" className="hover:text-blue-600 transition-colors">Điều khoản</Link>
            <Link to="#" className="hover:text-blue-600 transition-colors">Bảo mật</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};