// src/layouts/PublicLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/ui/Navbar';
import { Footer } from '../components/ui/Footer';
import { FeedbackWidget } from '../components/FeedbackWidget';

export const PublicLayout = () => {
  return (
    <>
    <div className="flex flex-col min-h-screen bg-surface-strong">
      <Navbar />
      {/* Outlet là nơi nội dung các trang Home, Lessons, Auth, ComingSoon... hiển thị */}
      <main className="flex-1">
        <Outlet /> 
      </main>
    </div>
    <Footer />
      <FeedbackWidget />
    </>
    
  );
};