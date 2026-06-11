import React from 'react';
import { Outlet } from 'react-router-dom';
// Đảm bảo đường dẫn import Navbar này đúng với cấu trúc thư mục của bạn
import { Navbar } from '../components/ui/Navbar'; 

export const StudentLayout = () => {
  return (
    <div className="min-h-screen bg-[#f4f7fe] font-primary flex flex-col">
      {/* Gọi Navbar dùng chung xuống đây */}
      <Navbar />
      
      {/* Main Content Area chiếm toàn bộ chiều rộng (Đã xóa Sidebar) */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
};