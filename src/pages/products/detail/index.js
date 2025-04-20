import { APP_CONFIG } from '../../../config';
import { FaTimes, FaPlus, FaMinus, FaExclamationTriangle, FaShoppingCart } from 'react-icons/fa';

const ProductDetailPage = ({
  selectedProduct,
  closeProductModal,
  quantity,
  increaseQuantity,
  decreaseQuantity,
  handleQuantityChange,
  handleBuyNow,
  ordering,
  orderError,
  showPaymentModal
}) => {
  // Format price as VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="fixed inset-0 overflow-y-auto z-40">
      <div className="flex items-end justify-center min-h-screen text-center">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeProductModal}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-t-xl text-left overflow-hidden shadow-xl transform transition-all w-full max-w-xs mx-auto">
          {/* Nút đóng ở góc trên bên phải */}
          <div className="absolute top-2 right-2 z-50">
            <button
              type="button"
              className="bg-white rounded-full w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-500 focus:outline-none shadow-sm"
              onClick={closeProductModal}
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>

          {/* Thanh kéo để đóng modal */}
          <div className="py-1 flex justify-center">
            <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
          </div>

          <div className="bg-white px-3 pt-3 pb-2">
            {/* Hình ảnh sản phẩm */}
            <div className="bg-gray-100 flex items-center justify-center p-2 mb-3 rounded">
              <img
                src={selectedProduct.image || `https://ui-avatars.com/api/?background=EBF4FF&color=4F46E5&bold=true&name=${encodeURIComponent(selectedProduct.name)}`}
                alt={selectedProduct.name}
                className="object-cover h-32 w-32"
              />

            </div>

            {/* Thông tin sản phẩm */}
            <div>
              {/* Tên và giá */}
              <h3 className="text-base font-medium text-gray-900">{selectedProduct.name}</h3>
              <p className="text-lg font-bold text-red-600 mb-1">{formatPrice(selectedProduct.price)}</p>

              {/* Danh mục và trạng thái */}
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {APP_CONFIG.PRODUCT_CATEGORIES.find(c => c.value === selectedProduct.category)?.label || selectedProduct.category}
                </span>

                {selectedProduct.stock > 0 ? (
                  selectedProduct.stock < 10 ? (
                    <span className="text-xs text-yellow-600">
                      Còn {selectedProduct.stock}
                    </span>
                  ) : null
                ) : (
                  <span className="text-xs text-red-600">
                    Hết hàng
                  </span>
                )}
              </div>

              {/* Mô tả sản phẩm - ngắn gọn hơn */}
              <div className="mb-3 text-xs text-gray-500">
                {selectedProduct.description}
              </div>

              {/* Bộ chọn số lượng */}
              {selectedProduct.stock > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Số lượng:</span>
                    <div className="flex items-center">
                      <button
                        type="button"
                        className="p-1.5 border border-gray-300 rounded-l-md focus:outline-none disabled:opacity-50"
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                      >
                        <FaMinus className="h-3 w-3 text-gray-500" />
                      </button>
                      <input
                        type="text"
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="w-10 text-center text-sm border-t border-b border-gray-300 py-1 focus:outline-none"
                      />
                      <button
                        type="button"
                        className="p-1.5 border border-gray-300 rounded-r-md focus:outline-none disabled:opacity-50"
                        onClick={increaseQuantity}
                        disabled={selectedProduct.stock <= quantity}
                      >
                        <FaPlus className="h-3 w-3 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Hàng tồn kho */}
                  <div className="mt-1 text-xs text-yellow-600">
                    Còn {selectedProduct.stock} sản phẩm
                  </div>

                  {/* Thành tiền */}
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">Thành tiền:</span>
                    <p className="text-base font-bold text-red-600">{formatPrice(selectedProduct.price * quantity)}</p>
                  </div>
                </div>
              )}

              {/* Thông báo lỗi */}
              {orderError && !showPaymentModal && (
                <div className="mb-3 bg-red-50 border-l-2 border-red-500 p-2 rounded-r text-xs">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaExclamationTriangle className="h-4 w-4 text-red-400" />
                    </div>
                    <div className="ml-2">
                      <p className="text-red-700">{orderError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nút hành động */}
          <div className="bg-white border-t border-gray-200 px-3 py-2 flex space-x-2">
            <button
              type="button"
              onClick={closeProductModal}
              className="w-1/2 inline-flex justify-center items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Đóng
            </button>

            {selectedProduct.stock > 0 ? (
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={ordering || selectedProduct.stock === 0}
                className={`w-1/2 inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none ${ordering ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
              >
                <FaShoppingCart className="mr-1.5 h-3 w-3" />
                Mua ngay
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-1/2 inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-gray-400 cursor-not-allowed"
              >
                Hết hàng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;