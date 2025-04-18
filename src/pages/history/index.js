import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingBag, FaBoxOpen, FaTruck, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { OrderService } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { APP_CONFIG } from '../../config';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await OrderService.getUserOrders();
        setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Format price as VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
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
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Lịch sử đơn hàng trống</h2>
          <p className="mt-2 text-gray-500">Bạn chưa có đơn hàng nào</p>
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Lịch sử đơn hàng</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white shadow overflow-hidden rounded-md">
            {/* Order header */}
            <div className="px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200">
              <div className="mb-2 sm:mb-0">
                <h3 className="text-lg font-medium text-gray-900">
                  Đơn hàng #{order._id.substring(order._id.length - 8)}
                </h3>
                <p className="text-sm text-gray-500">
                  Đặt hàng vào: {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1">{order.status}</span>
                </span>
              </div>
            </div>

            {/* Order items */}
            <ul className="divide-y divide-gray-200">
              {order.products.map((item, index) => (
                <li key={index} className="px-4 py-4 sm:px-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-gray-500 text-xs">Hình ảnh</span>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="mt-1 flex justify-between">
                        <div className="text-sm text-gray-500">
                          SL: {item.quantity} x {formatPrice(item.price)}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(item.quantity * item.price)}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Order footer */}
            <div className="px-4 py-4 sm:px-6 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-sm text-gray-700">
                  Tổng số sản phẩm: {order.products.reduce((total, item) => total + item.quantity, 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-700">Tổng tiền:</p>
                <p className="text-xl font-bold text-red-600">{formatPrice(order.totalAmount)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistoryPage;