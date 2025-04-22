import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes, FaMoneyBill, FaCreditCard, FaExclamationTriangle, FaGift, FaSpinner } from 'react-icons/fa';
import { fetchGiftableProducts } from '../../../stores/redux/actions/adminActions.js';

const PayMent = ({
  product,
  quantity,
  paymentMethod,
  setPaymentMethod,
  handleCheckout,
  setShowPaymentModal,
  ordering
}) => {
  const dispatch = useDispatch();

  // Lấy danh sách giftable products từ Redux store
  const { giftableProducts = [], giftableProductsLoading = false, giftableProductsError = null } = useSelector((state) => {
    return state.adminReducer || {};
  });

  const [showGiftOption, setShowGiftOption] = useState(false);
  const [selectedGift, setSelectedGift] = useState(null);
  const [isGiftOrder, setIsGiftOrder] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Khi component hiển thị gift option, fetch danh sách sản phẩm quà tặng từ Redux
  useEffect(() => {
    if (showGiftOption) {
      dispatch(fetchGiftableProducts());
    }
  }, [showGiftOption, dispatch]);

  const handleSelectGift = (giftProduct) => {
    setSelectedGift(giftProduct);
  };

  const handleConfirmCheckout = () => {
    handleCheckout({
      productId: selectedGift ? selectedGift._id : null,
      isGiftOrder
    });
  };

  return (
    <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={() => setShowPaymentModal(false)}
      ></div>

      <div className="relative bg-white rounded-lg w-full max-w-md mx-auto p-5 shadow-xl">
        <div className="py-1 flex justify-center md:hidden mb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Thanh toán</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500 bg-white rounded-full w-8 h-8 flex items-center justify-center"
            onClick={() => setShowPaymentModal(false)}
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {!showGiftOption ? (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <div
                  className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                    paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <FaMoneyBill
                    className={`h-6 w-6 ${paymentMethod === 'cash' ? 'text-blue-500' : 'text-gray-400'}`}
                  />
                  <div className="ml-3">
                    <h4 className="text-base font-medium text-gray-900">Thanh toán tiền mặt khi nhận hàng</h4>
                    <p className="text-sm text-gray-500">Thanh toán khi nhận được hàng</p>
                  </div>
                </div>
              </div>

              <div>
                <div
                  className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                    paymentMethod === 'transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('transfer')}
                >
                  <FaCreditCard
                    className={`h-6 w-6 ${paymentMethod === 'transfer' ? 'text-blue-500' : 'text-gray-400'}`}
                  />
                  <div className="ml-3">
                    <h4 className="text-base font-medium text-gray-900">Chuyển khoản ngân hàng</h4>
                    <p className="text-sm text-gray-500">Chuyển khoản trước khi giao hàng</p>
                  </div>
                </div>
              </div>

              <div>
                <div
                  className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                    isGiftOrder ? 'border-green-500 bg-green-50' : 'border-gray-300'
                  }`}
                  onClick={() => setIsGiftOrder(!isGiftOrder)}
                >
                  <FaGift
                    className={`h-6 w-6 ${isGiftOrder ? 'text-green-500' : 'text-gray-400'}`}
                  />
                  <div className="ml-3">
                    <h4 className="text-base font-medium text-gray-900">Đặt làm quà tặng</h4>
                    <p className="text-sm text-gray-500">Đơn hàng sẽ có giá 0đ</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-3 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleConfirmCheckout}
                disabled={ordering}
              >
                {ordering ? (
                  <>
                    <FaSpinner className="animate-spin inline mr-2" />
                    Đang xử lý...
                  </>
                ) : (
                  'Đặt hàng ngay'
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <h4 className="text-base font-medium text-gray-900 mb-2 flex items-center">
                <FaGift className="mr-2 text-green-500" />
                Chọn một sản phẩm để tặng kèm
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Bạn có thể chọn một sản phẩm từ danh sách dưới đây để tặng kèm với đơn hàng của bạn.
              </p>

              {giftableProductsLoading ? (
                <div className="flex justify-center items-center h-40">
                  <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
                </div>
              ) : giftableProductsError ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <div className="flex items-center">
                    <FaExclamationTriangle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-sm text-red-700">{giftableProductsError}</p>
                  </div>
                </div>
              ) : giftableProducts.length === 0 ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                  <div className="flex items-center">
                    <FaExclamationTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    <p className="text-sm text-yellow-700">Không có sản phẩm quà tặng có sẵn.</p>
                  </div>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto pr-1">
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className={`border rounded-lg p-2 flex flex-col items-center cursor-pointer ${
                        selectedGift === null ? 'border-green-500 bg-green-50' : 'border-gray-300'
                      }`}
                      onClick={() => setSelectedGift(null)}
                    >
                      <div className="bg-gray-200 rounded-full p-3 mb-2">
                        <FaTimes className="h-5 w-5 text-gray-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 text-center">Không tặng quà</p>
                    </div>

                    {giftableProducts.map((giftProduct) => (
                      <div
                        key={giftProduct._id}
                        className={`border rounded-lg p-2 cursor-pointer ${
                          selectedGift && selectedGift._id === giftProduct._id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300'
                        }`}
                        onClick={() => handleSelectGift(giftProduct)}
                      >
                        <div className="flex flex-col items-center">
                          <img
                            src={
                              giftProduct.image ||
                              `https://ui-avatars.com/api/?background=EBF4FF&color=4F46E5&bold=true&name=${encodeURIComponent(
                                giftProduct.name
                              )}`
                            }
                            alt={giftProduct.name}
                            className="h-16 w-16 object-cover rounded-lg mb-2"
                          />
                          <p className="text-xs font-medium text-gray-900 text-center line-clamp-2 min-h-[2.5rem]">
                            {giftProduct.name}
                          </p>
                          <p className="text-xs text-green-600 font-semibold">
                            {formatPrice(giftProduct.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-2 mt-6">
              <button
                type="button"
                className="flex-1 justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                onClick={() => setShowGiftOption(false)}
              >
                Quay lại
              </button>
              <button
                type="button"
                className="flex-1 justify-center rounded-md border border-transparent px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none"
                onClick={handleConfirmCheckout}
                disabled={ordering}
              >
                {ordering ? (
                  <>
                    <FaSpinner className="animate-spin inline mr-2" />
                    Đang xử lý...
                  </>
                ) : (
                  'Đặt hàng ngay'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PayMent;