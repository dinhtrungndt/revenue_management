import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FaBars, FaTachometerAlt, FaBoxes, FaClipboardList,
  FaChartLine, FaSignOutAlt, FaUser, FaTimes
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { MdOutlineProductionQuantityLimits } from 'react-icons/md';

const AdminLayout = () => {
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
        <div className="flex flex-col w-64 bg-gray-800">
          <div className="flex items-center justify-center h-16 bg-gray-900">
            <span className="text-white font-bold text-lg">Shop Thú Cưng Admin</span>
          </div>
          <div className="flex flex-col flex-grow overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              <Link
                to="/admin"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive('/admin') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FaTachometerAlt className="mr-3 h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/admin/inventory"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive('/admin/inventory') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FaBoxes className="mr-3 h-4 w-4" />
                Hàng Tồn Kho
              </Link>
              <Link
                to="/admin/export"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive('/admin/export') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FaClipboardList className="mr-3 h-4 w-4" />
                Hàng Xuất Kho
              </Link>
              <Link
                to="/admin/revenue"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive('/admin/revenue') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FaChartLine className="mr-3 h-4 w-4" />
                Báo Cáo Doanh Thu
              </Link>
              <Link
                to="/admin/list-products"
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  isActive('/admin/list-products') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <MdOutlineProductionQuantityLimits className="mr-3 h-4 w-4" />
                Sản phẩm
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 mt-5 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700"
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
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
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
                <span className="text-white font-bold text-lg">Shop Thú Cưng Admin</span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                <Link
                  to="/admin"
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive('/admin') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={toggleSidebar}
                >
                  <FaTachometerAlt className="mr-3 h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/admin/inventory"
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive('/admin/inventory') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={toggleSidebar}
                >
                  <FaBoxes className="mr-3 h-4 w-4" />
                  Hàng Tồn Kho
                </Link>
                <Link
                  to="/admin/export"
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive('/admin/export') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={toggleSidebar}
                >
                  <FaClipboardList className="mr-3 h-4 w-4" />
                  Hàng Xuất Kho
                </Link>
                <Link
                  to="/admin/revenue"
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive('/admin/revenue') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={toggleSidebar}
                >
                  <FaChartLine className="mr-3 h-4 w-4" />
                  Báo Cáo Doanh Thu
                </Link>
                <Link
                  to="/admin/list-products"
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive('/admin/list-products') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={toggleSidebar}
                >
                  <MdOutlineProductionQuantityLimits className="mr-3 h-4 w-4" />
                  Sản phẩm
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 mt-5 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700"
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
              <h1 className="text-lg font-semibold">{location.pathname === '/admin' ? 'Dashboard' : location.pathname.includes('inventory') ? 'Báo Cáo Hàng Tồn Kho' : location.pathname.includes('export') ? 'Báo Cáo Hàng Xuất Kho' : location.pathname.includes('revenue') ? 'Báo Cáo Doanh Thu' : location.pathname.includes('list-products') ? 'Sản Phẩm' : ''}</h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center">
                <FaUser className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{user?.name || 'Admin'}</span>
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

export default AdminLayout;