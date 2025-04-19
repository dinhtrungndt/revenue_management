import React from 'react'
import { FaTimes, FaMoneyBill, FaCreditCard, FaExclamationTriangle } from 'react-icons/fa'

const PayMent = ({
    setShowPaymentModal,
    paymentMethod,
    setPaymentMethod,
    handleCheckout,
    ordering,
    orderError
}) => {
  return (
    <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowPaymentModal(false)}></div>

          <div className="relative bg-white rounded-lg w-full max-w-md mx-auto p-5 shadow-xl">
            {/* Thanh kéo để đóng trên mobile */}
            <div className="py-1 flex justify-center md:hidden mb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Chọn phương thức thanh toán</h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 bg-white rounded-full w-8 h-8 flex items-center justify-center"
                onClick={() => setShowPaymentModal(false)}
              >
                <span className="sr-only">Đóng</span>
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <div
                  className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <FaMoneyBill className={`h-6 w-6 ${paymentMethod === 'cash' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <div className="ml-3">
                    <h4 className="text-base font-medium text-gray-900">Thanh toán tiền mặt khi nhận hàng</h4>
                    <p className="text-sm text-gray-500">Thanh toán khi nhận được hàng</p>
                  </div>
                </div>
              </div>

              <div>
                <div
                  className={`flex items-center p-4 border rounded-lg cursor-pointer ${paymentMethod === 'transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                  onClick={() => setPaymentMethod('transfer')}
                >
                  <FaCreditCard className={`h-6 w-6 ${paymentMethod === 'transfer' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <div className="ml-3">
                    <h4 className="text-base font-medium text-gray-900">Chuyển khoản ngân hàng</h4>
                    <p className="text-sm text-gray-500">Chuyển khoản trước khi giao hàng</p>
                  </div>
                </div>
              </div>
            </div>

            {orderError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
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

            <div className="mt-5">
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-3 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
  )
}

export default PayMent