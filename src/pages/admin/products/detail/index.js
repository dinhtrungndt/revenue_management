import React, { useState, useEffect } from 'react';
import {
  FaTimes,
  FaEdit,
  FaEyeSlash,
  FaSpinner,
  FaStar,
  FaWeightHanging,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { LuEyeClosed } from 'react-icons/lu';
import { APP_CONFIG } from '../../../../config';
import EditProductDialog from '../update/index.js';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, hideProduct, fetchProducts } from '../../../../stores/redux/actions/adminActions.js';
import { FETCH_PRODUCT_BY_ID_ERROR } from '../../../../stores/redux/actions/types.js';

const ProductDetailDialogAdmin = ({ productId, onClose, onProductHidden }) => {
  const dispatch = useDispatch();
  const { productDetails, productDetailsLoading, productDetailsError } = useSelector((state) => state.adminReducer);
  const [confirmHide, setConfirmHide] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Lấy chi tiết sản phẩm
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));
    }
  }, [productId, dispatch]);

  // Xử lý ẩn sản phẩm
  const handleHideProduct = async () => {
    if (!confirmHide) {
      setConfirmHide(true);
      // Tự động reset trạng thái confirm sau 5 giây
      setTimeout(() => {
        setConfirmHide(false);
      }, 5000);
      return;
    }

    try {
      await dispatch(hideProduct(productId));
      if (onProductHidden) {
        onProductHidden(productId);
      }
      onClose();
    } catch (err) {
      console.error('Error hiding product:', err);
    }
  };

  // Mở dialog chỉnh sửa
  const handleEdit = () => {
    setShowEditDialog(true);
  };

  // Đóng dialog chỉnh sửa
  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
  };

  // Xử lý khi sản phẩm được cập nhật
  const handleProductUpdated = async () => {
    try {
      dispatch(fetchProducts({
        page: 1,
        limit: 10,
        sort: 'createdAt_desc',
        filter: {
          category: 'all',
          search: ''
        }
      }));
      setShowEditDialog(false);
      onClose();
    } catch (err) {
      console.error('Error refreshing product details:', err);
      dispatch({
        type: FETCH_PRODUCT_BY_ID_ERROR,
        payload: { message: 'Không thể làm mới thông tin sản phẩm.' },
      });
    }
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="fixed inset-0 overflow-y-auto z-40">
      <div className="flex items-end justify-center min-h-screen text-center sm:block">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-t-xl text-left overflow-hidden shadow-xl transform transition-all w-full max-w-xs mx-auto">
          {/* Nút đóng ở góc trên bên phải */}
          <div className="absolute top-2 right-2 z-50">
            <button
              type="button"
              className="bg-white rounded-full w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-500 focus:outline-none shadow-sm"
              onClick={onClose}
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>

          {/* Thanh kéo để đóng modal */}
          <div className="py-1 flex justify-center">
            <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
          </div>

          {/* Nội dung modal */}
          <div className="px-4 pt-4 pb-5">
            {productDetailsLoading ? (
              <div className="flex justify-center items-center py-10">
                <FaSpinner className="animate-spin text-blue-600 h-8 w-8" />
                <span className="ml-2 text-gray-600">Đang tải...</span>
              </div>
            ) : productDetailsError ? (
              <div className="py-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r mb-4">
                  <div className="flex">
                    <FaExclamationTriangle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-sm text-red-700">{productDetailsError.message || 'Không thể tải thông tin sản phẩm.'}</p>
                  </div>
                </div>
                <button
                  className="w-full text-center text-blue-600 hover:text-blue-800 text-sm"
                  onClick={onClose}
                >
                  Đóng
                </button>
              </div>
            ) : !productDetails ? (
              <div className="py-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-r mb-4">
                  <div className="flex">
                    <FaExclamationTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    <p className="text-sm text-yellow-700">Không tìm thấy thông tin sản phẩm.</p>
                  </div>
                </div>
                <button
                  className="w-full text-center text-blue-600 hover:text-blue-800 text-sm"
                  onClick={onClose}
                >
                  Đóng
                </button>
              </div>
            ) : (
              <>
                {/* Hình ảnh sản phẩm */}
                <div className="bg-gray-100 flex items-center justify-center p-2 mb-3 rounded">
                  <img
                    src={productDetails.image || `https://ui-avatars.com/api/?background=EBF4FF&color=4F46E5&bold=true&name=${encodeURIComponent(productDetails.name)}`}
                    alt={productDetails.name}
                    className="object-cover h-32 w-32"
                  />
                </div>

                {/* Thông tin sản phẩm */}
                <div>
                  {/* Tên và giá */}
                  <h3 className="text-base font-medium text-gray-900">{productDetails.name}</h3>
                  <p className="text-lg font-bold text-red-600 mb-1">{formatPrice(productDetails.price)}</p>

                  {/* Danh mục và trạng thái */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {APP_CONFIG.PRODUCT_CATEGORIES.find(c => c.value === productDetails.category)?.label || productDetails.category}
                    </span>

                    {productDetails.stock > 0 ? (
                      productDetails.stock < 10 ? (
                        <span className="text-xs text-yellow-600">
                          Còn {productDetails.stock}
                        </span>
                      ) : (
                        <span className="text-xs text-green-600">
                          {productDetails.stock} sản phẩm
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-red-600">
                        Hết hàng
                      </span>
                    )}
                  </div>

                  {/* Thông tin chi tiết */}
                  <div className="bg-gray-50 p-3 rounded-lg mb-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      {productDetails.category !== 'spa' && (
                        <div className="flex items-start">
                          <FaWeightHanging className="h-3 w-3 text-gray-500 mt-0.5 mr-1" />
                          <div>
                            <p className="text-gray-600">Cân nặng:</p>
                            <p className="font-medium">{productDetails.weight || 'N/A'}</p>
                          </div>
                        </div>
                      )}
                      {productDetails.featured && (
                        <div className="flex items-center col-span-2">
                          <FaStar className="h-3 w-3 text-yellow-500 mr-1" />
                          <p className="text-yellow-600 font-medium">Sản phẩm nổi bật</p>
                        </div>
                      )}
                      {/* Hiển thị thông tin có thể làm quà hay không */}
                      <div className="flex items-center col-span-2">
                        <div className="w-3 h-3 rounded-full mr-1 mt-0.5" style={{ backgroundColor: productDetails.canBeGift ? '#10B981' : '#EF4444' }}></div>
                        <p className={`font-medium ${productDetails.canBeGift ? 'text-green-600' : 'text-red-600'}`}>
                          {productDetails.canBeGift ? 'Có thể làm quà tặng' : 'Không thể làm quà tặng'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mô tả */}
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Mô tả:</h4>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {productDetails.description}
                    </p>
                  </div>
                </div>

                {/* Nút hành động */}
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={handleEdit}
                    className="flex-1 flex justify-center items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                  >
                    <FaEdit className="mr-1 h-3.5 w-3.5" />
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={handleHideProduct}
                    disabled={productDetailsLoading}
                    className={`flex-1 flex justify-center items-center px-3 py-2 text-sm font-medium rounded-md ${
                      confirmHide
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } ${productDetailsLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {productDetailsLoading ? (
                      <LuEyeClosed className="animate-spin mr-1 h-3.5 w-3.5" />
                    ) : (
                      <FaEyeSlash className="mr-1 h-3.5 w-3.5" />
                    )}
                    {confirmHide ? 'Xác nhận ẩn?' : 'Ẩn sản phẩm'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dialog chỉnh sửa sản phẩm */}
      {showEditDialog && (
        <EditProductDialog
          productId={productId}
          onClose={handleCloseEditDialog}
          onProductUpdated={handleProductUpdated}
        />
      )}
    </div>
  );
};

export default ProductDetailDialogAdmin;