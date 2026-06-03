import React from 'react';
import { toast } from 'react-toastify';

export const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled, 
  isLoading, 
  ...props 
}) => {
  const baseStyle = "inline-flex items-center justify-center rounded-lg font-primary text-md px-5 py-3 transition-colors duration-fast outline-none focus-visible:ring-2 focus-visible:ring-surface-raised focus-visible:ring-offset-2 min-h-[44px] min-w-[44px]";
  
  const variants = {
    primary: "bg-surface-raised text-surface-muted hover:bg-blue-600 shadow-1",
    secondary: "bg-surface-strong text-text-primary border border-border-default hover:bg-gray-50",
  };

  const handleClick = (e) => {
    if (disabled || isLoading) return;
    
    if (onClick) {
      onClick(e);
    } else {
      toast.info('Chức năng đang được xử lý, bé đợi một chút nhé!', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${disabled || isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      onClick={handleClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Đang tải...' : children}
    </button>
  );
};