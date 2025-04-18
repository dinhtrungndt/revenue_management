import React from 'react';
import { Outlet } from 'react-router-dom';
import { HeaderPage } from '../header';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <HeaderPage />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-white shadow-md mt-auto py-4">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© {new Date().getFullYear()} Shop Thú Cưng. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;