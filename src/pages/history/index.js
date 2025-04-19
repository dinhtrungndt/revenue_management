import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingBag, FaBoxOpen, FaTruck, FaCheck, FaTimes, FaExclamationTriangle, FaMoneyBill, FaCreditCard, FaSync } from 'react-icons/fa';
import { OrderService } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { APP_CONFIG } from '../../config';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Tách hàm fetchOrders ra ngoài để có thể gọi lại
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await OrderService.getUserOrders();
      console.log('Fetched orders:', data);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user orders
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Hàm làm mới danh sách đơn hàng
  const handleRefresh = () => {
    fetchOrders();
  };

  // Format price as VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Format date and time
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Đã đặt hàng':
        return <FaShoppingBag className="text-blue-500" />;
      case 'Đang xử lý':
        return <FaBoxOpen className="text-yellow-500" />;
      case 'Đang giao hàng':
        return <FaTruck className="text-purple-500" />;
      case 'Đã giao hàng':
        return <FaCheck className="text-green-500" />;
      case 'Đã hủy':
        return <FaTimes className="text-red-500" />;
      default:
        return <FaShoppingBag className="text-gray-500" />;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã đặt hàng':
        return 'bg-blue-100 text-blue-800';
      case 'Đang xử lý':
        return 'bg-yellow-100 text-yellow-800';
      case 'Đang giao hàng':
        return 'bg-purple-100 text-purple-800';
      case 'Đã giao hàng':
        return 'bg-green-100 text-green-800';
      case 'Đã hủy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get payment method icon and label
  const getPaymentMethodInfo = (paymentMethod) => {
    switch (paymentMethod) {
      case 'cash':
        return {
          icon: <FaMoneyBill className="text-green-600" />,
          label: 'Thanh toán tiền mặt',
          className: 'bg-green-100 text-green-700'
        };
      case 'transfer':
        return {
          icon: <FaCreditCard className="text-blue-600" />,
          label: 'Chuyển khoản',
          className: 'bg-blue-100 text-blue-700'
        };
      default:
        return {
          icon: <FaMoneyBill className="text-gray-600" />,
          label: 'Thanh toán tiền mặt',
          className: 'bg-gray-100 text-gray-700'
        };
    }
  };

  // Lấy nhãn danh mục dựa vào giá trị
  const getCategoryLabel = (categoryValue) => {
    const category = APP_CONFIG.PRODUCT_CATEGORIES.find(c => c.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Vui lòng đăng nhập
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Bạn cần đăng nhập để xem lịch sử đơn hàng
          </p>
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
              <div className="mt-2">
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <FaSync className="mr-1 h-4 w-4" />
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaSync className="h-4 w-4 mr-1" />
            Làm mới
          </button>
        </div>

        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Lịch sử đơn hàng trống</h3>
          <p className="mt-1 text-gray-500">Bạn chưa có đơn hàng nào</p>
          <div className="mt-6">
            <Link
              to="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Mua sắm ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FaSync className="h-4 w-4 mr-1" />
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {orders.map((order) => {
          const paymentInfo = getPaymentMethodInfo(order.paymentMethod);

          return (
            <div
              key={order._id}
              className="bg-white shadow-lg rounded-xl overflow-hidden flex flex-col transition-transform duration-300 hover:scale-105 hover:shadow-xl border border-gray-100"
            >
              {/* Order header */}
              <div className="px-3 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-900">
                  Đơn hàng #{order._id.substring(order._id.length - 8)}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Đặt lúc: {formatDate(order.createdAt)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${paymentInfo.className}`}>
                    {paymentInfo.icon}
                    <span className="ml-1">{paymentInfo.label}</span>
                  </span>
                </div>
              </div>

              {/* Order items */}
              <ul className="divide-y divide-gray-200 flex-1 p-3">
                {order.products.map((item, index) => (
                  <li key={index} className="py-2">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                        {/* Nếu có hình ảnh thật thì sử dụng, nếu không thì để placeholder */}
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-gray-500 text-xs">Hình ảnh</span>
                        )}
                      </div>
                      <div className="ml-2 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
                        <div className="mt-1 text-xs text-gray-500">
                          SL: {item.quantity} x {formatPrice(item.price)}
                        </div>
                        <div className="text-xs font-semibold text-gray-900 mt-1">
                          {formatPrice(item.quantity * item.price)}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Order footer */}
              <div className="px-3 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col text-sm">
                  <p className="text-gray-600 text-xs">
                    Tổng sản phẩm: {order.products.reduce((total, item) => total + item.quantity, 0)}
                  </p>
                  <p className="text-gray-900 font-bold text-sm mt-1">
                    Tổng tiền: <span className="text-red-600">{formatPrice(order.totalAmount)}</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistoryPage;