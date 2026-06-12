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

            {/* Mạng xã hội: Đã sửa Zalo chuẩn, không còn bị lỗi méo chữ */}
            <div className="flex items-center gap-4 mb-6">
              
              {/* 1. Facebook Link */}
              <a 
                href="https://www.facebook.com/profile.php?id=61590283695697" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:opacity-80 transition-transform transform hover:scale-105 duration-200"
                title="Facebook Tự Học Vui"
              >
                <svg className="w-10 h-10 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="12" fill="#1877F2"/>
                  <path d="M14.9995 12H12.9995V19.9995H9.99953V12H8.49953V9.49951H9.99953V7.99951C9.99953 6.34251 10.9995 4.99951 12.9995 4.99951H14.9995V7.49951H13.4995C12.9465 7.49951 12.9995 7.89251 12.9995 8.49951V9.49951H14.9995L14.9995 12Z" fill="white"/>
                </svg>
              </a>

              {/* 2. Zalo Link (SĐT: 0399336986) - FIXED PATHS */}
              <a 
                href="https://zalo.me/0399336986" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:opacity-80 transition-transform transform hover:scale-105 duration-200"
                title="Zalo: 039 9336986"
              >
                <svg width="40" height="40" className="w-10 h-10 flex-shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Khung viền bong bóng */}
                  <path d="M 50 8 C 26.8 8 8 25.1 8 46.2 C 8 57.8 13.9 68.2 23.3 75.1 C 22 79.9 18.5 83.8 18.2 84.1 C 17.7 84.7 17.8 85.5 18.5 85.8 C 18.9 86 19.3 86 19.7 86 C 23.6 86 28.7 84.6 32.7 82.7 C 38 85 43.9 86.1 50 86.1 C 73.2 86.1 92 69 92 47.9 C 92 26.8 73.2 8 50 8 Z" fill="white" stroke="#0068FF" strokeWidth="4" />
                  {/* Chữ Z */}
                  <path d="M 36.1 53.6 L 41.5 53.6 L 41.5 56.5 L 33.3 56.5 L 33.3 52.7 L 38.2 45.2 L 33.3 45.2 L 33.3 42.3 L 41.2 42.3 L 41.2 46.1 L 36.1 53.6 Z" fill="#0068FF" />
                  {/* Chữ a */}
                  <path d="M 47 50.3 C 47 49.3 46.2 48.5 44.9 48.5 C 43.6 48.5 42.7 49.3 42.7 50.3 L 42.7 56.5 L 39.9 56.5 L 39.9 45.9 C 39.9 44 41.2 42.3 44.9 42.3 C 48.6 42.3 49.9 44 49.9 45.9 L 49.9 56.5 L 47 56.5 L 47 50.3 Z M 44.9 45.2 C 43.7 45.2 43.1 45.9 43.1 46.4 L 43.1 47.2 C 43.1 47.8 43.7 48.4 44.9 48.4 C 46.1 48.4 46.7 47.8 46.7 47.2 L 46.7 46.4 C 46.7 45.9 46.1 45.2 44.9 45.2 Z" fill="#0068FF" />
                  {/* Chữ l */}
                  <path d="M 53.6 42.3 L 56.5 42.3 L 56.5 56.5 L 53.6 56.5 L 53.6 42.3 Z" fill="#0068FF" />
                  {/* Chữ o */}
                  <path d="M 59.8 49.8 C 59.8 46.8 61.1 44.9 64 44.9 C 66.8 44.9 68.2 46.8 68.2 49.8 L 68.2 53.1 C 68.2 56.1 66.8 58 64 58 C 61.1 58 59.8 56.1 59.8 53.1 L 59.8 49.8 Z M 62.5 53.1 C 62.5 54.7 63 55.6 64 55.6 C 65 55.6 65.5 54.7 65.5 53.1 L 65.5 49.8 C 65.5 48.2 65 47.3 64 47.3 C 63 47.3 62.5 48.2 62.5 49.8 L 62.5 53.1 Z" fill="#0068FF" />
                </svg>
              </a>

              {/* 3. TikTok Link */}
              <a 
                href="https://www.tiktok.com/@tuhocvui.6686" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:opacity-80 transition-transform transform hover:scale-105 duration-200"
                title="TikTok Tự Học Vui"
              >
                <svg viewBox="0 0 100 100" className="w-10 h-10 flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="50" fill="black" />
                  <path d="M66.4 43.1C66.5 43.1 66.6 43.1 66.8 43.1C63.5 41.2 61.3 37.7 61 33.6V33.5H51.4V62.4C51.4 66.7 47.9 70.2 43.6 70.2C39.3 70.2 35.8 66.7 35.8 62.4C35.8 58.1 39.3 54.6 43.6 54.6C44.7 54.6 45.7 54.8 46.6 55.2V45.2C45.6 45 44.6 44.9 43.6 44.9C33.9 44.9 26 52.8 26 62.5C26 72.2 33.9 80 43.6 80C53.3 80 61.1 72.1 61.2 62.5V47.5C65.3 50.8 70.5 52.7 76 52.7V43C72.5 43 69.2 41.8 66.4 39.7V43.1Z" fill="#00f2fe"/>
                  <path d="M64.6 41.3C64.7 41.3 64.8 41.3 65 41.3C61.7 39.4 59.5 35.9 59.2 31.8V31.7H49.6V60.6C49.6 64.9 46.1 68.4 41.8 68.4C37.5 68.4 34 64.9 34 60.6C34 56.3 37.5 52.8 41.8 52.8C42.9 52.8 43.9 53 44.8 53.4V43.4C43.8 43.2 42.8 43.1 41.8 43.1C32.1 43.1 24.2 51 24.2 60.7C24.2 70.4 32.1 78.2 41.8 78.2C51.5 78.2 59.3 70.3 59.4 60.7V45.7C63.5 49 68.7 50.9 74.2 50.9V41.2C70.7 41.2 67.4 40 64.6 37.9V41.3Z" fill="#fe004b"/>
                  <path d="M62.8 39.5C62.9 39.5 63 39.5 63.2 39.5C59.9 37.6 57.7 34.1 57.4 30V29.9H47.8V58.8C47.8 63.1 44.3 66.6 40 66.6C35.7 66.6 32.2 63.1 32.2 58.8C32.2 54.5 35.7 51 40 51C41.1 51 42.1 51.2 43 51.6V41.6C42 41.4 41 41.3 40 41.3C30.3 41.3 22.4 49.2 22.4 58.9C22.4 68.6 30.3 76.4 40 76.4C49.7 76.4 57.5 68.5 57.6 58.9V43.9C61.7 47.2 66.9 49.1 72.4 49.1V39.4C68.9 39.4 65.6 38.2 62.8 36.1V39.5Z" fill="white"/>
                </svg>
              </a>

              {/* 4. YouTube Link */}
              <a 
                href="#" 
                onClick={(e) => e.preventDefault()}
                className="hover:opacity-80 transition-transform transform hover:scale-105 duration-200"
                title="YouTube Tự Học Vui"
              >
                <svg className="w-10 h-10 flex-shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M88.5 33.5C87.5 29.8 84.6 26.9 80.9 25.9C74.2 24.1 50 24.1 50 24.1C50 24.1 25.8 24.1 19.1 25.9C15.4 26.9 12.5 29.8 11.5 33.5C9.7 40.2 9.7 50 9.7 50C9.7 50 9.7 59.8 11.5 66.5C12.5 70.2 15.4 73.1 19.1 74.1C25.8 75.9 50 75.9 50 75.9C50 75.9 74.2 75.9 80.9 74.1C84.6 73.1 87.5 70.2 88.5 66.5C90.3 59.8 90.3 50 90.3 50C90.3 50 90.3 40.2 88.5 33.5Z" fill="#FF0000"/>
                  <path d="M42.7 61L61.7 50L42.7 39V61Z" fill="white"/>
                </svg>
              </a>

            </div>

            {/* Cụm chứng nhận chân trang */}
            <div className="flex items-center gap-3 mt-1">
              <div className="border border-slate-100 rounded-md overflow-hidden bg-slate-50 h-8 flex items-center px-2">
                <span className="text-[10px] font-extrabold text-slate-400 tracking-wider">DMCA</span>
                <span className="text-[9px] font-bold bg-[#464646] text-white px-1 py-0.5 rounded ml-1">PROTECTED</span>
              </div>
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