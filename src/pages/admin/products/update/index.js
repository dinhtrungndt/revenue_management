import React, { useState, useEffect } from 'react';
import {
  FaTimes, FaSave, FaUpload, FaSpinner, FaTag, FaLayerGroup,
  FaDollarSign, FaPencilAlt, FaWeightHanging, FaBoxOpen,
  FaStar, FaCamera, FaTrash
} from 'react-icons/fa';
import { APP_CONFIG } from '../../../../config';
import { ProductService } from '../../../../services/apiService';

const EditProductDialog = ({ productId, onClose, onProductUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    importPrice: '',
    price: '',
    description: '',
    weight: '',
    stock: '',
    featured: false,
    canBeGift: true,
  });
  const [originalImage, setOriginalImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [deleteImageMode, setDeleteImageMode] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setFetchLoading(true);
        setError(null);
        const response = await ProductService.getProductById(productId);
        const product = response;

        setFormData({
          name: product.name || '',
          category: product.category || 'dog',
          importPrice: product.importPrice || '', // Lấy giá nhập từ API
          price: product.price || '',
          description: product.description || '',
          weight: product.weight || '',
          stock: product.stock || '',
          featured: product.featured || false,
          canBeGift: product.canBeGift !== undefined ? product.canBeGift : true, // Cập nhật từ response
        });

        if (product.image) {
          setOriginalImage(product.image);
          setPreviewImage(product.image);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.message || 'Không thể tải thông tin sản phẩm');
      } finally {
        setFetchLoading(false);
      }
    };

    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'category') {
      const isSpa = value === 'spa';
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        weight: isSpa ? 'N/A' : prev.weight,
        stock: isSpa ? 999 : prev.stock,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setPreviewImage(URL.createObjectURL(file));
      setDeleteImageMode(false);
    }
  };

  const handleRemoveImage = () => {
    setDeleteImageMode(true);
    setNewImage(null);
    setPreviewImage(null);
  };

  const handleRestoreImage = () => {
    setDeleteImageMode(false);
    setNewImage(null);
    setPreviewImage(originalImage);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('importPrice', parseFloat(formData.importPrice)); // Thêm importPrice
      data.append('price', parseFloat(formData.price));
      data.append('description', formData.description);
      if (formData.category !== 'spa') {
        data.append('weight', formData.weight);
        data.append('stock', parseInt(formData.stock));
      }
      data.append('featured', formData.featured);
      data.append('canBeGift', formData.canBeGift); // Thêm trường canBeGift
      if (newImage) {
        data.append('image', newImage);
      } else if (deleteImageMode) {
        data.append('deleteImage', true);
      }

      await ProductService.updateProduct(productId, data);
      setSuccess(true);
      setTimeout(() => {
        if (onProductUpdated) onProductUpdated();
        onClose();
      }, 500);
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật sản phẩm');
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(price);
  };

  // Tính lợi nhuận dự kiến
  const calculateProfit = () => {
    if (formData.importPrice && formData.price) {
      const importPrice = parseFloat(formData.importPrice);
      const salePrice = parseFloat(formData.price);
      if (!isNaN(importPrice) && !isNaN(salePrice)) {
        const profit = salePrice - importPrice;
        const profitPercent = (profit / importPrice) * 100;
        return {
          amount: formatPrice(profit),
          percent: profitPercent.toFixed(2)
        };
      }
    }
    return { amount: '-', percent: '-' };
  };

  const profit = calculateProfit();

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  if (fetchLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-lg mx-3" onClick={stopPropagation}>
          <div className="text-center">
            <FaSpinner className="mx-auto h-6 w-6 text-blue-600 animate-spin" />
            <p className="mt-2 text-xs sm:text-sm text-gray-600">Đang tải thông tin sản phẩm...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto px-2 py-2" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto my-2 max-h-[90vh] overflow-y-auto"
        onClick={stopPropagation}
      >
        {error && (
          <div className="m-2 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md animate-pulse">
            <div className="flex items-start">
              <svg className="h-4 w-4 text-red-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-xs font-medium text-red-800">Lỗi!</h3>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        {success && (
          <div className="m-2 p-3 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md animate-pulse">
            <div className="flex items-start">
              <svg className="h-4 w-4 text-green-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-xs font-medium text-green-800">Thành công!</h3>
                <p className="text-xs text-green-700 mt-1">Cập nhật sản phẩm thành công!</p>
              </div>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="bg-blue-600 text-white p-3 flex items-center justify-between rounded-t-lg">
            <div className="flex items-center">
              <FaPencilAlt className="mr-1.5 text-white text-sm sm:text-base" />
              <h2 className="text-base sm:text-lg font-medium">Chỉnh sửa sản phẩm</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none p-1"
            >
              <FaTimes className="text-sm sm:text-base" />
            </button>
          </div>
          <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div className="form-group">
              <label htmlFor="name" className="flex items-center text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                <FaTag className="mr-1.5 text-blue-500 text-xs" />
                Tên sản phẩm
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                placeholder="Nhập tên sản phẩm"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="category" className="flex items-center text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                <FaLayerGroup className="mr-1.5 text-blue-500 text-xs" />
                Danh mục
              </label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg py-1.5 sm:py-2 px-2 sm:px-3 pr-8 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm appearance-none"
                  required
                >
                  {APP_CONFIG.PRODUCT_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="importPrice" className="flex items-center text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                <FaDollarSign className="mr-1.5 text-blue-500 text-xs" />
                Giá nhập (VND)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="importPrice"
                  name="importPrice"
                  value={formData.importPrice}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full border border-gray-300 rounded-lg py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  placeholder="Nhập giá nhập sản phẩm"
                  required
                />
                {formData.importPrice && (
                  <div className="mt-1 text-right text-xs text-blue-600 font-medium">
                    {formatPrice(formData.importPrice)}
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="price" className="flex items-center text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                <FaDollarSign className="mr-1.5 text-blue-500 text-xs" />
                Giá bán (VND)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full border border-gray-300 rounded-lg py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  placeholder="Nhập giá bán sản phẩm"
                  required
                />
                {formData.price && (
                  <div className="mt-1 text-right text-xs text-blue-600 font-medium">
                    {formatPrice(formData.price)}
                  </div>
                )}
              </div>
            </div>
            {formData.importPrice && formData.price && (
              <div className="form-group">
                <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-800 mb-1">Lợi nhuận dự kiến:</p>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">{profit.amount}</span>
                    <span className="text-sm font-medium bg-green-100 px-2 py-0.5 rounded-full text-green-800">
                      {profit.percent}%
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="form-group">
              <label htmlFor="description" className="flex items-center text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                <FaPencilAlt className="mr-1.5 text-blue-500 text-xs" />
                Mô tả
              </label>
              <textarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm resize-none"
                placeholder="Mô tả chi tiết về sản phẩm"
                required
              />
            </div>
            {formData.category !== 'spa' && (
              <>
                <div className="form-group">
                  <label htmlFor="weight" className="flex items-center text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    <FaWeightHanging className="mr-1.5 text-blue-500 text-xs" />
                    Cân nặng
                  </label>
                  <input
                    type="text"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    placeholder="VD: 2-3kg, 300g, 1.5kg,..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="stock" className="flex items-center text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    <FaBoxOpen className="mr-1.5 text-blue-500 text-xs" />
                    Số lượng tồn kho
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full border border-gray-300 rounded-lg py-1.5 sm:py-2 px-2 sm:px-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                    placeholder="Nhập số lượng tồn kho"
                    required
                  />
                </div>
              </>
            )}
            <div className="form-group">
              <div className="flex items-center bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200">
                <input
                  id="featured"
                  name="featured"
                  type="checkbox"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 flex items-center text-xs sm:text-sm text-gray-700">
                  <FaStar className="mr-1.5 text-yellow-500 text-xs" />
                  Đánh dấu là sản phẩm nổi bật
                </label>
              </div>
            </div>
            <div className="form-group">
              <div className="flex items-center bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200">
                <input
                  id="canBeGift"
                  name="canBeGift"
                  type="checkbox"
                  checked={formData.canBeGift}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="canBeGift" className="ml-2 flex items-center text-xs sm:text-sm text-gray-700">
                  Có thể dùng làm quà tặng
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Sản phẩm này sẽ xuất hiện trong danh sách quà tặng khi khách hàng thanh toán.
              </p>
            </div>
            <div className="form-group">
              <label htmlFor="image" className="flex items-center text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                <FaCamera className="mr-1.5 text-blue-500 text-xs" />
                Hình ảnh sản phẩm
              </label>
              {!previewImage ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-blue-500 transition-all"
                  onClick={() => document.getElementById('image').click()}>
                  <FaUpload className="mx-auto h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mb-1.5" />
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Nhấp để chọn ảnh hoặc kéo thả vào đây</p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 10MB</p>
                  {deleteImageMode && originalImage && (
                    <button
                      type="button"
                      onClick={handleRestoreImage}
                      className="mt-2 inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none"
                    >
                      Khôi phục ảnh cũ
                    </button>
                  )}
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </div>
              ) : (
                <div className="relative border rounded-lg overflow-hidden">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-28 sm:h-36 object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black bg-opacity-60 text-white p-1.5 text-xs truncate">
                    {newImage ? newImage.name : 'Ảnh hiện tại'}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 flex flex-row gap-2 border-t rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 flex items-center justify-center px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-xs sm:text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none"
            >
              <FaTimes className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 flex items-center justify-center px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-blue-600 text-white text-xs sm:text-sm font-medium shadow-sm hover:bg-blue-700 focus:outline-none ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <FaSave className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductDialog;