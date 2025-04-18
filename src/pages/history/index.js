import React, { useState, useEffect } from 'react';
import { HeaderPage } from '../../components/header';
import { getOrderHistory } from '../../services/orderService';
import { useNavigate } from 'react-router-dom';

export const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [isEmpty, setIsEmpty] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const orderHistory = getOrderHistory();
    setOrders(orderHistory);
    setIsEmpty(orderHistory.length === 0);
  }, []);

  // Định dạng giá tiền
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
  };

  // Định dạng ngày tháng
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Xử lý khi click vào đơn hàng để xem chi tiết (chức năng có thể mở rộng sau)
  const handleOrderClick = (orderId) => {
    // Có thể thêm trang chi tiết đơn hàng sau này
    console.log('Xem chi tiết đơn hàng:', orderId);
  };

  // Xử lý khi click vào sản phẩm để chuyển đến trang sản phẩm
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div>
      <HeaderPage />
      <div className="p-4 pb-16">
        <h2 className="text-xl font-bold mb-4">Lịch sử đơn hàng</h2>

        {isEmpty ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-5xl mb-4">📋</div>
            <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào</p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-full"
              onClick={() => navigate('/products')}
            >
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order.id}
                className="border rounded-lg bg-white p-4 shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="text-sm text-gray-500">
                    Đơn hàng #{order.id.toString().slice(-8)}
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    {order.status}
                  </div>
                </div>

                <div
                  className="flex mb-3 cursor-pointer"
                  onClick={() => handleProductClick(order.productId)}
                >
                  <div className="bg-gray-200 h-16 w-16 flex-shrink-0 mr-3 rounded"></div>
                  <div>
                    <div className="font-medium">{order.productName}</div>
                    <div className="text-sm text-gray-600">
                      {order.productCategory === 'dog' ? 'Thức ăn cho chó' : 'Thức ăn cho mèo'}
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600">SL: {order.quantity}</span>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-red-600 font-medium">{formatPrice(order.price)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {formatDate(order.date)}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Tổng tiền</div>
                    <div className="font-bold text-red-600">{formatPrice(order.totalPrice)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};