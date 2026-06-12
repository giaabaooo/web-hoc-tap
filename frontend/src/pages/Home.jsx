import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Globe, GraduationCap, Calculator, BookOpen, 
  CheckCircle2, Users, BookMarked, PlayCircle, Award, Star,
  Sprout, Rocket, Target, ChevronRight, MessageCircleHeart, Quote
} from 'lucide-react';

// Dữ liệu Feedback của phụ huynh
const feedbacks = [
  {
    quote: "Con mình trước đây rất sợ học tiếng Anh, nhưng từ khi học ở Tự Học Vui thì ngày nào cũng chủ động mở bài ra học. Nội dung rất sinh động và dễ hiểu, phù hợp với con lắm.",
    author: "Chị Lan Anh",
    role: "Phụ huynh bạn Tuấn Minh (6 tuổi)"
  },
  {
    quote: "Mình thích nhất là có thể theo dõi tiến độ học của con mỗi ngày. Con học đều hơn hẳn và tự tin hơn khi học trên lớp cùng cô và các bạn cũng như giao tiếp hàng ngày.",
    author: "Anh Tuấn",
    role: "Phụ huynh bạn Bảo Khang (8 tuổi)"
  },
  {
    quote: "Chương trình học rõ ràng, có lộ trình và đánh giá cụ thể nên mình không còn lo con học lan man, không hiệu quả như trước nữa.",
    author: "Chị Hương",
    role: "Phụ huynh bạn Anna (7 tuổi)"
  },
  {
    quote: "Con học mà như chơi, không cần ép. Đây là điều mình tìm kiếm bấy lâu. Con vẫn còn nhỏ nên mình thật sự ưu tiên con được vui vẻ mỗi khi làm một điều gì đó.",
    author: "Chị Mai",
    role: "Phụ huynh bạn Hoàng Vinh (5 tuổi)"
  }
];

export const Home = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 overflow-hidden">
      
      {/* 1. HERO BANNER TO ĐÙNG NGAY ĐẦU */}
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
            TÍNH NĂNG NỔI BẬT
          </h2>
          <p className="text-gray-500 text-lg">
            Khám phá ngay những bài học thú vị và được yêu thích nhất tại Tự Học Vui!
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

      {/* 3. HAI CHƯƠNG TRÌNH NỔI BẬT (Đã cập nhật thành Lộ trình Cambridge 3 cấp độ) */}
      <section className="bg-[#fffcf0] py-20 border-y border-yellow-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-100 border border-yellow-200 text-yellow-700 text-sm font-medium mb-4">
              <Star className="w-4 h-4 fill-current" /> Lộ trình chuẩn Cambridge
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#0a192f] mb-6 tracking-tight">
              Từ Starters đến Flyers – <br className="hidden md:block" />
              Hành trình giúp học sinh tự tin giao tiếp
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Giúp học sinh phát triển toàn diện 4 kỹ năng theo chuẩn quốc tế – bắt đầu từ nền tảng 
              và tiến tới giao tiếp tự tin với giáo trình chuẩn Cambridge.
            </p>
          </div>

          {/* 3 Columns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cấp độ 1: Starters */}
            <div className="group bg-[#f0f9f1] rounded-[2.5rem] p-8 border border-[#d3e3cd] flex flex-col relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-2">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-200/30 rounded-full blur-3xl group-hover:bg-green-300/40 transition-colors"></div>
              
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                  <Sprout className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-green-600 font-bold text-sm uppercase tracking-wider">Cấp độ 1</span>
                  <h3 className="text-2xl font-bold text-[#0a192f]">Starters (Pre A1)</h3>
                </div>
              </div>

              <p className="text-gray-600 mb-6 font-medium italic">"Làm quen tiếng Anh tự nhiên (4–6 tuổi)"</p>
              
              <ul className="space-y-3 mb-8 flex-grow relative z-10">
                {[
                  "Làm quen từ vựng cơ bản",
                  "Nghe – hiểu các câu đơn giản",
                  "Nhận diện chữ cái & từ quen thuộc",
                  "Phát triển phản xạ tự nhiên"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-white/60 px-4 py-3 rounded-2xl border border-white/50">
                    <CheckCircle2 className="text-green-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium text-sm md:text-base">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <div className="bg-green-600 rounded-2xl p-4 mb-4 text-center relative z-10">
                  <p className="text-green-100 text-xs font-bold mb-1">MỤC TIÊU</p>
                  <p className="text-white font-semibold text-sm">Hiểu & phản xạ tình huống hàng ngày</p>
                </div>
              </div>
            </div>

            {/* Cấp độ 2: Movers */}
            <div className="group bg-[#eff6ff] rounded-[2.5rem] p-8 border border-[#dbeafe] flex flex-col relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-2">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl group-hover:bg-blue-300/40 transition-colors"></div>
              
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-16 h-16 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <Rocket className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-blue-600 font-bold text-sm uppercase tracking-wider">Cấp độ 2</span>
                  <h3 className="text-2xl font-bold text-[#0a192f]">Movers (A1)</h3>
                </div>
              </div>

              <p className="text-gray-600 mb-6 font-medium italic">"Phát triển ngôn ngữ (6–8 tuổi)"</p>
              
              <ul className="space-y-3 mb-8 flex-grow relative z-10">
                {[
                  "Học từ vựng chủ đề nâng cao",
                  "Nói câu đơn giản & đặt câu hỏi",
                  "Luyện nghe hội thoại ngắn",
                  "Bắt đầu đọc – viết câu cơ bản"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-white/60 px-4 py-3 rounded-2xl border border-white/50">
                    <CheckCircle2 className="text-blue-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium text-sm md:text-base">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <div className="bg-blue-600 rounded-2xl p-4 mb-4 text-center relative z-10">
                  <p className="text-blue-100 text-xs font-bold mb-1">MỤC TIÊU</p>
                  <p className="text-white font-semibold text-sm">Giao tiếp đơn giản và tự tin hơn</p>
                </div>
              </div>
            </div>

            {/* Cấp độ 3: Flyers */}
            <div className="group bg-[#fff7ed] rounded-[2.5rem] p-8 border border-[#ffedd5] flex flex-col relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-2">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-200/30 rounded-full blur-3xl group-hover:bg-orange-300/40 transition-colors"></div>
              
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-16 h-16 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                  <Target className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-orange-600 font-bold text-sm uppercase tracking-wider">Cấp độ 3</span>
                  <h3 className="text-2xl font-bold text-[#0a192f]">Flyers (A2)</h3>
                </div>
              </div>

              <p className="text-gray-600 mb-6 font-medium italic">"Giao tiếp tự tin (8–10 tuổi)"</p>
              
              <ul className="space-y-3 mb-8 flex-grow relative z-10">
                {[
                  "Hiểu đoạn hội thoại dài",
                  "Diễn đạt ý tưởng rõ ràng",
                  "Đọc hiểu đoạn văn ngắn",
                  "Viết câu và đoạn văn linh hoạt"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-white/60 px-4 py-3 rounded-2xl border border-white/50">
                    <CheckCircle2 className="text-orange-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 font-medium text-sm md:text-base">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <div className="bg-orange-600 rounded-2xl p-4 mb-4 text-center relative z-10">
                  <p className="text-orange-100 text-xs font-bold mb-1">MỤC TIÊU</p>
                  <p className="text-white font-semibold text-sm">Sẵn sàng giao tiếp mức độ cao hơn</p>
                </div>
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

      {/* 5. ĐÁNH GIÁ CỦA PHỤ HUYNH (Đã cập nhật giao diện trượt ngang Marquee) */}
      <section className="py-20 bg-blue-50/30 border-t border-blue-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-blue-100 text-blue-600 text-sm font-bold mb-4 shadow-sm">
              <MessageCircleHeart className="w-4 h-4" /> Được chọn lựa & yêu thích
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0a192f] mb-4">
              Phụ huynh nói gì về <span className="text-blue-600">Tự Học Vui?</span>
            </h2>
            <p className="text-gray-500 text-lg">
              Hàng ngàn gia đình đã tin tưởng và đồng hành cùng chúng tôi mỗi ngày.
            </p>
          </div>
        </div>

        {/* CSS KEYFRAMES: Chạy từ trái sang phải */}
        <style>
          {`
            @keyframes marquee-ltr {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0%); }
            }
            .animate-marquee-ltr {
              display: flex;
              width: max-content;
              animation: marquee-ltr 40s linear infinite;
            }
            .animate-marquee-ltr:hover {
              animation-play-state: paused;
            }
            /* Ẩn thanh cuộn */
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}
        </style>

        {/* Khung chứa Marquee */}
        <div className="relative w-full hide-scrollbar">
          {/* Lớp gradient che mờ 2 bên tạo hiệu ứng smooth */}
          <div className="absolute top-0 left-0 w-16 md:w-32 h-full bg-gradient-to-r from-[#f5f8fc] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-16 md:w-32 h-full bg-gradient-to-l from-[#f5f8fc] to-transparent z-10 pointer-events-none"></div>

          {/* Khối chạy (gấp đôi mảng feedbacks để vòng lặp liên tục) */}
          <div className="animate-marquee-ltr gap-6 px-4 cursor-pointer">
            {[...feedbacks, ...feedbacks].map((fb, index) => (
              <div 
                key={index} 
                className="w-[350px] md:w-[450px] bg-white border border-gray-100 rounded-[2rem] p-8 flex-shrink-0 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex gap-1 mb-4 text-yellow-400">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <div className="relative mb-6">
                  <Quote className="absolute -top-3 -left-3 w-8 h-8 text-blue-50 rotate-180" />
                  <p className="text-gray-700 leading-relaxed relative z-10 text-[15px] md:text-base font-medium italic">
                    "{fb.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-auto border-t border-gray-50 pt-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                    {fb.author.charAt(4) || fb.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0a192f]">{fb.author}</h4>
                    <p className="text-sm text-gray-500">{fb.role}</p>
                  </div>
                </div>
              </div>
            ))}
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