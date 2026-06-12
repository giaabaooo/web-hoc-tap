import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/ui/Navbar'; 

export const StudentLayout = () => {
  return (
    <div className="min-h-screen bg-[#f4f7fe] font-primary flex flex-col">
      {/* Gọi Navbar dùng chung xuống đây */}
      <Navbar />
      
      {/* Main Content Area chiếm toàn bộ chiều rộng (Đã xóa Sidebar và Sub-menu) */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
};