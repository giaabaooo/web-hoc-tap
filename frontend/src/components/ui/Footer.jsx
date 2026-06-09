import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-surface-muted border-t border-border-default py-10 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h3 className="text-2xl font-bold text-text-primary flex items-center justify-center md:justify-start gap-2">
            Tự Học Vui
          </h3>
          <p className="text-text-tertiary text-sm mt-2">Học tập thông minh - Vui vẻ mỗi ngày</p>
        </div>
        
        <div className="flex items-center gap-6">
          <a 
            href="https://www.facebook.com/profile.php?id=61590283695697" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-text-secondary hover:text-[#1877F2] transition-colors font-medium"
          >
            <span className="material-symbols-outlined">facebook</span>
            Facebook
          </a>
          <a 
            href="https://www.tiktok.com/@tuhocvui.6686?is_from_webapp=1&sender_device=pc" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-text-secondary hover:text-black transition-colors font-medium"
          >
            <span className="material-symbols-outlined">music_note</span>
            TikTok
          </a>
        </div>
      </div>
    </footer>
  );
};