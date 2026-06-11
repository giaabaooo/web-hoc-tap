import React from 'react';
import { Search, Eye } from 'lucide-react';

export const News = () => {
  // Dữ liệu mẫu bám sát theo ảnh chụp
  const newsItems = [
    {
      id: 1,
      title: "Giới thiệu",
      views: 415,
      date: "24 thg 11, 2025",
      img: "https://via.placeholder.com/400x220/3b82f6/ffffff?text=Hoc10k+Banner"
    },
    {
      id: 2,
      title: "Điều khoản sử dụng",
      views: 335,
      date: "22 thg 11, 2025",
      img: "https://via.placeholder.com/400x220/3b82f6/ffffff?text=Hoc10k+Banner"
    },
    {
      id: 3,
      title: "Chính sách hoàn trả",
      views: 122,
      date: "21 thg 11, 2025",
      img: "https://via.placeholder.com/400x220/3b82f6/ffffff?text=Hoc10k+Banner"
    },
    {
      id: 4,
      title: "Chính sách bảo mật",
      views: 135,
      date: "21 thg 11, 2025",
      img: "https://via.placeholder.com/400x220/3b82f6/ffffff?text=Hoc10k+Banner"
    },
    {
      id: 5,
      title: "Hướng dẫn tham gia đối tác",
      views: 89,
      date: "10 thg 11, 2025",
      img: "https://via.placeholder.com/400x220/4f46e5/ffffff?text=Partner+Banner"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fe] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Thanh tìm kiếm và sắp xếp */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          <div className="relative w-full max-w-3xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm hướng dẫn..."
              className="block w-full pl-11 pr-4 py-4 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700 shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-gray-500 text-sm font-medium whitespace-nowrap">Sắp xếp:</span>
            <select className="bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-full outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-full md:w-48 font-medium cursor-pointer">
              <option>Mới nhất</option>
              <option>Xem nhiều nhất</option>
            </select>
          </div>
        </div>

        {/* Lưới thẻ bài viết */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newsItems.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col cursor-pointer">
              {/* Ảnh bìa */}
              <div className="h-44 w-full relative">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Nội dung thẻ */}
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center gap-1.5 text-gray-400 text-sm font-medium mb-3">
                  <Eye className="w-4 h-4" />
                  <span>{item.views}</span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-4 line-clamp-2">
                  {item.title}
                </h3>
                
                <div className="mt-auto text-right text-sm text-gray-400 font-medium">
                  {item.date}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};