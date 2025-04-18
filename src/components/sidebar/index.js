// src/components/sidebar/index.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTimes, FaHome, FaShoppingBag, FaClipboardList, FaPhone, FaUser, FaSignOutAlt, FaChartLine } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

export const SideBar = ({ toggleMenu, currentPath }) => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, hasRole } = useAuth();

    const handleNavigation = (path) => {
        navigate(path);
        toggleMenu();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        toggleMenu();
    };

    // Kiểm tra path hiện tại để highlight menu item
    const isActive = (path) => {
        if (path === '/' && currentPath === '/') return true;
        if (path !== '/' && currentPath.startsWith(path)) return true;
        return false;
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={toggleMenu}
            ></div>

            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-3/4 bg-white z-50 shadow-lg transform transition-transform duration-300 ease-in-out">
                <div className="p-4">
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-xl font-bold text-blue-600">Shop Thú Cưng</div>
                        <div className="text-xl cursor-pointer text-gray-700" onClick={toggleMenu}>
                            <FaTimes />
                        </div>
                    </div>

                    {isAuthenticated && user && (
                        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center mb-3">
                                <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center mr-3">
                                    <FaUser className="text-blue-600" />
                                </div>
                                <div>
                                    <div className="font-medium">{user.name}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                            </div>
                            {hasRole('admin') && (
                                <div className="text-sm mb-1">
                                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded">Admin</span>
                                </div>
                            )}
                            {hasRole(['staff']) && !hasRole('admin') && (
                                <div className="text-sm mb-1">
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded">Nhân viên</span>
                                </div>
                            )}
                        </div>
                    )}

                    <ul className="space-y-2">
                        <li
                            className={`py-3 border-b border-gray-200 hover:text-blue-600 cursor-pointer flex items-center ${isActive('/') ? 'text-blue-600 font-medium' : ''}`}
                            onClick={() => handleNavigation('/')}
                        >
                            <FaHome className="mr-3" />
                            Trang Chủ
                        </li>
                        <li
                            className={`py-3 border-b border-gray-200 hover:text-blue-600 cursor-pointer flex items-center ${isActive('/products') ? 'text-blue-600 font-medium' : ''}`}
                            onClick={() => handleNavigation('/products')}
                        >
                            <FaShoppingBag className="mr-3" />
                            Sản Phẩm
                        </li>
                        {isAuthenticated && (
                            <li
                                className={`py-3 border-b border-gray-200 hover:text-blue-600 cursor-pointer flex items-center ${isActive('/order-history') ? 'text-blue-600 font-medium' : ''}`}
                                onClick={() => handleNavigation('/order-history')}
                            >
                                <FaClipboardList className="mr-3" />
                                Lịch Sử Đơn Hàng
                            </li>
                        )}
                        {isAuthenticated && (
                            <li
                                className={`py-3 border-b border-gray-200 hover:text-blue-600 cursor-pointer flex items-center ${isActive('/account') ? 'text-blue-600 font-medium' : ''}`}
                                onClick={() => handleNavigation('/account')}
                            >
                                <FaUser className="mr-3" />
                                Tài Khoản
                            </li>
                        )}
                        <li
                            className={`py-3 border-b border-gray-200 hover:text-blue-600 cursor-pointer flex items-center ${isActive('/contact') ? 'text-blue-600 font-medium' : ''}`}
                            onClick={() => handleNavigation('/contact')}
                        >
                            <FaPhone className="mr-3" />
                            Liên Hệ
                        </li>

                        {/* Admin & Staff Links */}
                        {isAuthenticated && hasRole('admin') && (
                            <li
                                className={`py-3 border-b border-gray-200 hover:text-blue-600 cursor-pointer flex items-center ${isActive('/admin') ? 'text-blue-600 font-medium' : ''}`}
                                onClick={() => handleNavigation('/admin')}
                            >
                                <FaChartLine className="mr-3" />
                                Trang Quản Trị
                            </li>
                        )}
                        {isAuthenticated && hasRole(['staff']) && !hasRole('admin') && (
                            <li
                                className={`py-3 border-b border-gray-200 hover:text-blue-600 cursor-pointer flex items-center ${isActive('/staff') ? 'text-blue-600 font-medium' : ''}`}
                                onClick={() => handleNavigation('/staff')}
                            >
                                <FaChartLine className="mr-3" />
                                Trang Nhân Viên
                            </li>
                        )}

                        {/* Auth Links */}
                        {isAuthenticated ? (
                            <li
                                className="py-3 border-b border-gray-200 hover:text-red-600 cursor-pointer flex items-center text-red-600"
                                onClick={handleLogout}
                            >
                                <FaSignOutAlt className="mr-3" />
                                Đăng Xuất
                            </li>
                        ) : (
                            <>
                                <li
                                    className="py-3 border-b border-gray-200 hover:text-blue-600 cursor-pointer"
                                    onClick={() => handleNavigation('/login')}
                                >
                                    Đăng Nhập
                                </li>
                                <li
                                    className="py-3 border-b border-gray-200 hover:text-blue-600 cursor-pointer"
                                    onClick={() => handleNavigation('/register')}
                                >
                                    Đăng Ký
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </>
    );
};