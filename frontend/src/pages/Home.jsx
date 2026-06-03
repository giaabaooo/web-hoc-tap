import React from 'react';
import { Button } from '../components/ui/Button';

export const Home = () => {
  return (
    <div className="min-h-screen bg-surface-strong flex flex-col items-center">
      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl md:text-[48px] font-bold text-text-primary leading-tight mb-6">
          Học tập thông minh <br />
          <span className="text-surface-raised">Vui vẻ mỗi ngày</span>
        </h1>
        <p className="mt-4 text-lg text-text-tertiary max-w-2xl mx-auto mb-10">
          Nền tảng giáo dục giúp các bé tiếp thu kiến thức hiệu quả. Tương tác trực quan, bài tập đa dạng và lộ trình được cá nhân hóa.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
          <Button variant="primary" className="px-8 py-4 text-lg">Khám phá khóa học</Button>
          <Button variant="secondary" className="px-8 py-4 text-lg">Tìm hiểu thêm</Button>
        </div>

        {/* Cấu trúc Gói học tập */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-12">
          {/* FREE Pack */}
          <div className="bg-surface-muted p-8 rounded-lg shadow-3 border border-border-default">
            <h3 className="text-xl font-bold text-text-primary mb-2">Gói FREE</h3>
            <p className="text-text-tertiary mb-6">Khởi đầu nhẹ nhàng với các bài học cơ bản.</p>
            <Button variant="secondary" className="w-full">Trải nghiệm miễn phí</Button>
          </div>
          
          {/* PRO Pack */}
          <div className="bg-surface-muted p-8 rounded-lg shadow-1 border-2 border-surface-raised relative">
            <div className="absolute top-0 right-0 bg-surface-raised text-surface-muted text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">PHỔ BIẾN</div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Gói PRO</h3>
            <p className="text-text-tertiary mb-6">Mở khóa toàn bộ bài tập và tính năng không quảng cáo.</p>
            <Button variant="primary" className="w-full">Nâng cấp PRO</Button>
          </div>

          {/* PREMIUM Pack */}
          <div className="bg-surface-muted p-8 rounded-lg shadow-3 border border-border-default">
            <h3 className="text-xl font-bold text-text-primary mb-2">Gói PREMIUM</h3>
            <p className="text-text-tertiary mb-6">Tương tác trực tiếp 1-1 với giáo viên hướng dẫn.</p>
            <Button variant="secondary" className="w-full">Đăng ký PREMIUM</Button>
          </div>
        </div>
      </main>
    </div>
  );
};