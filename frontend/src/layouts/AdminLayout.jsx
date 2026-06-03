// src/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

export const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-surface-strong text-text-primary font-primary">
      {/* Tương lai bạn có thể thêm Sidebar Admin ở đây, hiện tại chỉ wrap đơn giản */}
      <Outlet />
    </div>
  );
};