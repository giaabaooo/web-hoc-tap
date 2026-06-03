// src/pages/ComingSoon.jsx
import React from 'react';
import { Construction } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ComingSoon = ({ title }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center min-h-[60vh] bg-surface-strong">
      <div className="bg-orange-100 text-orange-500 p-6 rounded-full mb-6">
        <Construction size={64} />
      </div>
      <h2 className="text-3xl font-bold text-text-primary mb-4">{title}</h2>
      <p className="text-text-tertiary max-w-md">
        Tính năng này đang trong quá trình phát triển và sẽ sớm được ra mắt. Cảm ơn bạn đã đồng hành cùng hệ thống!
      </p>
      <button 
        onClick={() => navigate(-1)} 
        className="mt-8 px-6 py-2 bg-surface-raised text-surface-muted rounded-full font-medium hover:bg-blue-600 transition-colors shadow-1 outline-none focus-visible:ring-2 focus-visible:ring-surface-raised"
      >
        Quay lại trang trước
      </button>
    </div>
  );
};