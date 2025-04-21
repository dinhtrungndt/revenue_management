import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp, FaPaw, FaGift } from 'react-icons/fa';
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

  const { products = [], loading = false, error = null } = useSelector((state) => {
    return state.adminReducer || {};
  });

  const fetchProductsData = async (params) => {
    try {
      await dispatch(fetchProducts(params));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

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

    // Kiểm tra quà tặng riêng biệt (không gây nhầm lẫn với kiểm tra sản phẩm)
    if (selectedProduct.gift?.enabled && selectedProduct.gift.stock < quantity) {
      // Không ngăn việc mua hàng, chỉ thông báo
      console.log(`Quà tặng không đủ số lượng. Hiện có ${selectedProduct.gift.stock} quà tặng.`);
    }

    setShowPaymentModal(true);
  };

  const handleCheckout = async () => {
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
      };

      await OrderService.createOrder(orderData);
      setOrderSuccess(true);
      setShowPaymentModal(false);
      setQuantity(1);
      closeProductModal();

      // Cập nhật lại danh sách sản phẩm để phản ánh tồn kho mới
      fetchProductsData({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchTerm || undefined,
        sortOption,
      });
    } catch (err) {
      console.error('Error creating order:', err);

      // Phân tích thông báo lỗi từ server để hiển thị chính xác
      let errorMessage = err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.';

      if (errorMessage.includes('quà tặng')) {
        errorMessage = `⚠️ ${errorMessage} (Bạn có thể mua sản phẩm mà không có quà)`;
      } else if (errorMessage.includes('sản phẩm không đủ số lượng')) {
        errorMessage = `❌ ${errorMessage}`;
      }

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
    <div className="max-w-7xl mx-auto px-3 py-4">
      {orderSuccess && (
        <div className="fixed inset-x-0 top-4 mx-auto w-11/12 z-50">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
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
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-1">Danh mục</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Tất cả
              </button>
              {APP_CONFIG.PRODUCT_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryChange(category.value)}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedCategory === category.value
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
          <div className="flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-1">Sắp xếp theo</label>
            <div className="relative">
              <select
                value={sortOption}
                onChange={handleSortChange}
                className="w-full border border-gray-300 rounded-md py-1.5 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="createdAt_desc">Mới nhất</option>
                <option value="createdAt_asc">Cũ nhất</option>
                <option value="price_asc">Giá: Thấp đến cao</option>
                <option value="price_desc">Giá: Cao đến thấp</option>
                <option value="name_asc">Tên: A-Z</option>
                <option value="name_desc">Tên: Z-A</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                {sortOption.includes('asc') ? (
                  <FaSortAmountUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <FaSortAmountDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          </div>
          {(searchTerm || selectedCategory !== 'all' || sortOption !== 'createdAt_desc') && (
            <button
              onClick={resetFilters}
              className="text-blue-600 text-xs underline flex items-center"
            >
              <FaFilter className="mr-1" />
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>
      </div>
      {loading && (
        <div className="flex justify-center items-center py-6">
          <FaSearch className="animate-spin text-blue-600 h-6 w-6" />
          <span className="ml-2 text-gray-600">Đang tải...</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded-r text-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaPaw className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-2">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      {!loading && !error && (
        <>
          {sortedProducts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <FaPaw className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy sản phẩm</h3>
              <p className="mt-1 text-xs text-gray-500">Hãy thử thay đổi bộ lọc hoặc tìm kiếm khác.</p>
              <div className="mt-4">
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentItems.map((product) => (
                <div
                  key={product._id}
                  onClick={() => openProductModal(product)}
                  className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
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
                      className="w-full h-32 object-cover"
                    />
                    {product.gift?.enabled && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        <FaGift className="mr-1 h-3 w-3" />
                        Có quà
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                    <p className="text-base font-bold text-red-600 mt-1">{formatPrice(product.price)}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {APP_CONFIG.PRODUCT_CATEGORIES.find((c) => c.value === product.category)?.label ||
                          product.category}
                      </span>
                      {product.category === 'spa' ? (
                        <span className="text-xs text-gray-500">Dịch vụ</span>
                      ) : product.stock <= 0 ? (
                        <span className="text-xs text-red-600">Hết hàng</span>
                      ) : product.stock < 10 ? (
                        <span className="text-xs text-yellow-600">Còn {product.stock}</span>
                      ) : (
                        <span className="text-xs text-green-600">Còn hàng</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 bg-white p-3 rounded-lg shadow">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded text-sm ${
                  currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-700'
                }`}
              >
                Trước
              </button>
              <span className="text-sm text-gray-600">
                Trang {currentPage}/{totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded text-sm ${
                  currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-700'
                }`}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
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