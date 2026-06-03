import React from 'react';
import { useAuthStore } from '../store/useAuthStore';

export const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="w-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">
          Chào mừng trở lại, {user?.displayName?.split(' ')[0]}! 👋
        </h1>
        <p className="text-text-secondary mt-2">Hôm nay bạn muốn học gì nào?</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-muted p-6 rounded-[22px] shadow-1 border border-border-default">
          <h3 className="text-text-secondary text-sm font-medium mb-1">Thời gian học tập</h3>
          <p className="text-2xl font-bold text-text-primary">12.5 <span className="text-sm font-normal text-text-secondary">giờ</span></p>
        </div>

        <div className="bg-surface-muted p-6 rounded-[22px] shadow-1 border border-border-default">
          <h3 className="text-text-secondary text-sm font-medium mb-1">Khóa học hoàn thành</h3>
          <p className="text-2xl font-bold text-text-primary">3 <span className="text-sm font-normal text-text-secondary">khóa</span></p>
        </div>

        <div className="bg-surface-raised p-6 rounded-[22px] shadow-2 text-surface-muted relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-white/80 text-sm font-medium mb-1">Trạng thái tài khoản</h3>
            {/* Đảm bảo hiển thị đúng chuẩn tên gói: FREE, PRO, PREMIUM */}
            <p className="text-2xl font-bold">{user?.subscription || 'FREE'} PLAN</p>
            <button className="mt-4 px-4 py-2 bg-surface-muted text-surface-raised rounded-full text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-white">
              Nâng cấp ngay
            </button>
          </div>
          {/* Decorative element, không sử dụng blur để tối ưu hiệu suất */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full" />
        </div>
      </div>
    </div>
  );
};