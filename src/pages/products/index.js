import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { APP_CONFIG } from '../../config';
import { fetchProducts } from '../../stores/redux/actions/adminActions.js';

const ProductsPage = () => {
  // Local state for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('createdAt_desc');

  const dispatch = useDispatch();
  const { products = [], loading = false, error = null } = useSelector((state) => state.adminReducer || {});

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Nếu state thay đổi do tương tác người dùng (không phải từ URL), cập nhật URL
    if (!location.search.includes(selectedCategory) ||
        !location.search.includes(searchTerm) ||
        !location.search.includes(sortOption)) {

      const queryParams = new URLSearchParams();

      if (selectedCategory !== 'all') {
        queryParams.set('category', selectedCategory);
      }

      if (searchTerm) {
        queryParams.set('search', searchTerm);
      }

      if (sortOption !== 'createdAt_desc') {
        queryParams.set('sort', sortOption);
      }

      const queryString = queryParams.toString();
      navigate(
        {
          pathname: '/products',
          search: queryString ? `?${queryString}` : '',
        },
        { replace: true }
      );
      return; // Dừng effect ở đây, sẽ chạy lại sau khi URL được cập nhật
    }

    // Fetch sản phẩm dựa trên các filter hiện tại
    const params = {};

    if (selectedCategory !== 'all') {
      params.category = selectedCategory;
    }

    if (searchTerm) {
      params.search = searchTerm;
    }

    params.sortOption = sortOption;

    // Thêm flag để kiểm soát việc cập nhật sau khi unmount
    let isActive = true;

    const fetchData = async () => {
      try {
        await dispatch(fetchProducts(params));
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isActive = false;
    };
  }, [selectedCategory, searchTerm, sortOption, navigate, location.search, dispatch]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    const formSearchTerm = e.target.search.value.trim();
    setSearchTerm(formSearchTerm);
  };

  // Handle filter changes
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // Format price as VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h1 className="text-xl font-bold text-gray-900 mb-3 sm:mb-0">Danh sách sản phẩm</h1>

        {/* Search form */}
        <form onSubmit={handleSearch} className="w-full sm:w-auto flex">
          <input
            type="text"
            name="search"
            placeholder="Tìm kiếm sản phẩm..."
            className="flex-grow sm:w-56 px-3 py-1 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            defaultValue={searchTerm}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-1.5 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <FaSearch className="text-sm" />
          </button>
        </form>
      </div>

      <div className="mb-4 bg-white p-3 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Category filter */}
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-1">Danh mục</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Tất cả
              </button>
              {APP_CONFIG.PRODUCT_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryChange(category.value)}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedCategory === category.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort options */}
          <div className="flex flex-col sm:ml-auto">
            <label htmlFor="sort" className="block text-xs font-medium text-gray-700 mb-1">Sắp xếp theo</label>
            <div className="relative">
              <select
                id="sort"
                value={sortOption}
                onChange={handleSortChange}
                className="block w-full pl-2 pr-8 py-1 text-xs border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              >
                <option value="createdAt_desc">Mới nhất</option>
                <option value="createdAt_asc">Cũ nhất</option>
                <option value="price_asc">Giá: Thấp đến cao</option>
                <option value="price_desc">Giá: Cao đến thấp</option>
                <option value="name_asc">Tên: A-Z</option>
                <option value="name_desc">Tên: Z-A</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                {sortOption.endsWith('desc') ? (
                  <FaSortAmountDown className="text-gray-400 text-xs" />
                ) : (
                  <FaSortAmountUp className="text-gray-400 text-xs" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Active filters */}
        {(selectedCategory !== 'all' || searchTerm) && (
          <div className="mt-3 pt-2 border-t border-gray-200">
            <h3 className="text-xs font-medium text-gray-500">Bộ lọc hiện tại:</h3>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Danh mục: {APP_CONFIG.PRODUCT_CATEGORIES.find(c => c.value === selectedCategory)?.label || selectedCategory}
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('all')}
                    className="ml-1 text-blue-500 hover:text-blue-700 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              )}

              {searchTerm && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Tìm kiếm: {searchTerm}
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="ml-1 text-blue-500 hover:text-blue-700 focus:outline-none"
                  >
                    ×
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                  setSortOption('createdAt_desc');
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-4 w-4 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-xs text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm">
          <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-xs font-medium text-gray-900">Không tìm thấy sản phẩm</h3>
          <p className="mt-1 text-xs text-gray-500">Không có sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSearchTerm('');
                setSortOption('createdAt_desc');
              }}
              className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <FaFilter className="-ml-1 mr-1 h-4 w-4" />
              Xóa bộ lọc
            </button>
          </div>
        </div>
      )}

      {/* Product grid */}
      {!loading && !error && products.length > 0 && (
        <>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4">
            {products.map((product) => (
              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="group"
              >
                <div className="relative bg-white rounded-lg shadow-sm overflow-hidden group-hover:shadow-md transition-shadow duration-300">
                  <div className="aspect-w-1 aspect-h-1 bg-gray-200 overflow-hidden">
                    <div className="h-32 flex items-center justify-center text-gray-500 text-xs">Hình ảnh sản phẩm</div>
                    {product.stock === 0 && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 text-xs">
                        Hết hàng
                      </div>
                    )}
                    {product.stock > 0 && product.stock < 10 && (
                      <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 text-xs">
                        Sắp hết
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate">
                      {product.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500 truncate">
                      {APP_CONFIG.PRODUCT_CATEGORIES.find(c => c.value === product.category)?.label || product.category}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-sm font-medium text-red-600">{formatPrice(product.price)}</p>
                      {product.weight && (
                        <p className="text-xs text-gray-500">{product.weight}</p>
                      )}
                    </div>
                    {sortOption.includes('createdAt') && (
                      <p className="mt-0.5 text-xs text-gray-400">
                        {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                type="button"
                onClick={() => console.log('Previous page clicked')}
                className="relative inline-flex items-center px-1.5 py-1.5 rounded-l-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <span className="sr-only">Trang trước</span>
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => console.log('Page 1 clicked')}
                aria-current="page"
                className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-3 py-1.5 border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                1
              </button>
              <button
                type="button"
                onClick={() => console.log('Page 2 clicked')}
                className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-3 py-1.5 border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                2
              </button>
              <button
                type="button"
                onClick={() => console.log('Page 3 clicked')}
                className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-3 py-1.5 border text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                3
              </button>
              <button
                type="button"
                onClick={() => console.log('Next page clicked')}
                className="relative inline-flex items-center px-1.5 py-1.5 rounded-r-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <span className="sr-only">Trang sau</span>
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductsPage;