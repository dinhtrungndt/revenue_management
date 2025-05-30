import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp, FaPaw, FaStar, FaExclamationCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { APP_CONFIG } from '../../config';
import {
  fetchProducts,
  createOrder,
  createSpaOrder
} from '../../stores/redux/actions/adminActions.js';
import { useAuth } from '../../contexts/AuthContext';
import ProductDetailPage from './detail/index.js';
import PayMent from './payment/index.js';
import SpaServiceForm from './SpaServiceForm/index.js';
import { toast } from 'react-toastify';

const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();

  const getInitialParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      category: searchParams.get('category') || 'all',
      search: searchParams.get('search') || '',
      sort: searchParams.get('sort') || 'createdAt_desc',
    };
  };

  const initialParams = getInitialParams();
  const [searchTerm, setSearchTerm] = useState(initialParams.search);
  const [selectedCategory, setSelectedCategory] = useState(initialParams.category);
  const [sortOption, setSortOption] = useState(initialParams.sort);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [showSpaForm, setShowSpaForm] = useState(false);

  // Lấy dữ liệu từ Redux store
  const { products = [], loading = false, error = null } = useSelector((state) => {
    return state.adminReducer || {};
  });

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

    dispatch(fetchProducts(apiParams));
  }, [selectedCategory, searchTerm, sortOption, dispatch, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    const formSearchTerm = e.target.search.value.trim();
    setSearchTerm(formSearchTerm);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    const newSortOption = e.target.value;
    setSortOption(newSortOption);
    setCurrentPage(1);
  };

  const openSpaForm = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/products' } });
      return;
    }
    setShowSpaForm(true);
  };

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchTerm('');
    setSortOption('createdAt_desc');
    setCurrentPage(1);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

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
    setTimeout(() => {
      setOrderSuccess(false);
      setOrderError(null);
    }, 1000);
  };

  const increaseQuantity = () => {
    if (selectedProduct && quantity < selectedProduct.stock) {
      setQuantity((prevQuantity) => prevQuantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && selectedProduct && value <= selectedProduct.stock) {
      setQuantity(value);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products` } });
      return;
    }

    // Kiểm tra số lượng sản phẩm trước
    if (!selectedProduct || selectedProduct.stock < quantity) {
      setOrderError(`Sản phẩm ${selectedProduct.name} không đủ số lượng. Hiện có ${selectedProduct.stock} sản phẩm.`);
      return;
    }

    setShowPaymentModal(true);
  };

  const handleCheckout = async (giftData = null) => {
    try {
      setOrdering(true);
      setOrderError(null);

      const orderData = {
        products: [
          {
            product: selectedProduct._id,
            quantity,
          },
        ],
        paymentMethod: paymentMethod,
        isGiftOrder: giftData?.isGiftOrder || false
      };

      if (giftData && giftData.productId) {
        orderData.gift = { productId: giftData.productId };
      }

      // Sử dụng Redux thay vì gọi service trực tiếp
      await dispatch(createOrder(orderData));

      setOrderSuccess(true);
      setShowPaymentModal(false);
      setQuantity(1);
      closeProductModal();

      // Refresh danh sách sản phẩm để cập nhật số lượng tồn kho
      const apiParams = {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchTerm || undefined,
        sortOption,
      };
      dispatch(fetchProducts(apiParams));
    } catch (err) {
      console.error('Error creating order:', err);
      let errorMessage = err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.';
      setOrderError(errorMessage);
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-5">
      {/* Thông báo đặt hàng thành công - Cải tiến hiển thị và animation */}
      {orderSuccess && (
        <div className="fixed inset-x-0 top-4 z-50 px-3 sm:px-0 animate-fade-in-down">
          <div className="max-w-md mx-auto bg-green-50 border-l-4 border-green-500 p-3 rounded shadow-lg flex items-center">
            <FaPaw className="h-5 w-5 text-green-500 flex-shrink-0" />
            <p className="ml-3 text-sm font-medium text-green-700">Đặt hàng thành công!</p>
          </div>
        </div>
      )}

      <div className="mb-3 sm:mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Danh sách sản phẩm</h1>

        {/* Form tìm kiếm được tối ưu */}
        <form onSubmit={handleSearch} className="w-full flex mb-3">
          <input
            type="text"
            name="search"
            placeholder="Tìm kiếm sản phẩm..."
            className="flex-grow px-3 py-2 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            defaultValue={searchTerm}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-colors"
          >
            <FaSearch className="text-sm" />
          </button>
        </form>
      </div>

      {/* Bộ lọc được thiết kế lại */}
      <div className="mb-4 bg-white p-3 sm:p-4 rounded-lg shadow-sm">
        <div className="flex flex-col space-y-3">
          {/* Lọc danh mục */}
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Danh mục</label>
            <div className="flex flex-wrap gap-1.5 pb-1">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } transition-colors duration-150 ease-in-out shadow-sm`}
              >
                Tất cả
              </button>
              {APP_CONFIG.PRODUCT_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryChange(category.value)}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${
                    selectedCategory === category.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors duration-150 ease-in-out shadow-sm`}
                >
                  {category.label}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <button
                onClick={openSpaForm}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-150 ease-in-out shadow-sm flex items-center"
              >
                <FaPaw className="mr-1.5 h-3 w-3" />
                Đặt dịch vụ Spa
              </button>
            </div>
          </div>

          {/* Sắp xếp */}
          <div className="flex flex-col pt-1">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Sắp xếp theo</label>
            <div className="relative">
              <select
                value={sortOption}
                onChange={handleSortChange}
                className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none shadow-sm"
              >
                <option value="createdAt_desc">Mới nhất</option>
                <option value="createdAt_asc">Cũ nhất</option>
                <option value="price_asc">Giá: Thấp đến cao</option>
                <option value="price_desc">Giá: Cao đến thấp</option>
                <option value="name_asc">Tên: A-Z</option>
                <option value="name_desc">Tên: Z-A</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {sortOption.includes('asc') ? (
                  <FaSortAmountUp className="h-4 w-4 text-gray-500" />
                ) : (
                  <FaSortAmountDown className="h-4 w-4 text-gray-500" />
                )}
              </div>
            </div>
          </div>

          {/* Nút xóa bộ lọc */}
          {(searchTerm || selectedCategory !== 'all' || sortOption !== 'createdAt_desc') && (
            <button
              onClick={resetFilters}
              className="mt-1 text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors flex items-center self-start"
            >
              <FaFilter className="mr-1.5 h-3 w-3" />
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Trạng thái loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-sm text-gray-600 font-medium">Đang tải...</span>
        </div>
      )}

      {/* Hiển thị lỗi */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm mb-4">
          <div className="flex">
            <FaPaw className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Hiển thị danh sách sản phẩm */}
      {!loading && !error && (
        <>
          {sortedProducts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="bg-gray-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto">
                <FaPaw className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-3 text-base font-medium text-gray-900">Không tìm thấy sản phẩm</h3>
              <p className="mt-2 text-sm text-gray-500">Hãy thử thay đổi bộ lọc hoặc tìm kiếm khác.</p>
              <div className="mt-4">
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                >
                  <FaFilter className="mr-1.5 h-3.5 w-3.5" />
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {currentItems.map((product) => (
                <div
                  key={product._id}
                  onClick={() => openProductModal(product)}
                  className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md active:shadow-inner transition-all duration-150 relative"
                >
                  <div className="relative">
                    <img
                      src={
                        product.image ||
                        `https://ui-avatars.com/api/?background=EBF4FF&color=4F46E5&bold=true&name=${encodeURIComponent(
                          product.name
                        )}`
                      }
                      alt={product.name}
                      className="w-full h-36 object-cover"
                      loading="lazy"
                    />

                    {/* Badge sản phẩm nổi bật */}
                    {product.featured && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center">
                        <FaStar className="mr-1 h-3 w-3" />
                        <span>Nổi bật</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 h-10">{product.name}</h3>
                    <p className="text-base font-bold text-red-600 mt-1.5">{formatPrice(product.price)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">
                        {APP_CONFIG.PRODUCT_CATEGORIES.find((c) => c.value === product.category)?.label ||
                          product.category}
                      </span>

                      {/* Hiển thị trạng thái tồn kho */}
                      {product.category === 'spa' ? (
                        <span className="text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-md flex items-center">
                          <FaPaw className="mr-1 h-2.5 w-2.5" />
                          Dịch vụ
                        </span>
                      ) : product.stock <= 0 ? (
                        <span className="text-xs text-white bg-red-500 px-1.5 py-0.5 rounded-md font-medium">
                          Hết hàng
                        </span>
                      ) : product.stock < 10 ? (
                        <span className="text-xs text-white bg-amber-500 px-1.5 py-0.5 rounded-md font-medium flex items-center">
                          <FaExclamationCircle className="mr-1 h-2.5 w-2.5" />
                          Còn {product.stock}
                        </span>
                      ) : (
                        <span className="text-xs text-white bg-green-500 px-1.5 py-0.5 rounded-md font-medium">
                          Còn hàng
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ribbon cho sản phẩm sắp hết hàng */}
                  {product.category !== 'spa' && product.stock > 0 && product.stock < 5 && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-red-500 text-white text-xs py-1 px-3 transform rotate-45 translate-x-6 -translate-y-1 shadow-md">
                        Sắp hết!
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 bg-white p-3 rounded-lg shadow">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded text-sm font-medium flex items-center ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Trước
              </button>

              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700">
                  Trang {currentPage} / {totalPages}
                </span>
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded text-sm font-medium flex items-center ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors'
                }`}
              >
                Sau
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showProductModal && selectedProduct && (
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
      )}

      {showPaymentModal && selectedProduct && (
        <PayMent
          product={selectedProduct}
          quantity={quantity}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          handleCheckout={handleCheckout}
          setShowPaymentModal={setShowPaymentModal}
          ordering={ordering}
        />
      )}

      {showSpaForm && (
        <SpaServiceForm onClose={() => setShowSpaForm(false)} onOrderSuccess={() => setOrderSuccess(true)} />
      )}
    </div>
  );
};

export default ProductsPage;