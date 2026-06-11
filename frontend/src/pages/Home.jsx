import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Globe, GraduationCap, Calculator, BookOpen, 
  CheckCircle2, Users, BookMarked, PlayCircle, Award, Star
} from 'lucide-react';

export const Home = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      
      {/* 1. HERO BANNER TO ĐÙNG NGAY ĐẦU (image_d4160e.jpg) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full rounded-3xl overflow-hidden shadow-lg border border-gray-100">
          <img 
            src="/banner.jpg" 
            alt="Con tự học, con trưởng thành" 
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* 2. CHỌN MỘT CHƯƠNG TRÌNH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" /> Góc học tập
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0a192f] mb-4 tracking-tight">
            Chọn một chương trình, bắt đầu học vui
          </h2>
          <p className="text-gray-500 text-lg">
            Mỗi phần được thiết kế để con dễ vào học, phụ huynh dễ hiểu con đang luyện kỹ năng nào.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card Tiếng Anh */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-3xl p-6 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-sm">
                <Globe className="w-6 h-6" />
              </div>
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">Nghe nói</span>
            </div>
            <h3 className="text-xl font-bold text-[#0a192f] mb-3">Tiếng Anh</h3>
            <p className="text-gray-600 text-[15px] mb-8 line-clamp-3">
              Bài học ngắn theo chủ đề, có audio, video và luyện tập.
            </p>
            <Link to="/lessons?subject=Tiếng Anh" className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium transition-colors">
              Vào học &rarr;
            </Link>
          </div>

          {/* Card Tiếng Trung */}
          <div className="bg-orange-50/50 border border-orange-200 rounded-3xl p-6 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-sm">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">Từ vựng</span>
            </div>
            <h3 className="text-xl font-bold text-[#0a192f] mb-3">Tiếng Trung</h3>
            <p className="text-gray-600 text-[15px] mb-8 line-clamp-3">
              Làm quen phát âm, flashcard và câu giao tiếp cơ bản.
            </p>
            <Link to="/lessons?subject=Tiếng Trung" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full font-medium transition-colors">
              Vào học &rarr;
            </Link>
          </div>

          {/* Card Luyện thi (Coming Soon) */}
          <div className="bg-purple-50/50 border border-purple-200 rounded-3xl p-6 hover:shadow-md transition-all relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-2xl flex items-center justify-center shadow-sm">
                <Calculator className="w-6 h-6" />
              </div>
              <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">Thử sức</span>
            </div>
            <h3 className="text-xl font-bold text-[#0a192f] mb-3">Luyện thi</h3>
            <p className="text-gray-600 text-[15px] mb-8 line-clamp-3">
              Đề thi thử và bài tập trọng tâm để con tự kiểm tra.
            </p>
            <button className="inline-flex items-center gap-2 bg-gray-300 text-gray-600 px-5 py-2.5 rounded-full font-medium cursor-not-allowed">
              Coming soon
            </button>
          </div>

          {/* Card Tài liệu (Coming Soon) */}
          <div className="bg-teal-50/50 border border-teal-200 rounded-3xl p-6 hover:shadow-md transition-all relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-teal-500 text-white rounded-2xl flex items-center justify-center shadow-sm">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#0a192f] mb-3">Tài liệu</h3>
            <p className="text-gray-600 text-[15px] mb-8 line-clamp-3">
              Kho giáo trình, đề ôn được sắp xếp rõ ràng.
            </p>
            <button className="inline-flex items-center gap-2 bg-gray-300 text-gray-600 px-5 py-2.5 rounded-full font-medium cursor-not-allowed">
              Coming soon
            </button>
          </div>
        </div>
      </section>

      {/* 3. HAI CHƯƠNG TRÌNH NỔI BẬT */}
      <section className="bg-[#fffcf0] py-20 border-y border-yellow-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-100 border border-yellow-200 text-yellow-700 text-sm font-medium mb-4">
              <Star className="w-4 h-4" /> Chương trình tiêu biểu
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0a192f] mb-4 tracking-tight">
              Hai chương trình nổi bật cho con bắt đầu
            </h2>
            <p className="text-gray-500 text-lg">
              Chọn môn học phù hợp, bắt đầu bằng các nhiệm vụ nhỏ và theo dõi tiến bộ sau từng buổi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:px-12">
            {/* Gói Tiếng Anh */}
            <div className="bg-[#eaf1e8] rounded-[2rem] p-8 border border-[#d3e3cd] flex flex-col h-full relative overflow-hidden">
               {/* Trang trí nền */}
              <div className="absolute top-10 right-10 w-32 h-32 bg-white/40 rounded-full blur-2xl"></div>

              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-md">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#0a192f]">Lớp tiếng Anh cho bé từ 2 tuổi</h3>
                </div>
              </div>
              <p className="text-gray-600 mb-8 relative z-10">
                Bài học nhỏ, nhiều âm thanh và hình ảnh để con làm quen tiếng Anh tự nhiên.
              </p>
              
              <ul className="space-y-4 mb-10 flex-grow relative z-10">
                <li className="flex items-center gap-3 bg-white/70 px-4 py-3 rounded-xl">
                  <CheckCircle2 className="text-blue-500 w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-gray-700">Video và audio tương tác</span>
                </li>
                <li className="flex items-center gap-3 bg-white/70 px-4 py-3 rounded-xl">
                  <CheckCircle2 className="text-blue-500 w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-gray-700">Luyện nghe nói mỗi ngày</span>
                </li>
                <li className="flex items-center gap-3 bg-white/70 px-4 py-3 rounded-xl">
                  <CheckCircle2 className="text-blue-500 w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-gray-700">Bài tập ngắn, dễ nhớ</span>
                </li>
              </ul>

              <div className="bg-blue-500 rounded-2xl p-6 flex items-center justify-between mt-auto relative z-10">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">BẮT ĐẦU TỪ</p>
                  <p className="text-white text-3xl font-extrabold">10k/tháng</p>
                </div>
                <Link to="/pricing" className="bg-white text-blue-600 font-bold px-6 py-3 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
                  Khám phá ngay
                </Link>
              </div>
            </div>

            {/* Gói Tiếng Trung */}
            <div className="bg-[#fff1e0] rounded-[2rem] p-8 border border-[#fce0c5] flex flex-col h-full relative overflow-hidden">
               {/* Trang trí nền */}
               <div className="absolute top-10 right-10 w-32 h-32 bg-white/50 rounded-full blur-2xl"></div>

              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-md">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#0a192f]">Lớp tiếng Trung cho bé từ 5 tuổi</h3>
                </div>
              </div>
              <p className="text-gray-600 mb-8 relative z-10">
                Lộ trình theo từng ngày học với flashcard, đọc, xem video và bài hát.
              </p>
              
              <ul className="space-y-4 mb-10 flex-grow relative z-10">
                <li className="flex items-center gap-3 bg-white/70 px-4 py-3 rounded-xl">
                  <CheckCircle2 className="text-orange-500 w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-gray-700">Từ vựng theo chủ đề</span>
                </li>
                <li className="flex items-center gap-3 bg-white/70 px-4 py-3 rounded-xl">
                  <CheckCircle2 className="text-orange-500 w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-gray-700">Rèn phát âm, đọc và viết</span>
                </li>
                <li className="flex items-center gap-3 bg-white/70 px-4 py-3 rounded-xl">
                  <CheckCircle2 className="text-orange-500 w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-gray-700">Nắm mẫu câu cơ bản</span>
                </li>
              </ul>

              <div className="bg-orange-500 rounded-2xl p-6 flex items-center justify-between mt-auto relative z-10">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">BẮT ĐẦU TỪ</p>
                  <p className="text-white text-3xl font-extrabold">10k/tháng</p>
                </div>
                <Link to="/pricing" className="bg-white text-orange-600 font-bold px-6 py-3 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
                  Khám phá ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. QUY TRÌNH HỌC (4 nhiệm vụ nhỏ) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600 text-sm font-medium mb-4">
            <PlayCircle className="w-4 h-4" /> Quy trình học
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0a192f] tracking-tight">
            4 nhiệm vụ nhỏ để bắt đầu
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <span className="bg-[#0077c0] text-white font-bold text-sm px-4 py-1.5 rounded-full">01</span>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0077c0]">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Tạo tài khoản</h3>
            <p className="text-gray-500 leading-relaxed text-[15px]">
              Đăng ký tài khoản miễn phí cho phụ huynh và học sinh.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <span className="bg-[#0077c0] text-white font-bold text-sm px-4 py-1.5 rounded-full">02</span>
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <BookMarked className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Chọn chương trình</h3>
            <p className="text-gray-500 leading-relaxed text-[15px]">
              Chọn tiếng Anh, tiếng Trung, luyện thi.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <span className="bg-[#0077c0] text-white font-bold text-sm px-4 py-1.5 rounded-full">03</span>
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                <PlayCircle className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Học và luyện</h3>
            <p className="text-gray-500 leading-relaxed text-[15px]">
              Con xem bài, nghe audio và làm bài tập tương tác.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <span className="bg-[#0077c0] text-white font-bold text-sm px-4 py-1.5 rounded-full">04</span>
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Nhận sao tiến bộ</h3>
            <p className="text-gray-500 leading-relaxed text-[15px]">
              Theo dõi kết quả để nhận sao và mở khóa phần thưởng.
            </p>
          </div>
        </div>
      </section>

      {/* 5. ĐÁNH GIÁ (Học vui hơn, theo dõi nhẹ hơn) */}
      <section className="bg-blue-50/30 py-20 border-t border-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-100 text-blue-600 text-sm font-medium mb-4 shadow-sm">
              <Star className="w-4 h-4 fill-current" /> Phụ huynh chia sẻ
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0a192f] tracking-tight">
              Học vui hơn, theo dõi nhẹ hơn
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Review 1 */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-lg">
                  M
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-[15px]">Phụ huynh bé Minh</h4>
                  <p className="text-gray-500 text-sm">Tiếng Anh mầm non</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed italic">
                "Bài học ngắn nên con không bị mệt. Mỗi ngày chỉ cần mở lộ trình là biết hôm nay học gì."
              </p>
            </div>

            {/* Review 2 */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-lg">
                  N
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-[15px]">Phụ huynh bé Nam</h4>
                  <p className="text-gray-500 text-sm">Tiếng Anh tiểu học</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed italic">
                "Con thích phần nghe và bài tập tương tác. Gia đình theo dõi tiến độ cũng dễ hơn trước."
              </p>
            </div>

            {/* Review 3 */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 font-bold flex items-center justify-center text-lg">
                  M
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-[15px]">Phụ huynh bé Mai</h4>
                  <p className="text-gray-500 text-sm">Ôn tập và tài liệu</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed italic">
                "Tài liệu được gom gọn, con ôn lại ngay trên web và làm bài kiểm tra mà không phải tìm nhiều nơi."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER CHÂN TRANG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-[#0066b2] rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-xl">
          {/* Vòng tròn trang trí nền */}
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 md:w-2/3 text-center md:text-left mb-8 md:mb-0">
            <p className="text-blue-100 font-bold tracking-widest text-sm mb-3 uppercase">
              Sẵn sàng vào lớp?
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Cho con bắt đầu học vui trên Tự Học Vui
            </h2>
            <p className="text-blue-100 text-lg">
              Tạo tài khoản miễn phí, chọn môn học và bắt đầu với lộ trình từ 10k/tháng.
            </p>
          </div>
          
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Link to="/auth?mode=register" className="bg-white text-[#0066b2] hover:bg-gray-50 font-bold text-lg px-8 py-4 rounded-full transition-all text-center whitespace-nowrap shadow-md hover:shadow-lg">
              Đăng ký miễn phí
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};