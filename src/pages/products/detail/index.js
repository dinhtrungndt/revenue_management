// src/pages/product-detail/index.js

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMinus, FaPlus, FaMoneyBill, FaCreditCard, FaExclamationTriangle } from 'react-icons/fa';
import { ProductService, OrderService } from '../../../services/apiService';
import { useAuth } from '../../../contexts/AuthContext';
import { APP_CONFIG } from '../../../config';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [ordering, setOrdering] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash hoặc transfer
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy thông tin sản phẩm từ API
        const productData = await ProductService.getProductById(id);
        setProduct(productData);

        // Lấy các sản phẩm liên quan (cùng danh mục)
        const params = {
          category: productData.category,
        };

        const relatedProductsData = await ProductService.getProducts(params);
        // Lọc ra các sản phẩm khác với sản phẩm hiện tại và giới hạn số lượng
        const filteredRelatedProducts = relatedProductsData
          .filter(item => item._id !== id)
          .slice(0, 4);

        setRelatedProducts(filteredRelatedProducts);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  // Reset quantity and messages when product changes
  useEffect(() => {
    setQuantity(1);
    setOrderSuccess(false);
    setOrderError(null);
    setShowPaymentModal(false);
  }, [id]);

  // Format price as VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Handlers for quantity
  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
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
    if (!isNaN(value) && value >= 1 && product && value <= product.stock) {
      setQuantity(value);
    }
  };

  // Handle buy now button
  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    if (!product || product.stock < quantity) {
      setOrderError('Sản phẩm không đủ số lượng trong kho');
      return;
    }

    // Show payment method modal
    setShowPaymentModal(true);
  };

  // Handle payment selection and checkout
  const handleCheckout = async () => {
    try {
      setOrdering(true);
      setOrderError(null);

      // Create order with payment method
      const orderData = {
        products: [
          {
            product: product._id,
            quantity
          }
        ],
        paymentMethod: paymentMethod
      };

      // Gọi API tạo đơn hàng
      await OrderService.createOrder(orderData);

      setOrderSuccess(true);
      setShowPaymentModal(false);

      // Reset quantity after successful order
      setQuantity(1);

      // Redirect to order history after 3 seconds
      setTimeout(() => {
        navigate('/order-history');
      }, 3000);
    } catch (err) {
      console.error('Error creating order:', err);
      setOrderError(err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại sau.');
    } finally {
      setOrdering(false);
    }
  };

  // Lấy nhãn danh mục dựa vào giá trị
  const getCategoryLabel = (categoryValue) => {
    const category = APP_CONFIG.PRODUCT_CATEGORIES.find(c => c.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <FaArrowLeft className="mr-2" />
            Quay lại danh sách sản phẩm
          </button>
        </div>
      </div>
    );
  }

  // If product not found
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy sản phẩm</h2>
          <p className="mt-2 text-gray-500">Sản phẩm này không tồn tại hoặc đã bị xóa</p>
          <div className="mt-6">
            <Link
              to="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <FaArrowLeft className="mr-2" />
              Quay lại danh sách sản phẩm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success message */}
      {orderSuccess && (
        <div className="fixed inset-x-0 top-4 mx-auto w-3/4 sm:w-1/2 z-50">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Đặt hàng thành công! Đang chuyển đến trang lịch sử đơn hàng...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowPaymentModal(false)}></div>

          <div className="relative bg-white rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Chọn phương thức thanh toán</h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowPaymentModal(false)}
              >
                <span className="sr-only">Đóng</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <div
                  className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <FaMoneyBill className={`h-5 w-5 ${paymentMethod === 'cash' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Thanh toán tiền mặt khi nhận hàng</h4>
                    <p className="text-xs text-gray-500">Thanh toán khi nhận được hàng</p>
                  </div>
                </div>
              </div>

              <div>
                <div
                  className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                  onClick={() => setPaymentMethod('transfer')}
                >
                  <FaCreditCard className={`h-5 w-5 ${paymentMethod === 'transfer' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Chuyển khoản ngân hàng</h4>
                    <p className="text-xs text-gray-500">Chuyển khoản trước khi giao hàng</p>
                  </div>
                </div>
              </div>
            </div>

            {orderError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{orderError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 sm:mt-6">
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                onClick={handleCheckout}
                disabled={ordering}
              >
                {ordering ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  'Xác nhận đặt hàng'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="flex py-3 text-gray-500 text-sm mb-4">
        <ol className="flex items-center space-x-1">
          <li>
            <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
          </li>
          <li className="flex items-center">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li>
            <Link to="/products" className="hover:text-blue-600">Sản phẩm</Link>
          </li>
          <li className="flex items-center">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li className="text-gray-700 font-medium truncate">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="lg:flex">
          {/* Product image */}
          <div className="lg:w-1/2 bg-gray-100 flex items-center justify-center p-8">
            <div className="h-64 w-64 bg-white shadow rounded-lg flex items-center justify-center text-gray-500">
              Hình ảnh sản phẩm
            </div>
          </div>

          {/* Product info */}
          <div className="lg:w-1/2 p-8">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getCategoryLabel(product.category)}
                </span>
                {product.weight && (
                  <span className="ml-2 text-sm text-gray-500">{product.weight}</span>
                )}
              </div>
              <p className="text-3xl font-bold text-red-600">{formatPrice(product.price)}</p>
            </div>

            {/* Stock indicator */}
            <div className="mb-6">
              {product.stock > 10 ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-500" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  Còn hàng
                </span>
              ) : product.stock > 0 ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-yellow-500" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  Còn {product.stock} sản phẩm
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-red-500" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  Hết hàng
                </span>
              )}

              {product.featured && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Sản phẩm nổi bật
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Mô tả sản phẩm</h3>
              <div className="prose prose-sm text-gray-500">
                <p>{product.description}</p>
              </div>
            </div>

            {/* Quantity selector */}
            {product.stock > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Số lượng</h3>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                  >
                    <FaMinus className="h-3 w-3 text-gray-500" />
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-16 text-center border-t border-b border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    className="p-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    onClick={increaseQuantity}
                    disabled={product.stock <= quantity}
                  >
                    <FaPlus className="h-3 w-3 text-gray-500" />
                  </button>
                </div>
              </div>
            )}

            {/* Total price */}
            {product.stock > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Thành tiền</h3>
                <p className="text-2xl font-bold text-red-600">{formatPrice(product.price * quantity)}</p>
              </div>
            )}

            {/* Order error */}
            {orderError && !showPaymentModal && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{orderError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
              {product.stock > 0 ? (
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={ordering || product.stock === 0}
                  className={`w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                    ordering ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  Mua ngay
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-400 cursor-not-allowed"
                >
                  Hết hàng
                </button>
              )}

              <Link
                to="/products"
                className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaArrowLeft className="mr-2" />
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct._id}
                to={`/product/${relatedProduct._id}`}
                className="group"
              >
                <div className="relative bg-white rounded-lg shadow-sm overflow-hidden group-hover:shadow-md transition-shadow duration-300">
                  <div className="aspect-w-1 aspect-h-1 bg-gray-200 overflow-hidden">
                    <div className="h-32 flex items-center justify-center text-gray-500 text-xs">Hình ảnh sản phẩm</div>
                    {relatedProduct.stock === 0 && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 text-xs">
                        Hết hàng
                      </div>
                    )}
                    {relatedProduct.stock > 0 && relatedProduct.stock < 10 && (
                      <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 text-xs">
                        Sắp hết
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 truncate">
                      {relatedProduct.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500 truncate">
                      {getCategoryLabel(relatedProduct.category)}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-sm font-medium text-red-600">{formatPrice(relatedProduct.price)}</p>
                      {relatedProduct.weight && (
                        <p className="text-xs text-gray-500">{relatedProduct.weight}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;