import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp, FaPaw } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { APP_CONFIG } from '../../config';
import { fetchProducts } from '../../stores/redux/actions/adminActions.js';
import { OrderService } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import ProductDetailPage from './detail/index.js';
import PayMent from './payment/index.js';
import SpaServiceForm from './SpaServiceForm/index.js';

const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();

  // Lấy các tham số từ URL khi trang được tải
  const getInitialParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      category: searchParams.get('category') || 'all',
      search: searchParams.get('search') || '',
      sort: searchParams.get('sort') || 'createdAt_desc'
    };
  };

  const initialParams = getInitialParams();

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState(initialParams.search);
  const [selectedCategory, setSelectedCategory] = useState(initialParams.category);
  const [sortOption, setSortOption] = useState(initialParams.sort);

  // State for product detail modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState(null);

  // State for spa service form
  const [showSpaForm, setShowSpaForm] = useState(false);

  const { products = [], loading = false, error = null } = useSelector((state) => {
    return state.adminReducer || {};
  });

  // Gọi API để lấy sản phẩm dựa trên bộ lọc
  const fetchProductsData = async (params) => {
    try {
      await dispatch(fetchProducts(params));
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Cập nhật URL và fetch dữ liệu khi các bộ lọc thay đổi
  useEffect(() => {
    const apiParams = {};
    if (selectedCategory !== 'all') {
      apiParams.category = selectedCategory;
    }
    if (searchTerm) {
      apiParams.search = searchTerm;
    }
    apiParams.sortOption = sortOption;

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

    fetchProductsData(apiParams);
  }, [selectedCategory, searchTerm, sortOption, dispatch, navigate]);

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

  // Sửa chức năng sắp xếp
  const handleSortChange = (e) => {
    const newSortOption = e.target.value;
    setSortOption(newSortOption);
  };

  // Mở form dịch vụ spa
  const openSpaForm = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/products' } });
      return;
    }
    setShowSpaForm(true);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setSortOption('createdAt_desc');
  };

  // Format price as VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Handlers for product modal
  const openProductModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setOrderError(null);
    setOrderSuccess(false);
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  // Handlers for quantity
  const increaseQuantity = () => {
    if (selectedProduct && quantity < selectedProduct.stock) {
      setQuantity(prevQuantity => prevQuantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && selectedProduct && value <= selectedProduct.stock) {
      setQuantity(value);
    }
  };

  // Handle buy now button
  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products` } });
      return;
    }

    if (!selectedProduct || selectedProduct.stock < quantity) {
      setOrderError('Sản phẩm không đủ số lượng trong kho');
      return;
    }

    setShowPaymentModal(true);
  };

  // Handle payment selection and checkout
  const handleCheckout = async () => {
    try {
      setOrdering(true);
      setOrderError(null);

      const orderData = {
        products: [
          {
            product: selectedProduct._id,
            quantity
          }
        ],
        paymentMethod: paymentMethod
      };

      await OrderService.createOrder(orderData);

      setOrderSuccess(true);
      setShowPaymentModal(false);
      setQuantity(1);
      closeProductModal();
    } catch (err) {
      console.error('Error creating order:', err);
      setOrderError(err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.');
    } finally {
      setOrdering(false);
    }
  };

  const sortedProducts = useMemo(() => {
    if (!products.length) return [];

    const productsCopy = [...products];
    const [field, order] = sortOption.split('_');

    return productsCopy.sort((a, b) => {
      if (order === 'asc') {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });
  }, [products, sortOption]);

  return (
    <div className="max-w-7xl mx-auto px-3 py-4">
      {/* Success message */}
      {orderSuccess && (
        <div className="fixed inset-x-0 top-4 mx-auto w-11/12 z-50">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                Thêm hàng thành công! Đơn hàng của bạn đã được tạo thành công.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col justify-between items-start mb-4">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Danh sách sản phẩm</h1>

        {/* Search form */}
        <form onSubmit={handleSearch} className="w-full flex">
          <input
            type="text"
            name="search"
            placeholder="Tìm kiếm sản phẩm..."
            className="flex-grow px-3 py-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            defaultValue={searchTerm}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <FaSearch className="text-sm" />
          </button>
        </form>
      </div>

      <div className="mb-4 bg-white p-3 rounded-lg shadow-sm">
        <div className="flex flex-col space-y-3">
          {/* Category filter */}
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-1">Danh mục</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-2 py-1 rounded-full text-xs font-medium ${selectedCategory === 'all'
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
                  className={`px-2 py-1 rounded-full text-xs font-medium ${selectedCategory === category.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {category.label}
                </button>
              ))}
              <button
                onClick={openSpaForm}
                className="ml-auto px-2 py-1 rounded-full text-xs font-medium bg-purple-600 text-white hover:bg-purple-700"
              >
                <FaPaw className="inline-block mr-1" /> Spa
              </button>
            </div>
          </div>

          {/* Sort options */}
          <div className="flex flex-col">
            <label htmlFor="sort" className="block text-xs font-medium text-gray-700 mb-1">Sắp xếp theo</label>
            <div className="relative">
              <select
                id="sort"
                value={sortOption}
                onChange={handleSortChange}
                className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
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
                  <FaSortAmountDown className="text-gray-400 text-sm" />
                ) : (
                  <FaSortAmountUp className="text-gray-400 text-sm" />
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
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                onClick={resetFilters}
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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded-r">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-base font-medium text-gray-900">Không tìm thấy sản phẩm</h3>
          <p className="mt-1 text-sm text-gray-500">Không có sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
          <div className="mt-4">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <FaFilter className="-ml-1 mr-2 h-4 w-4" />
              Xóa bộ lọc
            </button>
          </div>
        </div>
      )}

      {/* Product grid - Tối ưu responsive */}
      {!loading && !error && products.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sortedProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => openProductModal(product)}
                className="cursor-pointer group"
              >
                <div className="relative bg-white rounded-lg shadow-sm overflow-hidden group-hover:shadow-md transition-shadow duration-300">
                  <div className="aspect-w-1 aspect-h-1 bg-gray-200 overflow-hidden">
                    <img
                      src={product?.image || `https://ui-avatars.com/api/?background=EBF4FF&color=4F46E5&bold=true&name=${encodeURIComponent(product.name)}`}
                      alt={product?.name || 'Product Image'}
                      className="object-cover w-full h-32 sm:h-40 group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.stock === 0 && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-1 py-0.5">
                        Hết
                      </div>
                    )}
                    {product.stock > 0 && product.stock < 10 && (
                      <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-1 py-0.5">
                        Sắp hết
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate">
                      {product.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-red-600 font-bold">{formatPrice(product.price)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                type="button"
                onClick={() => console.log('Previous page clicked')}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <span className="sr-only">Trang trước</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => console.log('Page 1 clicked')}
                aria-current="page"
                className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                1
              </button>
              <button
                type="button"
                onClick={() => console.log('Page 2 clicked')}
                className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                2
              </button>
              <button
                type="button"
                onClick={() => console.log('Page 3 clicked')}
                className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                3
              </button>
              <button
                type="button"
                onClick={() => console.log('Next page clicked')}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <span className="sr-only">Trang sau</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </>
      )}

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct ? (
        <ProductDetailPage
          selectedProduct={selectedProduct}
          closeProductModal={closeProductModal}
          quantity={quantity}
          increaseQuantity={increaseQuantity}
          decreaseQuantity={decreaseQuantity}
          handleQuantityChange={handleQuantityChange}
          handleBuyNow={handleBuyNow}
          ordering={ordering}
          orderError={orderError}
          showPaymentModal={showPaymentModal}
        />
      ) : null}

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <PayMent
          setShowPaymentModal={setShowPaymentModal}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          handleCheckout={handleCheckout}
          ordering={ordering}
          orderError={orderError}
        />
      )}

      {/* Spa Service Form */}
      {showSpaForm && (
        <SpaServiceForm onClose={() => setShowSpaForm(false)} />
      )}
    </div>
  );
};

export default ProductsPage;