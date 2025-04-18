import React, { useState } from 'react';
import { FaBars, FaUser, FaSearch, FaTimes } from 'react-icons/fa';
import { SideBar } from '../sidebar';
import { useNavigate, useLocation } from 'react-router-dom';

export const HeaderPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
    if (isSearchActive) {
      setSearchQuery('');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchActive(false);
    }
  };

  // Determine current page title
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/':
        return 'Trang Chủ';
      case '/products':
        return 'Sản Phẩm';
      case '/cart':
        return 'Giỏ Hàng';
      case '/account':
        return 'Tài Khoản';
      case '/contact':
        return 'Liên Hệ';
      default:
        if (location.pathname.startsWith('/product/')) {
          return 'Chi Tiết Sản Phẩm';
        }
        return 'Trang Chủ';
    }
  };

  return (
    <div className="relative">
      {/* Header */}
      {!isSearchActive ? (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-100 shadow-md">
          <div className="text-xl text-gray-700 cursor-pointer" onClick={toggleMenu}>
            <FaBars />
          </div>
          <div className="text-lg font-bold text-gray-800">
            {getPageTitle()}
          </div>
          <div className="flex items-center">
            <div
              className="text-xl text-gray-700 cursor-pointer mr-4"
              onClick={toggleSearch}
            >
              <FaSearch />
            </div>
            <div
              className="text-xl text-gray-700 cursor-pointer"
              onClick={() => navigate('/account')}
            >
              <FaUser />
            </div>
          </div>
        </div>
      ) : (
        // Search Active Header
        <div className="bg-gray-100 shadow-md px-4 py-2">
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="flex-grow border rounded-l py-2 px-3 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-r"
            >
              <FaSearch />
            </button>
            <button
              type="button"
              className="ml-2 text-gray-700"
              onClick={toggleSearch}
            >
              <FaTimes />
            </button>
          </form>
        </div>
      )}

      {/* Sidebar Menu */}
      {isMenuOpen && (
        <SideBar
          toggleMenu={toggleMenu}
          currentPath={location.pathname}
        />
      )}
    </div>
  );
};