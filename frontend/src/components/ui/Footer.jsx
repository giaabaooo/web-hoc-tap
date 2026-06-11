import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MessageCircle, Building2 } from 'lucide-react'; 

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-12 mt-12 text-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* CHIA BỐ CỤC LỚN: TRÁI (THÔNG TIN THEO STYLE ILA) - PHẢI (MENU) */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 justify-between">

          {/* CỘT TRÁI: THEO PHONG CÁCH CỦA ILA (LOGO - TEXT - SOCIAL - CHỨNG NHẬN VỀ GÓC TRÁI) */}
          <div className="flex-1 lg:max-w-md flex flex-col items-start text-left">
            
            {/* Logo Thương Hiệu */}
            <div className="mb-4">
              <img 
                src="/logo.png" 
                alt="Tự Học Vui Logo" 
                className="h-16 w-auto object-contain" 
              />
            </div>

            {/* Đoạn mô tả ngắn gọn */}
            <p className="text-gray-600 text-[14px] leading-relaxed mb-5 max-w-sm">
              Nền tảng học tập trực tuyến giúp học sinh củng cố kiến thức, rèn luyện kỹ năng và tạo thói quen tự học hiệu quả mỗi ngày.
            </p>

            {/* Mạng xã hội: Sử dụng Font chữ hoặc hình ảnh hiển thị thẳng hàng dọc */}
            <div className="flex items-center gap-5 mb-6 text-gray-500">
              {/* Facebook Link */}
              <a 
                href="https://www.facebook.com/profile.php?id=61590283695697" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-[#1877F2] transition-colors"
                title="Facebook Tự Học Vui"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                </svg>
              </a>

              {/* TikTok Link */}
              <a 
                href="https://www.tiktok.com/@tuhocvui.6686?is_from_webapp=1&sender_device=pc" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-black transition-colors"
                title="TikTok Tự Học Vui"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.02 1.59 4.23.86 1.08 2.07 1.83 3.4 2.14v3.87c-1.42-.04-2.81-.49-3.99-1.3-.45-.31-.86-.67-1.22-1.07v6.26c.12 2.12-.67 4.24-2.15 5.76-1.57 1.63-3.87 2.45-6.13 2.19-2.52-.3-4.75-2.06-5.56-4.48-.99-2.94.33-6.27 3.07-7.61.94-.46 1.98-.67 3.02-.63v3.84c-.65-.11-1.33.02-1.9.36-.93.55-1.41 1.66-1.18 2.7.23 1.02 1.15 1.77 2.19 1.79 1.15-.02 2.11-.94 2.14-2.09V.02z"/>
                </svg>
              </a>

              {/* YouTube Link mặc định định hướng */}
              <a 
                href="#" 
                onClick={(e) => e.preventDefault()}
                className="hover:text-[#FF0000] transition-colors"
                title="YouTube Tự Học Vui"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>

            {/* Cụm chứng nhận chân trang (DMCA + Bộ Công Thương xếp hàng ngang) */}
            <div className="flex items-center gap-3 mt-1">
              {/* Nhãn hiệu DMCA */}
              <div className="border border-slate-100 rounded-md overflow-hidden bg-slate-50 h-8 flex items-center px-2">
                <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">DMCA</span>
                <span className="text-[9px] font-bold bg-[#464646] text-white px-1 py-0.5 rounded ml-1">PROTECTED</span>
              </div>
              
              {/* Nhãn hiệu Đã thông báo Bộ công thương */}
              <div className="h-8 flex items-center border border-slate-100 rounded-md bg-slate-50 px-2 gap-1">
                <div className="w-3 h-3 bg-cyan-500 rounded-full flex items-center justify-center text-white text-[7px] font-bold">✓</div>
                <span className="text-[9px] font-bold text-cyan-600 tracking-tight uppercase">Đã Thông Báo</span>
              </div>
            </div>

          </div>

          {/* CỘT GIỮA: THÔNG TIN PHÁP LÝ DOANH NGHIỆP */}
          <div className="flex-1 lg:max-w-md">
            <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-5 uppercase text-[14px] tracking-wide">
              <Building2 className="w-[18px] h-[18px] text-blue-500" strokeWidth={2.5} />
              Thông tin đơn vị
            </h4>
            <div className="border border-slate-100 rounded-2xl p-5 bg-[#fafbfc] shadow-sm">
              <h5 className="font-bold text-gray-900 text-[14px] uppercase mb-2 leading-snug">
                Công ty TNHH TM và DV Chìa Khóa Thành Công
              </h5>
              <p className="text-gray-500 text-[13px] mb-3 leading-relaxed">
                Giấy phép ĐKKD số: <strong className="text-gray-700">0110806385</strong>
                <br />
                Địa chỉ cơ sở: Định Công, Hoàng Mai, Hà Nội
              </p>
              <p className="text-gray-800 text-[13px] font-semibold">
                Hotline: <a href="tel:0896633556" className="text-blue-600 hover:underline">0896633556</a>
              </p>
            </div>
          </div>

          {/* CỘT PHẢI: CÁC DANH MỤC LIÊN KẾT NHANH */}
          <div className="lg:w-[35%] flex flex-row gap-10 pt-1">
            
            {/* Cột môn học */}
            <div className="flex-1">
              <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-5 uppercase text-[14px] tracking-wide">
                <BookOpen className="w-[18px] h-[18px] text-blue-500" strokeWidth={2.5} />
                Môn học
              </h4>
              <ul className="space-y-3.5">
                <li><Link to="/lessons?subject=Toán" className="text-[14px] text-gray-500 hover:text-blue-600 font-medium transition-colors">Toán học</Link></li>
                <li><Link to="/lessons?subject=Tiếng Việt" className="text-[14px] text-gray-500 hover:text-blue-600 font-medium transition-colors">Tiếng Việt</Link></li>
                <li><Link to="/lessons?subject=Tiếng Anh" className="text-[14px] text-gray-500 hover:text-blue-600 font-medium transition-colors">Tiếng Anh</Link></li>
                <li><Link to="/lessons?subject=Tiếng Trung" className="text-[14px] text-gray-500 hover:text-blue-600 font-medium transition-colors">Tiếng Trung</Link></li>
              </ul>
            </div>

            {/* Cột Hỗ trợ */}
            <div className="flex-1">
              <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-5 uppercase text-[14px] tracking-wide">
                <MessageCircle className="w-[18px] h-[18px] text-blue-500" strokeWidth={2.5} />
                Hỗ trợ
              </h4>
              <ul className="space-y-3.5">
                <li><Link to="#" className="text-[14px] text-gray-500 hover:text-blue-600 font-medium transition-colors">Trung tâm trợ giúp</Link></li>
                <li><Link to="#" className="text-[14px] text-gray-500 hover:text-blue-600 font-medium transition-colors">Liên hệ hỗ trợ</Link></li>
                <li><Link to="/faq" className="text-[14px] text-gray-500 hover:text-blue-600 font-medium transition-colors">Câu hỏi thường gặp</Link></li>
                <li><Link to="/news" className="text-[14px] text-gray-500 hover:text-blue-600 font-medium transition-colors">Hướng dẫn học</Link></li>
              </ul>
            </div>

          </div>
        </div>

        {/* BẢN QUYỀN VÀ PHÁP LÝ DƯỚI CÙNG */}
        <div className="mt-10 pt-5 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 font-medium">
          <p>© 2026 Tự Học Vui. Tất cả quyền được bảo lưu.</p>
          <div className="mt-3 md:mt-0 space-x-6">
            <Link to="#" className="hover:text-blue-600 transition-colors">Điều khoản dịch vụ</Link>
            <Link to="#" className="hover:text-blue-600 transition-colors">Chính sách bảo mật</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};