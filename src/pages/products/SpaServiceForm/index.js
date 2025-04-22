import React, { useState } from 'react';
import { FaTimes, FaSave, FaMoneyBill, FaCreditCard, FaGift } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { OrderService } from '../../../services/apiService';

const SpaServiceForm = ({ onClose, onOrderSuccess }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [note, setNote] = useState('');
  const [price, setPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [isGiftOrder, setIsGiftOrder] = useState(false); // Thêm state cho quà tặng
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/products' } });
      return;
    }

    if (!note.trim()) {
      setError('Vui lòng nhập nội dung dịch vụ');
      return;
    }

    if (!price || price <= 0) {
      setError('Vui lòng nhập giá dịch vụ hợp lệ');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orderData = {
        note: note,
        price: parseFloat(price),
        paymentMethod: paymentMethod,
        appointmentTime: appointmentTime || null,
        isGiftOrder // Thêm isGiftOrder
      };

      await OrderService.createSpaOrder(orderData);

      setSuccess(true);
      onOrderSuccess();

      setTimeout(() => {
        setNote('');
        setPrice('');
        setPaymentMethod('cash');
        setAppointmentTime('');
        setIsGiftOrder(false); // Đặt lại trạng thái quà tặng
        setSuccess(false);
        setError(null);
      }, 2000);
    } catch (err) {
      console.error('Error creating spa order:', err);
      setError(err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi đặt dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto z-50 flex items-end justify-center md:items-center">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

      <div className="relative bg-white rounded-t-xl md:rounded-lg w-full max-w-md mx-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Dịch vụ chăm sóc thú cưng</h2>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={onClose}
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung dịch vụ
            </label>
            <textarea
              id="note"
              name="note"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Nhập chi tiết dịch vụ bạn cần..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Giá dịch vụ
            </label>
            <div className="relative">
              <input
                type="number"
                id="price"
                name="price"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Nhập giá dịch vụ"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                VND
              </div>
            </div>
            {price && (
              <p className="mt-1 text-sm text-gray-500">
                Thành tiền: {isGiftOrder ? '0 đ (Quà tặng)' : formatPrice(price)}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 mb-1">
              Thời gian đặt lịch (tùy chọn)
            </label>
            <input
              type="datetime-local"
              id="appointmentTime"
              name="appointmentTime"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phương thức thanh toán
            </label>
            <div className="space-y-2">
              <div
                className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                  paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onClick={() => setPaymentMethod('cash')}
              >
                <FaMoneyBill
                  className={`h-5 w-5 ${paymentMethod === 'cash' ? 'text-blue-500' : 'text-gray-400'}`}
                />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Thanh toán tiền mặt</h4>
                  <p className="text-xs text-gray-500">Thanh toán khi nhận dịch vụ</p>
                </div>
              </div>

              <div
                className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                  paymentMethod === 'transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onClick={() => setPaymentMethod('transfer')}
              >
                <FaCreditCard
                  className={`h-5 w-5 ${paymentMethod === 'transfer' ? 'text-blue-500' : 'text-gray-400'}`}
                />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Chuyển khoản ngân hàng</h4>
                  <p className="text-xs text-gray-500">Chuyển khoản trước khi nhận dịch vụ</p>
                </div>
              </div>

              <div
                className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                  isGiftOrder ? 'border-green-500 bg-green-50' : 'border-gray-300'
                }`}
                onClick={() => setIsGiftOrder(!isGiftOrder)}
              >
                <FaGift
                  className={`h-5 w-5 ${isGiftOrder ? 'text-green-500' : 'text-gray-400'}`}
                />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Đặt làm quà tặng</h4>
                  <p className="text-xs text-gray-500">Dịch vụ sẽ có giá 0đ</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-r">
              <div className="flex">
                <div className="flex-shrink-0 text-red-400">
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-3 rounded-r">
              <div className="flex">
                <div className="flex-shrink-0 text-green-400">
                  <svg
                    className="h-5 w-5"
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
                    Đặt dịch vụ thành công! Đang chuyển đến trang lịch sử đơn hàng...
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              className="mr-3 inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              onClick={onClose}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <FaSave className="mr-2 h-4 w-4" />
                  Hoàn tất
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SpaServiceForm;