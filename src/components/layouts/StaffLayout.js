import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaBoxes, FaSignOutAlt, FaUser, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { MdOutlineProductionQuantityLimits } from 'react-icons/md';
import { IoReturnUpBack } from 'react-icons/io5';

const StaffLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Kiểm tra path hiện tại để highlight menu item
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-blue-800">
          <div className="flex items-center justify-center h-16 bg-blue-900">
            <span className="text-white font-bold text-lg">Shop Thú Cưng Staff</span>
          </div>
          <div className="flex flex-col flex-grow overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              <Link
                to="/staff"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive('/staff') ? 'bg-blue-900 text-white' : 'text-blue-100 hover:bg-blue-700'
                  }`}
              >
                <FaBoxes className="mr-3 h-4 w-4" />
                Hàng Tồn Kho
              </Link>
              <Link
                to="/products"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive('/products') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
              >
                <IoReturnUpBack className="mr-3 h-4 w-4" />
                Quay về
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 mt-5 text-sm font-medium text-blue-100 rounded-md hover:bg-blue-700"
              >
                <FaSignOutAlt className="mr-3 h-4 w-4" />
                Đăng Xuất
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleSidebar}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-blue-800">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleSidebar}
              >
                <span className="sr-only">Đóng sidebar</span>
                <FaTimes className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <span className="text-white font-bold text-lg">Shop Thú Cưng Staff</span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                <Link
                  to="/staff"
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive('/staff') ? 'bg-blue-900 text-white' : 'text-blue-100 hover:bg-blue-700'
                    }`}
                  onClick={toggleSidebar}
                >
                  <FaBoxes className="mr-3 h-4 w-4" />
                  Hàng Tồn Kho
                </Link>
                <Link
                  to="/products"
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive('/products') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                >
                  <IoReturnUpBack className="mr-3 h-4 w-4" />
                  Quay về
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 mt-5 text-sm font-medium text-blue-100 rounded-md hover:bg-blue-700"
                >
                  <FaSignOutAlt className="mr-3 h-4 w-4" />
                  Đăng Xuất
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Mở sidebar</span>
            <FaBars className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-lg font-semibold">Báo Cáo Hàng Tồn Kho</h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center">
                <FaUser className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{user?.name || 'Nhân viên'}</span>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;