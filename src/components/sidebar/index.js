import React from 'react';
import { FaHistory, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export const SideBar = ({ toggleMenu, currentPath }) => {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
        toggleMenu();
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
                    <div className="flex justify-end text-xl cursor-pointer text-gray-700 mb-6" onClick={toggleMenu}>
                        <FaTimes />
                    </div>

                    <ul className="space-y-2">
                        <li
                            className={`py-3 border-b border-gray-200 hover:text-blue-600 cursor-pointer ${currentPath === '/' ? 'text-blue-600 font-medium' : ''}`}
                            onClick={() => handleNavigation('/')}
                        >
                            Trang Chủ
                        </li>
                        <li
                            className={`py-3 border-b border-gray-200 hover:text-blue-600 cursor-pointer ${currentPath === '/products' ? 'text-blue-600 font-medium' : ''}`}
                            onClick={() => handleNavigation('/products')}
                        >
                            Sản Phẩm
                        </li>
                        <li
                            className={`py-3 border-b border-gray-200 hover:text-blue-600 cursor-pointer ${currentPath === '/order-history' ? 'text-blue-600 font-medium' : ''}`}
                            onClick={() => handleNavigation('/order-history')}
                        >
                            <div className="flex items-center">
                                <FaHistory className="mr-2" />
                                Lịch Sử Đơn Hàng
                            </div>
                        </li>
                        <li
                            className={`py-3 border-b border-gray-200 hover:text-blue-600 cursor-pointer ${currentPath === '/cart' ? 'text-blue-600 font-medium' : ''}`}
                            onClick={() => handleNavigation('/cart')}
                        >
                            Giỏ Hàng
                        </li>
                        <li
                            className={`py-3 border-b border-gray-200 hover:text-blue-600 cursor-pointer ${currentPath === '/account' ? 'text-blue-600 font-medium' : ''}`}
                            onClick={() => handleNavigation('/account')}
                        >
                            Tài Khoản
                        </li>
                        <li
                            className={`py-3 border-b border-gray-200 hover:text-blue-600 cursor-pointer ${currentPath === '/contact' ? 'text-blue-600 font-medium' : ''}`}
                            onClick={() => handleNavigation('/contact')}
                        >
                            Liên Hệ
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
};